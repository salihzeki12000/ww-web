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
  address;
  country;
  placeId;
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

  getDetails(value)  {
    this.clear();

    this.lat = value['geometry'].location.lat();
    this.lng = value['geometry'].location.lng();
    this.placeId = value['place_id'];
    this.address = value['formatted_address'];
    this.name = value['name'];

    this.getCountry(value['address_components'])

    this.pinLocation(this.lat, this.lng);
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
          this.address = result[0]['formatted_address'];
          this.placeId = result[0]['place_id'];

          this.getCountry(result[0]['address_components'])

          this.loadingService.setLoader(false, "");
        }
      }
    })
  }

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
      })
    }
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

  clear() {
    this.lat = '';
    this.lng = '';
    this.name = '';
    this.address = '';
    this.country = '';
    this.placeId = '';
    this.locationType = '';
  }

  checkin() {
    this.loadingService.setLoader(true, "Saving your check in...");
    this.cancelCheckIn.emit();

    let checkin = {
      lat: this.lat,
      lng: this.lng,
      name: this.name,
      address: this.address,
      country: this.country,
      place_id: this.placeId,
      private: this.private,
      user: this.currentUser['_id']
    }

    this.checkinService.addCheckin(checkin).subscribe(
      result  =>  {
        this.loadingService.setLoader(false, "");
      }
    )
  }

}
