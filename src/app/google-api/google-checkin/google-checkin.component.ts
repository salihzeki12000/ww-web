import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Output, EventEmitter, Renderer } from '@angular/core';
import { Subscription } from 'rxjs/Rx';
declare var google:any;

import { User, UserService }  from '../../user';
import { LoadingService }     from '../../loading';
import { CheckInService }     from '../../check-in';

@Component({
  selector: 'ww-google-checkin',
  templateUrl: './google-checkin.component.html',
  styleUrls: ['./google-checkin.component.scss']
})
export class GoogleCheckinComponent implements OnInit, OnDestroy {
  @ViewChild('map') map: ElementRef;
  locationMap;
  marker;
  lat;
  lng;
  name;
  formatted_address;
  international_phone_number;
  website;
  country;
  placeId;
  photos;
  opening_hours;
  url;

  step1 = true;
  searchLocation = false;
  findLocation = false;
  searchDone = false;

  locationType = '';
  private = false;

  currentUserSubscription: Subscription;
  currentUser: User;

  @Output() cancelCheckIn = new EventEmitter<boolean>();

  constructor(
    private renderer: Renderer,
    private userService: UserService,
    private checkinService: CheckInService,
    private loadingService: LoadingService) { }

  ngOnInit() {
    this.currentUserSubscription = this.userService.updateCurrentUser.subscribe(
      result => {
        this.currentUser = result;
        this.private = this.currentUser['settings']['favourite'];
      })

    setTimeout(() => {this.initMap()},100);
  }

  ngOnDestroy() {
    if(this.currentUserSubscription) this.currentUserSubscription.unsubscribe();
  }

  initMap() {
    let mapDiv = this.map.nativeElement;

    this.locationMap = new google.maps.Map(mapDiv, {
      center: {lat: 0, lng: 0},
      zoom: 1,
      styles: [{"stylers": [{ "saturation": -20 }]}]
    })
  }


  // progress tracker

  backToSelect()  {
    this.step1 = true;
    this.findLocation = false;
    this.searchDone = false;
    this.searchLocation = false;

    this.clear();
    this.zoomOut();
  }

  backToSearch() {
    this.findLocation = true;
    this.searchDone = false;

    this.clear();
    this.zoomOut();
  }


  // seach location
  getSearch() {
    this.findLocation = true;
    this.searchDone = true;
    this.step1 = false;
  }

  getDetails(value)  {
    this.clear();

    this.lat = value['geometry'].location.lat();
    this.lng = value['geometry'].location.lng();
    this.placeId = value['place_id'];
    this.formatted_address = value['formatted_address'];
    this.international_phone_number = value['international_phone_number'];
    this.website = value['website'];
    this.name = value['name'];
    this.url = value['url'];

    this.getPhotos(value)
    this.opening_hours = this.getOpeningHours(value['opening_hours'])
    this.getCountry(value['address_components'])

    this.pinLocation(this.lat, this.lng);
  }

  getPhotos(value) {
    let index = 0;

    if(value.photos) {
      if(value.photos.length > 5)  {
        index = 5;
      } else  {
        index = value.photos.length
      }

      this.photos = [];
      for (let i = 0; i < index; i++) {
        let c = value.photos[i].html_attributions[0]
        this.photos.push({
          url: value.photos[i].getUrl({'maxWidth': 300, 'maxHeight': 250}),
          credit: c.slice(0,3) + 'target="_blank" ' + c.slice(3,c.length)
        });
      }
    }
  }

  getOpeningHours(hours)  {
    let openingHours = [];
    let openingHoursGroup = {};
    let output = '';

    if (hours === undefined) return '';

    //to handle 24hrs establishments
    if(hours.periods.length === 1) return "Open 24hrs";

    //reorgnise each day to open-close time
    for (let i = 0; i < hours.periods.length; i++) {
      openingHours.push(hours.periods[i].open.time + "hrs" + " - " + hours.periods[i].close.time + "hrs");
    }

    //group similar timings
    for (let i = 0; i < openingHours.length; i++) {
      if(openingHoursGroup[openingHours[i]])  {
        openingHoursGroup[openingHours[i]].push([i]);
      } else  {
        openingHoursGroup[openingHours[i]] = [];
        openingHoursGroup[openingHours[i]].push([i]);
      }
    }

    //to handle daily same timing
    for (let time in openingHoursGroup) {
      if(openingHoursGroup[time].length === 7 && Object.keys(openingHoursGroup).length === 1) return "Daily: " + time;
    }

    //to handle different timings
    for (let i = 0; i < hours.weekday_text.length; i++) {
      output += hours.weekday_text[i] + " \n";
    }
    return output;
  }

