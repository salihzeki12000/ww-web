import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Renderer2, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription }   from 'rxjs/Rx';
import { Title }        from '@angular/platform-browser';

declare var google:any;
declare var MarkerClusterer:any;

import { FavouriteService } from '../../favourite';
import { LoadingService }   from '../../loading';
import { UserService }      from '../user.service';

@Component({
  selector: 'ww-user-favourite',
  templateUrl: './user-favourite.component.html',
  styleUrls: ['./user-favourite.component.scss']
})
export class UserFavouriteComponent implements OnInit, OnDestroy {
  @ViewChild('map') map: ElementRef;
  favMap;
  favs;
  locations = [];
  locationIds = [];

  countries = [];
  markers = [];
  infoWindows = [];

  favSubscription: Subscription;
  userSubscription: Subscription;

  showFav = false;
  showCountry = false;

  constructor(
    private titleService: Title,
    private renderer: Renderer2,
    private userService: UserService,
    private loadingService: LoadingService,
    private favouriteService: FavouriteService) { }

  ngOnInit() {
    setTimeout(() =>  {
      this.initMap();
    }, 100)

    this.favSubscription = this.favouriteService.updateFavs.subscribe(
      result => { this.filterFav(result); })
  }

  ngOnDestroy() {
    if(this.favSubscription) this.favSubscription.unsubscribe();

    this.userSubscription = this.userService.updateDisplayUser.subscribe(
      result => {
        this.titleService.setTitle(result['username'] + ' | Favourites')
      })
  }

  @HostListener('document:click', ['$event'])
  checkClick(event) {
    if(!event.target.classList.contains("country-dropdown") &&
      !event.target.classList.contains("select-country")) {
      this.showCountry = false;
    }

    if(!event.target.classList.contains("country-dropdown") &&
      !event.target.classList.contains("select-favs")) {
      this.showFav = false;
    }
  }

  initMap() {
    let mapDiv = this.map.nativeElement;
    let center = {lat: 25, lng: 0};
    let zoom = 3;

    this.favMap = new google.maps.Map(mapDiv, {
      center: center,
      zoom: zoom,
      styles: [{"stylers": [{ "saturation": -20 }]}]
    });
  }

  filterFav(favs) {
    for (let i = 0; i < favs.length; i++) {
      if(favs[i]['private'])  {
        favs.splice(i,1);
        i--
      };
    }

    this.favs = favs;
    this.setLocations();
    this.setCountries();
  }

  setLocations()  {
    this.locations = [];
    this.locationIds = [];

    for (let i = 0; i < this.favs.length; i++) {
      let index = this.locationIds.indexOf(this.favs[i]['place']['_id']);

      this.favs[i]['place']['created_at'] = [this.favs[i]['created_at']];

      if(index < 0) {
        this.locations.push(this.favs[i]['place']);
        this.locationIds.push(this.favs[i]['place']['_id'])
      } else if (index >= 0)  {
        this.locations[index]['created_at'].push(this.favs[i]['created_at'])
      }
    }
    setTimeout(() =>  {
      this.setMarkers();
    },500)
  }

  setCountries()  {
    this.countries = [];
    let countryName = [];

    for (let i = 0; i < this.favs.length; i++) {
      let index = countryName.indexOf(this.favs[i]['place']['country']['name']);

      if(index < 0) {
        this.favs[i]['place']['country']['zoom'] = 6;
        this.countries.push(this.favs[i]['place']['country']);
        countryName.push(this.favs[i]['place']['country']['name']);
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

  setMarkers() {
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
        map: this.favMap,
        title: title,
        zIndex: i
      })

      this.markers.push(marker);

      let created_at_string = '';

      for (let j = 0; j < this.locations[i]['created_at'].length; j++) {
        let fav = this.locations[i]['created_at'][j];
        let date = new Date(fav);
        let options = { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute:'numeric' };
        let created_at = date.toLocaleString('en-GB', options) + '<br>';

        created_at_string += created_at;
      }

      let content = '<div>' +
        '<h4>' + l['name'] + '</h4>' +
        '<h5>' +  l['formatted_address'] + '</h5>' +
        '<h6>' + created_at_string + '</h6>' +
        '</div>';

      let infoWindow = new google.maps.InfoWindow({
        content: content
      })

      this.infoWindows.push(infoWindow);

      marker.addListener('click', () => {
        infoWindow.open(this.favMap, marker)
        let center = new google.maps.LatLng(l['lat'], l['lng'])

        this.favMap.panTo(center);
        this.favMap.setZoom(17);
      })
    }

    let imagePath = 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'

    let markerCluster = new MarkerClusterer(this.favMap, this.markers, {
            maxZoom: 15,
            imagePath: imagePath
          });

    this.loadingService.setLoader(false, "");
    this.preventScroll(false);
  }



  // change center to country

  changeCenter(country) {
    let center = new google.maps.LatLng(country['lat'], country['lng']);

    this.favMap.panTo(center);
    this.favMap.setZoom(country['zoom']);

    this.showCountry = false;
  }


  // zoom to favourite location

  zoomTo(place) {
    let center = new google.maps.LatLng(place['lat'], place['lng']);

    this.openInfoWindow(place['lat'], place['lng'])
    this.favMap.panTo(center);
    this.favMap.setZoom(17);

    this.showFav = false;
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



  // others

  preventScroll(value)  {
    if(value) {
      this.renderer.addClass(document.body, 'prevent-scroll');
    } else  {
      this.renderer.removeClass(document.body, 'prevent-scroll');
    }
  }
}
