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
import { CountryService }      from '../../../../countries';
import { PlaceService }        from '../../../../places';

@Component({
  selector: 'ww-accommodation-form',
  templateUrl: './accommodation-form.component.html',
  styleUrls: ['./accommodation-form.component.scss']
})
export class AccommodationFormComponent implements OnInit, OnDestroy {
  @ViewChild('map') map: ElementRef;
  @ViewChild('form') form:ElementRef;
  locationMap;
  marker;
  dragLat;
  dragLng;
  dragAddress;
  country;
  newPlace;
  @Input() date;
  @Output() hideAccommodationForm = new EventEmitter();
  @Output() changeRoute = new EventEmitter();

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

  step1 = true;
  searchDone = false;

  dateSubscription: Subscription;
  dateRange = [];
  outDateRange = [];
  outRange = [];
  months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  dayWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  firstDay;
  lastDay;
  timeCheckIn = "15:00";
  timeCheckOut = "12:00";

  currentUserSubscription: Subscription;
  currentUser;

  itinerarySubscription: Subscription;
  itinerary;

  pictureOptions = [];
  displayPic;
  uploadPic;
  newImageFile = '';

  inputValue = '';
  fileTypeError = false;

  countries;
  countriesName;

  constructor(
    private itineraryService: ItineraryService,
    private itineraryEventService: ItineraryEventService,
    private userService: UserService,
    private flashMessageService: FlashMessageService,
    private fileuploadService: FileuploadService,
    private loadingService: LoadingService,
    private countryService: CountryService,
    private placeService: PlaceService,
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
        'city':'',
        'note': '',
        'url': '',
        'place_id': '',
      })
    }

  ngOnInit() {
    this.currentUserSubscription = this.userService.updateCurrentUser.subscribe(
      result => { this.currentUser = result; })

    this.itinerarySubscription = this.itineraryService.currentItinerary.subscribe(
      result => { this.itinerary = result; })

    this.dateSubscription = this.itineraryService.updateDate.subscribe(
      result => {
        this.dateRange  = Object.keys(result).map(key => result[key]);
        this.dateRange.splice(0,1);

        if(this.date && this.date !== 'any day') {
          this.firstDay = this.date;
        } else  {
          this.firstDay = this.dateRange[0];
        }

        this.lastDay = this.dateRange[this.dateRange.length - 1];
        this.sortDateRange();
    })

    setTimeout(() => {this.initMap()},100);

    this.countryService.getCountries().subscribe(
      result => {
        this.countries = result.countries;
        this.getCountriesName();
      }
    )
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
    if(this.currentUserSubscription) this.currentUserSubscription.unsubscribe();
    if(this.itinerarySubscription) this.itinerarySubscription.unsubscribe();
    if(this.dateSubscription) this.dateSubscription.unsubscribe();
  }

  initMap() {
    let mapDiv = this.map.nativeElement;

    this.locationMap = new google.maps.Map(mapDiv, {
      center: {lat: 0, lng: 0},
      zoom: 1,
      styles: [{"stylers": [{ "saturation": -20 }]}]
    })
  }

  getCountriesName()  {
    this.countriesName = [];

    for(let i = 0; i < this.countries.length; i++) {
      this.countriesName.push(this.countries[i]['name']);
    }
  }

  // manage dates for check out
  sortDateRange() {
    this.outRange = [];

    for (let i = 0; i < this.dateRange.length; i++) {
      if(this.itinerary['num_days'])  {
        this.outRange.push({
          formatted: this.dateRange[i],
          date: this.dateRange[i],
        });
      } else  {
        let ndate = new Date(this.dateRange[i])
        let year = ndate.getFullYear();
        let month = ndate.getMonth();
        let date = ndate.getDate();
        let day = ndate.getDay();

        let fdate;
        let index = i + 1;
        if(date < 10) {
          fdate = '0' + date;
        } else{
          fdate = date
        }

        this.outRange.push({
          formatted:"Day " + index + ", " + fdate + " " + this.months[month] + " " + year + " (" + this.dayWeek[day] + ")",
          date: this.dateRange[i]
        })
      }
    }

    this.filterOutRange();
  }

  filterOutRange()  {
    let index = this.dateRange.indexOf(this.firstDay);
    this.outDateRange = this.outRange.slice(index);
  }

  dateChange()  {
    let inDate = this.addAccommodationForm.value.check_in_date;
    let outDate = this.addAccommodationForm.value.check_out_date;

    let index = this.dateRange.indexOf(inDate);
    this.outDateRange = this.outRange.slice(index);

    if(inDate > outDate)  {
      this.addAccommodationForm.patchValue({
        check_out_date: inDate,
      })

      if(this.hourIn === 'anytime') {
        this.hourOut = 'anytime'
      } else  {
        this.hourOut = this.hourIn;
        this.minuteOut = this.minuteIn;
      }
    }
  }

  // progress bar
  next()  {
    this.step1 = false;
    this.searchDone = true;
  }

  backToSearch() {
    this.step1 = true;
    this.searchDone = false;

    this.addAccommodationForm.reset();
    this.newPlace = undefined;
    this.displayPic = undefined;
    this.pictureOptions = [];
    this.dragAddress = '';
    this.marker = undefined;
    this.details = undefined;

    setTimeout(() => {this.initMap()}, 100)
  }


  // get place details from Google
  getAccommodationDetails(value)  {
    this.newPlace = value;

    this.newPlace['lat'] = value['geometry'].location.lat()
    this.newPlace['lng'] = value['geometry'].location.lng()

    let index = 0;

    if(value.photos) {
      if(value.photos.length > 5)  {
        index = 5;
      } else  {
        index = value.photos.length
      }

      this.pictureOptions = [];
      for (let i = 0; i < index; i++) {
        let c = value.photos[i].html_attributions[0]
        this.pictureOptions.push({
          url: value.photos[i].getUrl({'maxWidth': 300, 'maxHeight': 250}),
          credit: c.slice(0,3) + 'target="_blank" ' + c.slice(3,c.length)
        });
      }
    }

    let lat = this.newPlace['lat'];
    let lng = this.newPlace['lng'];

    this.pinLocation(lat, lng)

    let address_components = this.newPlace['address_components'];

    this.getCountry(address_components);
    this.getCity(address_components);
    this.dragAddress = '';
  }

  getCity(address) {
    let city = '';
    for (let i = 0; i < address.length; i++) {
      if(address[i]['types'][0] === 'locality')  {
        city = address[i]['long_name'];
      } else if(address[i]['types'][0] === 'administrative_area_level_1') {
        if(city !== "") city += ', '
        city += address[i]['long_name'];
      }
    }

    this.addAccommodationForm.patchValue({
      city: city
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
      // this.loadingService.setLoader(true, "Getting location address...");

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

          this.newPlace = null;
          this.newPlace = {
            formatted_address: result[0]['formatted_address'],
            lat: lat,
            lng: lng,
            place_id: result[0]['place_id']
          }

          this.getCity(result[0]['address_components'])
          this.getCountry(result[0]['address_components'])

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

        this.checkCountry();
      }
    })
  }

  checkCountry() {
    let index = this.countriesName.indexOf(this.country['name'])

    if(index > -1)  {
      this.newPlace['country'] = this.countries[index];
      this.getPlace();
    } else {
      this.countryService.addCountry(this.country).subscribe(
        result => {
          this.newPlace['country'] = result.country;
          this.getPlace();
        })
    }
  }

  getPlace()  {
    this.newPlace['photos'] = this.pictureOptions;
    this.newPlace['description'] = "";
    this.newPlace['long_description'] = "";
    this.newPlace['opening_hours'] = '';

    this.placeService.searchPlace(this.newPlace).subscribe(
      result => {
        this.form.nativeElement.click();

        this.details = result['place'];
        this.pictureOptions = this.details['photos'];

        if(this.details['photos'])  {
          if(this.details['photos'].length > 0)  {
            this.displayPic = this.details['photos'][0];
          }
        }

        this.addAccommodationForm.patchValue({
          Oname: this.details['name'],
          name: this.details['name'],
          formatted_address: this.details['formatted_address'],
          lat: this.details['lat'],
          lng: this.details['lng'],
          website: this.details['website'],
          international_phone_number: this.details['international_phone_number'],
          check_in_date: this.firstDay,
          check_out_date: this.lastDay,
          check_in_time: this.timeCheckIn,
          check_out_time: this.timeCheckOut,
          url: this.details['url'],
          place_id: this.details['place_id'],
          note: ""
        })
      }
    )
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
      this.fileuploadService.uploadFile(this.newImageFile, "event").subscribe(
        result => {
          newAccommodation['photo'] = {
            url:result.secure_url,
            public_id: result.public_id,
            credit: ""
          };

          this.addEvent(newAccommodation);
        })
    } else  {
      this.addEvent(newAccommodation);
    }
  }

  addEvent(accommodation)  {
    this.itineraryEventService.addEvent(accommodation, this.itinerary).subscribe(
      result => {
        if(this.route.snapshot['_urlSegment'].segments[3].path !== 'summary' &&
           this.route.snapshot['_urlSegment'].segments[3].path !== 'accommodation') {

          this.changeRoute.emit('ACCOMMODATION');

          let id = this.route.snapshot['_urlSegment'].segments[2].path;
          this.router.navigateByUrl('/me/itinerary/' + id + '/accommodation');
        }

        this.flashMessageService.handleFlashMessage(result.message);
        this.inputValue = null;
        this.uploadPic = '';
        this.newImageFile = '';
        this.hideAccommodationForm.emit(false)
      })
  }

  cancelForm()  {
    this.hideAccommodationForm.emit(false)
  }

}
