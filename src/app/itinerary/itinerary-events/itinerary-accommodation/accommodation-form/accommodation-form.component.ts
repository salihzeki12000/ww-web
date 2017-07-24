import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, HostListener, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs/Rx';
declare var google:any;

import { Itinerary }             from '../../../itinerary';
import { ItineraryService }      from '../../../itinerary.service';
import { ItineraryEvent }        from '../../itinerary-event';
import { ItineraryEventService } from '../../itinerary-event.service';

import { UserService }         from '../../../../user';
import { FlashMessageService } from '../../../../flash-message';
import { FileuploadService }   from '../../../../shared';
import { LoadingService }      from '../../../../loading';

@Component({
  selector: 'ww-accommodation-form',
  templateUrl: './accommodation-form.component.html',
  styleUrls: ['./accommodation-form.component.scss']
})
export class AccommodationFormComponent implements OnInit, OnDestroy {
  @ViewChild('map') map: ElementRef;
  locationMap;
  marker;
  dragLat;
  dragLng;
  dragAddress;
  dragPlaceId;
  country;

  @Output() hideAccommodationForm = new EventEmitter();

  addAccommodationForm: FormGroup;
  details;

  // time picker
  ats = true;
  initHourIn = '15';
  initMinuteIn = "00";
  timePickerIn = false;
  hourIn = "15";
  minuteIn = "00";

  initHourOut = '12';
  initMinuteOut = "00";
  timePickerOut = false;
  hourOut = "12";
  minuteOut = "00";

  searchDone = false;

  itinDateSubscription: Subscription;
  itinDateRange = [];
  firstDay;
  lastDay;
  timeCheckIn = "15:00";
  timeCheckOut = "12:00";

  currentUserSubscription: Subscription;
  currentUser;

  currentItinerarySubscription: Subscription;
  currentItinerary;

  pictureOptions = [];
  displayPic;
  uploadPic;
  newImageFile = '';

  inputValue = '';
  fileTypeError = false;

  constructor(
    private itineraryService: ItineraryService,
    private itineraryEventService: ItineraryEventService,
    private userService: UserService,
    private flashMessageService: FlashMessageService,
    private fileuploadService: FileuploadService,
    private loadingService: LoadingService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder) {
      this.addAccommodationForm = this.formBuilder.group({
        'name': ['', Validators.required],
        'Oname': '',
        'formatted_address': '',
        'country': '',
        'lat': '',
        'lng': '',
        'website': '',
        'international_phone_number': '',
        'check_in_date': '',
        'check_out_date': '',
        'check_in_time': this.timeCheckIn,
        'check_out_time': this.timeCheckOut,
        'stay_city':'',
        'note': '',
        'url': '',
        'place_id': '',
      })
    }

  ngOnInit() {
    this.currentUserSubscription = this.userService.updateCurrentUser.subscribe(
                                        result => { this.currentUser = result; })

    this.currentItinerarySubscription = this.itineraryService.currentItinerary.subscribe(
                                             result => { this.currentItinerary = result; })

    this.itinDateSubscription = this.itineraryService.updateDate.subscribe(
                                      result => {
                                        this.itinDateRange  = Object.keys(result).map(key => result[key]);
                                        this.itinDateRange.splice(0,1)
                                        this.firstDay = this.itinDateRange[0];
                                        this.lastDay = this.itinDateRange[this.itinDateRange.length - 1];
                                    })

    setTimeout(() => {this.initMap()},100);
  }

  @HostListener('document:click', ['$event'])
  checkClick(event) {
    if(!event.target.classList.contains("time-picker-dropdown") &&
      !event.target.classList.contains("time") &&
      !event.target.classList.contains("time-select") &&
      !event.target.classList.contains("selected-time")) {
      this.timePickerIn = false;
      this.timePickerOut = false;
    }
  }

  ngOnDestroy() {
    this.currentUserSubscription.unsubscribe();
    this.currentItinerarySubscription.unsubscribe();
    this.itinDateSubscription.unsubscribe();
  }

  initMap() {
    let mapDiv = this.map.nativeElement;

    this.locationMap = new google.maps.Map(mapDiv, {
      center: {lat: 0, lng: 0},
      zoom: 1,
      styles: [{"stylers": [{ "saturation": -20 }]}]
    })
  }

  // progress bar
  backToSearch() {
    this.searchDone = false;
    this.addAccommodationForm.reset();
    this.displayPic = undefined;
    this.pictureOptions = [];
    this.dragAddress = '';
    this.marker = undefined;
    this.details = undefined;

    setTimeout(() => {this.initMap()}, 100)
  }

