import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Renderer2, HostListener } from '@angular/core';
import { Title }          from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Subscription }   from 'rxjs/Rx';

declare var google:any;
declare var MarkerClusterer:any;

import { CheckInService }       from './check-in.service';
import { User, UserService }    from '../user';
import { LoadingService }       from '../loading';
import { FlashMessageService }  from '../flash-message';

@Component({
  selector: 'ww-check-in',
  templateUrl: './check-in.component.html',
  styleUrls: ['./check-in.component.scss']
})
export class CheckInComponent implements OnInit, OnDestroy {
  @ViewChild('map') map: ElementRef;
  checkinMap;
  checkins;
  displayCheckins;
  locations = [];
  locationIds = [];

  countries = [];
  markers = [];
  infoWindows = [];

  checkInSubscription: Subscription;
  currentUserSubscription: Subscription;
  currentUser: User;

  showCheckIn = false;
  selectedCountry; // for check in filter

  showCountry = false;
  deleteCheckIn = undefined;

  constructor(
    private titleService: Title,
    private renderer: Renderer2,
    private userService: UserService,
    private checkinService: CheckInService,
    private flashMessageService: FlashMessageService,
    private loadingService: LoadingService) { }

  ngOnInit() {
    this.titleService.setTitle("Check in");

    this.currentUserSubscription = this.userService.updateCurrentUser.subscribe(
      result => {
        this.currentUser = result;
        this.checkinService.getCheckins(this.currentUser['_id']).subscribe(result =>{})
      })

    this.checkInSubscription = this.checkinService.updateCheckIns.subscribe(
      result => {
        this.checkins = result;
        this.displayCheckins = Object.assign([], this.checkins);
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
      !event.target.classList.contains("select-country")) {
      this.showCountry = false;
    }

    if(!event.target.classList.contains("country-dropdown") &&
      !event.target.classList.contains("filter-check-in") &&
      !event.target.classList.contains("select-checkins")) {
      this.showCheckIn = false;
    }
  }

  initMap() {
    let mapDiv = this.map.nativeElement;
    let center = {lat: 25, lng: 0};
    let zoom = 3;

    this.checkinMap = new google.maps.Map(mapDiv, {
      center: center,
      zoom: zoom,
      styles: [{"stylers": [{ "saturation": -20 }]}]
    });
  }

  setLocations()  {
    if(this.checkins.length > 0)  {
      let panTo = {
        lat: 0,
        lng: this.checkins[0]['place']['lng'],
        zoom: 2
      }

      this.changeCenter(panTo);
    }

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

    this.setMarkers(this.checkinMap);
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

    if(this.checkins.length > 0)  {
      this.countries.unshift({name: 'Show all', lat: 0, lng: this.checkins[0]['place']['lng'], zoom: 2})
    }

    if(this.countries.length > 0) {
      this.selectedCountry = this.countries[0]['name'];
    }
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
    this.infoWindows = [];

    for (let i = 0; i < this.locations.length; i++) {
      let l = this.locations[i];
      let title;

      if(l['name'] === undefined) l['name'] = '';
      if(l['name'] !== '') {
        title = l['name'];
      } else  {
        title = l['formatted_address']
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
                      '<h4 style="padding: 5px 0;">' + l['name'] + '</h4>' +
                      '<h5 style="padding: 5px 0;">' +  l['formatted_address'] + '</h5>' +
                      '<h6 style="padding: 5px 0;">' + created_at_string + '</h6>' +
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




  // filter check in by country

  filterCheckins(country) {
    if(country === 'Show all')  {
      this.displayCheckins = this.checkins;
    } else  {
      this.displayCheckins = Object.assign([], this.checkins).filter(
        checkin => checkin['place']['country']['name'] === country
      )
    }
  }




  // center map base on country

  changeCenter(country) {
    let center = new google.maps.LatLng(country['lat'], country['lng']);

    this.checkinMap.panTo(center);
    this.checkinMap.setZoom(country['zoom']);

    this.showCountry = false;
  }




  // zoom to particular location

  zoomTo(place) {
    let center = new google.maps.LatLng(place['lat'], place['lng']);

    this.openInfoWindow(place['lat'], place['lng'])
    this.checkinMap.panTo(center);
    this.checkinMap.setZoom(17);

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




  // delete check in

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
        this.flashMessageService.handleFlashMessage("Check in deleted");
      })

    this.loadingService.setLoader(false, "");
    this.preventScroll(false);
  }



  // others

  preventScroll(value)  {
    if(value) {
      this.renderer.addClass(document.body, 'prevent-scroll');
    } else  {
      this.renderer.removeClass(document.body, 'prevent-scroll');
    }
  }

}