  getCountry(address)  {
    for (let i = 0; i < address.length; i++) {
      if(address[i]['types'][0] === 'country')  {
        let country = address[i]['long_name'];
        this.getCountryLatLng(country)
      }
    }
  }

  getCountryLatLng(country)  {
    let geocoder = new google.maps.Geocoder;

    geocoder.geocode({address: country}, (result, status) =>  {
      if(status === 'OK') {
        let lat = result[0]['geometry'].location.lat();
        let lng = result[0]['geometry'].location.lng();

        this.country = {
          name: country,
          lat: lat,
          lng: lng
        }
      }
    })
  }

  pinLocation(lat, lng)  {
    let center = new google.maps.LatLng(lat, lng);

    this.locationMap.panTo(center);
    this.locationMap.setZoom(17);

    if(this.marker !== undefined) {
      this.marker.setPosition({ lat: lat, lng: lng });
    } else  {
      this.marker = new google.maps.Marker({
        position: { lat: lat, lng: lng },
        map: this.locationMap,
        animation: google.maps.Animation.DROP,
        zIndex: 1,
        draggable: true
      })
    }

    let geocoder = new google.maps.Geocoder;

    google.maps.event.addListener(this.marker, 'dragend', (event) => {
      this.loadingService.setLoader(true, "Getting location address...");
      this.clear();

      this.lat = event.latLng.lat();
      this.lng = event.latLng.lng();

      this.getDragLocation(geocoder, this.lat, this.lng);
      this.locationType = 'Dragged';
    });
  }

  getDragLocation(geocoder, lat, lng) {
    geocoder.geocode({location: {lat:lat, lng:lng}}, (result, status) =>  {
      if(status === 'OK') {
        if(result[0]) {
          this.formatted_address = result[0]['formatted_address'];
          this.placeId = result[0]['place_id'];
          // this.getPlaceDetails(this.placeId)
          this.getCountry(result[0]['address_components'])

          this.loadingService.setLoader(false, "");
        }
      }
    })
  }

  // getPlaceDetails(placeId) {
  //   let request = { placeId: placeId };
  //   let service = new google.maps.places.PlacesService(this.locationMap);
  //
  //   service.getDetails(request, (result, status)  =>  {
  //   });
  // }

  zoomOut() {
    let center = new google.maps.LatLng(0, 0);

    this.locationMap.panTo(center);
    this.locationMap.setZoom(0);
  }


  // get current location
  getLocation() {
    this.loadingService.setLoader(true, "Getting your current location...");

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.clear();

        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;

        this.pinLocation(this.lat, this.lng);

        let geocoder = new google.maps.Geocoder;
        this.getDragLocation(geocoder, this.lat, this.lng);
        this.locationType = 'Current';

        this.loadingService.setLoader(false, "");

        this.step1 = false;
        this.searchDone = true;
      })
    }
  }

  clear() {
    this.lat = '';
    this.lng = '';
    this.name = '';
    this.formatted_address = '';
    this.international_phone_number = '';
    this.website = '';
    this.country = '';
    this.placeId = '';
    this.locationType = '';
    this.url = '';
    this.photos = [];
    this.opening_hours = '';
  }

  checkin() {
    this.loadingService.setLoader(true, "Saving your check in...");
    this.cancelCheckIn.emit();

    let checkin = {
      lat: this.lat,
      lng: this.lng,
      name: this.name,
      formatted_address: this.formatted_address,
      country: this.country,
      international_phone_number: this.international_phone_number,
      website: this.website,
      place_id: this.placeId,
      private: this.private,
      url: this.url,
      photos: this.photos,
      opening_hours: this.opening_hours,
      user: this.currentUser['_id']
    }

    this.checkinService.addCheckin(checkin).subscribe(
      result  =>  {
        this.loadingService.setLoader(false, "");
      }
    )
  }

}