  // get place details from Google
  getAccommodationDetails(value)  {
    this.details = value;

    let lat = value['geometry'].location.lat();
    let lng = value['geometry'].location.lng();

    this.pinLocation(lat, lng)
    this.dragAddress = '';

    let address_components = value['address_components'];

    for (let i = 0; i < address_components.length; i++) {
      if(address_components[i]['types'][0] === 'locality')  {
        value['stay_city'] = address_components[i]['long_name'];
      } else if(address_components[i]['types'][0] === 'administrative_area_level_1') {
        value['stay_city'] += ', ' + address_components[i]['long_name'];
      }
    }

    this.getCountry(address_components);

    this.addAccommodationForm.patchValue({
      Oname: value.name,
      name: value.name,
      formatted_address: value.formatted_address,
      lat: lat,
      lng: lng,
      website: value.website,
      international_phone_number: value.international_phone_number,
      check_in_date: this.firstDay,
      check_out_date: this.lastDay,
      check_in_time: this.timeCheckIn,
      check_out_time: this.timeCheckOut,
      stay_city: value.stay_city,
      url: value.url,
      place_id: value.place_id,
      note: ""
    })

    let index = 0;

    if(value.photos) {
      let credit = value.photos[0].html_attributions[0];
      this.displayPic = {
        url: value.photos[0].getUrl({'maxWidth': 300, 'maxHeight': 250}),
        credit: credit.slice(0,3) + 'target="_blank" ' + credit.slice(3,credit.length)
      };
      if(value.photos.length > 5)  {
        index = 5;
      } else  {
        index = value.photos.length
      }

      this.pictureOptions = [];
      for (let i = 0; i < index; i++) {
        let c = value.photos[i].html_attributions[0]
        this.pictureOptions.unshift({
          url: value.photos[i].getUrl({'maxWidth': 300, 'maxHeight': 250}),
          credit: c.slice(0,3) + 'target="_blank" ' + c.slice(3,c.length)
        });
      }
    }
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

      this.dragLat = event.latLng.lat();
      this.dragLng = event.latLng.lng();

      this.getDragLocation(geocoder, this.dragLat, this.dragLng);
    });
  }

  getDragLocation(geocoder, lat, lng) {
    geocoder.geocode({location: {lat:lat, lng:lng}}, (result, status) =>  {
      if(status === 'OK') {
        if(result[0]) {
          this.dragAddress = result[0]['formatted_address'];
          this.dragPlaceId = result[0]['place_id'];

          this.getCountry(result[0]['address_components'])

          this.loadingService.setLoader(false, "");
          this.patchLocationData();
        }
      }
    })
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

  patchLocationData() {
    this.addAccommodationForm.reset();
    this.displayPic = '';
    this.pictureOptions = [];
    this.details = undefined;

    this.details = {
      formatted_address: this.dragAddress,
    }

    this.addAccommodationForm.patchValue({
      check_in_date: this.firstDay,
      check_out_date: this.lastDay,
      check_in_time: this.timeCheckIn,
      check_out_time: this.timeCheckOut,
      formatted_address: this.dragAddress,
      lat: this.dragLat,
      lng: this.dragLng,
      place_id: this.dragPlaceId
    })
  }

  // select check in time
  selectPickerIn()  {
    this.timePickerIn = true;
  }

  selectHourIn(h) {
    this.hourIn = h;
  }

  selectMinuteIn(m) {
    this.minuteIn = m;
  }

  // select check out time
  selectPickerOut()  {
    this.timePickerOut = true;
  }

  selectHourOut(h) {
    this.hourOut = h;
  }

  selectMinuteOut(m) {
    this.minuteOut = m;
  }

  // select picture as display pic
  selectPic(image)  {
    this.displayPic = image;
  }

  fileUploaded(event) {
    let file = event.target.files[0];
    let type = file['type'].split('/')[0]

    if (type !== 'image') {
      this.fileTypeError = true;
    } else  {
      if(event.target.files[0]) {
        this.newImageFile = event.target.files[0];
        let reader = new FileReader();

        reader.onload = (event) =>  {
          this.uploadPic = event['target']['result'];
        }

        reader.readAsDataURL(event.target.files[0]);
        return;
      }
    }
  }

  deleteUpload() {
    this.inputValue = null;
    this.uploadPic = '';
    this.newImageFile = '';
  }

  // save
  saveNew()  {
    let newAccommodation = this.addAccommodationForm.value;
    if(this.displayPic)  {
      newAccommodation['photo'] = this.displayPic;
    }

    if(this.hourIn === 'anytime') {
      newAccommodation['check_in_time'] = 'anytime';
    } else  {
      newAccommodation['check_in_time'] = this.hourIn + ':' + this.minuteIn;
    }

    if(this.hourOut === 'anytime') {
      newAccommodation['check_out_time'] = 'anytime';
    } else  {
      newAccommodation['check_out_time'] = this.hourOut + ':' + this.minuteOut;
    }

    newAccommodation['photos'] = this.pictureOptions;
    newAccommodation['country'] = this.country;
    newAccommodation['date'] = newAccommodation['check_in_date'];
    newAccommodation['time'] = newAccommodation['check_in_time'];
    newAccommodation['type'] = 'accommodation';
    newAccommodation['created_at'] = new Date();
    newAccommodation['location'] = true;
    newAccommodation['user'] =  {
      _id: this.currentUser['_id'],
      username: this.currentUser['username'],
    }

    if(this.newImageFile !== '')  {
      this.fileuploadService.uploadFile(this.newImageFile, "event")
          .subscribe(
            result => {
              newAccommodation['photo'] = {
                url:result.secure_url,
                credit: ""
              };

              this.addEvent(newAccommodation);
            })
    } else  {
      this.addEvent(newAccommodation);
    }

    this.hideAccommodationForm.emit(false)
  }

  addEvent(accommodation)  {
    this.itineraryEventService.addEvent(accommodation, this.currentItinerary)
        .subscribe(
          result => {
            if(this.route.snapshot['_urlSegment'].segments[3].path !== 'accommodation') {
              let id = this.route.snapshot['_urlSegment'].segments[2].path;
              this.router.navigateByUrl('/me/itinerary/' + id + '/accommodation');
            }
            this.flashMessageService.handleFlashMessage(result.message);
            this.inputValue = null;
            this.uploadPic = '';
            this.newImageFile = '';
          })
  }

  cancelForm()  {
    this.hideAccommodationForm.emit(false)
  }

}
