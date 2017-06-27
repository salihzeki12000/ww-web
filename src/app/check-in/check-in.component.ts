import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Renderer2, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Rx';

declare var google:any;
declare var MarkerClusterer:any;

import { CheckInService }     from './check-in.service';
import { User, UserService }  from '../user';
import { LoadingService }     from '../loading';

@Component({
  selector: 'ww-check-in',
  templateUrl: './check-in.component.html',
  styleUrls: ['./check-in.component.scss']
})
export class CheckInComponent implements OnInit, OnDestroy {
  @ViewChild('map') map: ElementRef;
  itinMap;
  checkins;
  locations = [];
  locationIds = [];

  countries = [];
  markers = [];
  infoWindows = [];

  checkInSubscription: Subscription;
  currentUserSubscription: Subscription;
  currentUser: User;

  showCheckIn = false;
  zoom = false;
  deleteCheckIn = undefined;

  constructor(
    private renderer: Renderer2,
    private userService: UserService,
    private checkinService: CheckInService,
    private loadingService: LoadingService) { }

  ngOnInit() {
    this.currentUserSubscription = this.userService.updateCurrentUser.subscribe(
      result => {
        this.currentUser = result;
        this.checkinService.getCheckins(this.currentUser['_id']).subscribe(result =>{})
      })

    this.checkInSubscription = this.checkinService.updateCheckIns.subscribe(
      result => {
        this.checkins = result;
        console.log(this.checkins);
        this.initMap();
        this.setLocations();
        this.setCountries();
      })

  }

  ngOnDestroy() {
    if(this.currentUserSubscription) this.currentUserSubscription.unsubscribe();
    if(this.checkInSubscription) this.checkInSubscription.unsubscribe();
    this.loadingService.setLoader(true, "");
  }

  @HostListener('document:click', ['$event'])
  checkClick(event) {
    if(!event.target.classList.contains("country-dropdown") &&
      !event.target.classList.contains("checkin-dropdown") &&
      !event.target.classList.contains("drop-down")) {
      this.zoom = false;
      this.showCheckIn = false;
    }
  }

  initMap() {
    let mapDiv = this.map.nativeElement;
    let center = {lat: 25, lng: 0};
    let zoom = 3;

    this.itinMap = new google.maps.Map(mapDiv, {
      center: center,
      zoom: zoom,
      styles: [{"stylers": [{ "saturation": -20 }]}]
    });
  }

  setLocations()  {
    this.locations = [];
    this.locationIds = [];

    for (let i = 0; i < this.checkins.length; i++) {
      let index = this.locationIds.indexOf(this.checkins[i]['place']['_id']);

      this.checkins[i]['place']['created_at'] = [this.checkins[i]['created_at']];

      if(index < 0) {
        this.locations.push(this.checkins[i]['place']);
        this.locationIds.push(this.checkins[i]['place']['_id'])
      } else if (index >= 0)  {
        this.locations[index]['created_at'].push(this.checkins[i]['created_at'])
      }
    }

    this.setMarkers(this.itinMap);
  }

  setCountries()  {
    this.countries = [];
    let countryName = [];

    for (let i = 0; i < this.checkins.length; i++) {
      let index = countryName.indexOf(this.checkins[i]['place']['country']['name']);

      if(index < 0) {
        this.checkins[i]['place']['country']['zoom'] = 6;
        this.countries.push(this.checkins[i]['place']['country']);
        countryName.push(this.checkins[i]['place']['country']['name']);
      }
    }
    this.countries = this.sortCountries();
    this.countries.unshift({name: 'Global view', lat: 25, lng: 0, zoom: 3})
  }

  sortCountries() {
    this.countries.sort((a,b) =>  {
      if(a['name'] < b['name']) return -1;
      if(a['name'] > b['name']) return 1;
      return 0;
    })
    return this.countries;
  }

  setMarkers(map) {
    this.markers = [];

    for (let i = 0; i < this.locations.length; i++) {
      let l = this.locations[i];
      let title;

      if(l['name'] !== '') {
        title = l['name'];
      } else  {
        title = l['address']
      }

      let marker = new google.maps.Marker({
        position: { lat: l['lat'], lng: l['lng']},
        map: map,
        title: title,
        zIndex: i
      })

      this.markers.push(marker);

      let created_at_string = '';

      for (let j = 0; j < this.locations[i]['created_at'].length; j++) {
        let checkIn = this.locations[i]['created_at'][j];
        let date = new Date(checkIn);
        let options = { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute:'numeric' };
        let created_at = date.toLocaleString('en-GB', options) + '<br>';

        created_at_string += created_at;
      }

      let content = '<div>' +
        '<h4>' + l['name'] + '</h4>' +
        '<h5>' +  l['address'] + '</h5>' +
        '<h6>' + created_at_string + '</h6>' +
        '</div>';

      let infoWindow = new google.maps.InfoWindow({
        content: content
      })

      this.infoWindows.push(infoWindow);

      marker.addListener('click', () => {
        infoWindow.open(map, marker)
        let center = new google.maps.LatLng(l['lat'], l['lng'])

        map.panTo(center);
        map.setZoom(17);
      })
    }
    let imagePath = 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'

    let markerCluster = new MarkerClusterer(map, this.markers, {
            maxZoom: 15,
            imagePath: imagePath
          });

    this.loadingService.setLoader(false, "");
    this.preventScroll(false);
  }

  changeCenter(country) {
    let center = new google.maps.LatLng(country['lat'], country['lng']);

    this.itinMap.panTo(center);
    this.itinMap.setZoom(country['zoom']);

    this.zoom = false;
  }

  zoomTo(place) {
    let center = new google.maps.LatLng(place['lat'], place['lng']);

    this.openInfoWindow(place['lat'], place['lng'])
    this.itinMap.panTo(center);
    this.itinMap.setZoom(17);

    this.showCheckIn = false;
  }

  openInfoWindow(lat, lng)  {
    for (let i = 0; i < this.infoWindows.length; i++) {
      this.infoWindows[i].close();
    }

    for (let i = 0; i < this.markers.length; i++) {
      let mlat = this.markers[i]['position'].lat().toFixed(6);
      let mlng = this.markers[i]['position'].lng().toFixed(6);
      let placeLat = lat.toFixed(6);
      let placeLng = lng.toFixed(6);

      if((placeLat == mlat) && (placeLng == mlng))  {
        google.maps.event.trigger(this.markers[i], 'click');
      }
    }
  }

  delete(checkin)  {
    this.deleteCheckIn = checkin;
    this.preventScroll(true);
  }

  cancelDelete()  {
    this.deleteCheckIn = undefined;
    this.preventScroll(false);
  }

  confirmDelete() {
    this.loadingService.setLoader(true, "Deleting your check in...");

    this.checkinService.deleteCheckin(this.deleteCheckIn).subscribe(
      result =>{
        this.deleteCheckIn = undefined;
      })

    this.loadingService.setLoader(false, "");
    this.preventScroll(false);
  }

  preventScroll(value)  {
    if(value) {
      this.renderer.addClass(document.body, 'prevent-scroll');
    } else  {
      this.renderer.removeClass(document.body, 'prevent-scroll');
    }
  }

}
