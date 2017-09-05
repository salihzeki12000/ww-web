import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Renderer2, HostListener } from '@angular/core';
import { Title }          from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Subscription }   from 'rxjs/Rx';

declare var google:any;
declare var MarkerClusterer:any;

import { FavouriteService }     from './favourite.service';
import { User, UserService }    from '../user';
import { LoadingService }       from '../loading';
import { FlashMessageService }  from '../flash-message';

@Component({
  selector: 'ww-favourite',
  templateUrl: './favourite.component.html',
  styleUrls: ['./favourite.component.scss']
})
export class FavouriteComponent implements OnInit, OnDestroy {
  @ViewChild('map') map: ElementRef;
  favMap;
  favs;
  displayFavs;
  locations = [];
  locationIds = [];

  countries = [];
  markers = [];
  infoWindows = [];

  favSubscription: Subscription;
  currentUserSubscription: Subscription;
  currentUser: User;

  showFav = false;
  selectedCountry; // for favourite filter

  showCountry = false;
  deleteFav = undefined;

  constructor(
    private titleService: Title,
    private renderer: Renderer2,
    private userService: UserService,
    private favouriteService: FavouriteService,
    private flashMessageService: FlashMessageService,
    private loadingService: LoadingService) { }

  ngOnInit() {
    this.titleService.setTitle("Favourite");

    this.currentUserSubscription = this.userService.updateCurrentUser.subscribe(
      result => {
        this.currentUser = result;
        this.favouriteService.getFavs(this.currentUser['_id']).subscribe(result =>{})
      })

    this.favSubscription = this.favouriteService.updateFavs.subscribe(
      result => {
        this.favs = result;
        this.displayFavs = Object.assign([], this.favs);
        this.initMap();
        this.setInitPan();
        this.setLocations();
        this.setCountries();

      })

  }

  ngOnDestroy() {
    if(this.currentUserSubscription) this.currentUserSubscription.unsubscribe();
    if(this.favSubscription) this.favSubscription.unsubscribe();

    this.loadingService.setLoader(true, "");
  }

  @HostListener('document:click', ['$event'])
  checkClick(event) {
    if(!event.target.classList.contains("country-dropdown") &&
      !event.target.classList.contains("select-country")) {
      this.showCountry = false;
    }

    if(!event.target.classList.contains("country-dropdown") &&
      !event.target.classList.contains("filter-fav") &&
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

  setInitPan()  {
    for (let i = 0; i < this.favs.length; i++) {
      if(this.favs[i]['place']['lat'])  {
        let panTo = {
          lat: 0,
          lng: this.favs[i]['place']['lng'],
          zoom: 2
        }

        this.changeCenter(panTo);
        break;
      }
    }
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

    this.setMarkers(this.favMap);
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

    if(this.favs.length > 0)  {
      this.countries.unshift({name: 'Show all', lat: 0, lng: this.favs[0]['place']['lng'], zoom: 2})
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

      if(l['lat'])  {
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
          let favourite = this.locations[i]['created_at'][j];
          let date = new Date(favourite);
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
    }

    let imagePath = 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'

    let markerCluster = new MarkerClusterer(map, this.markers, {
            maxZoom: 15,
            imagePath: imagePath
          });

    this.loadingService.setLoader(false, "");
    this.preventScroll(false);
  }




  // filter favourite by country

  filterFavs(country) {
    if(country === 'Show all')  {
      this.displayFavs = this.favs;
    } else  {
      this.displayFavs = Object.assign([], this.favs).filter(
        favourite => favourite['place']['country']['name'] === country
      )
    }
  }




  // center map base on country

  changeCenter(country) {
    let center = new google.maps.LatLng(country['lat'], country['lng']);

    this.favMap.panTo(center);
    this.favMap.setZoom(country['zoom']);

    this.showCountry = false;
  }




  // zoom to particular location

  zoomTo(place) {
    if(place['lat'])  {
      let center = new google.maps.LatLng(place['lat'], place['lng']);

      this.openInfoWindow(place['lat'], place['lng'])
      this.favMap.panTo(center);
      this.favMap.setZoom(17);

      this.showFav = false;
    }
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




  // delete favourite

  delete(fav)  {
    this.deleteFav = fav;
    this.preventScroll(true);
  }

  cancelDelete()  {
    this.deleteFav = undefined;
    this.preventScroll(false);
  }

  confirmDelete() {
    this.loadingService.setLoader(true, "Deleting your favourite...");

    this.favouriteService.deleteFav(this.deleteFav).subscribe(
      result =>{
        this.deleteFav = undefined;
        this.flashMessageService.handleFlashMessage("Favourite deleted");
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
