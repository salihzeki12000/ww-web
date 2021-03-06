import { Component, OnInit, OnDestroy, EventEmitter, Input, Output, HostListener, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs/Rx';
declare var google:any;

import { UserService }           from '../../../../user';
import { ItineraryService }      from '../../../itinerary.service';
import { ItineraryEventService } from '../../itinerary-event.service';
import { FlashMessageService }   from '../../../../flash-message';
import { FileuploadService }     from '../../../../shared';
import { LoadingService }        from '../../../../loading';
import { CountryService }        from '../../../../countries';
import { PlaceService }          from '../../../../places';

@Component({
  selector: 'ww-activity-input',
  templateUrl: './activity-input.component.html',
  styleUrls: ['./activity-input.component.scss']
})
export class ActivityInputComponent implements OnInit, OnDestroy {
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
  @Output() hideActivityForm = new EventEmitter<boolean>();
  @Output() changeRoute = new EventEmitter();

  addActivityForm: FormGroup;
  submitted = false;

  details;
  noLocation = false;
  highlight = false;

  // time picker
  ats = true;
  timePicker = false;
  hour = "anytime";
  minute = "00";

  meals;

  step1 = true;
  selected = false;
  searchActivity = false;
  searchDone = false;

  dateSubscription: Subscription;
  dateRange = [];

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
    private formBuilder: FormBuilder,
    private userService: UserService,
    private countryService: CountryService,
    private itineraryService: ItineraryService,
    private itineraryEventService: ItineraryEventService,
    private flashMessageService: FlashMessageService,
    private loadingService: LoadingService,
    private fileuploadService: FileuploadService,
    private placeService: PlaceService,
    private route: ActivatedRoute,
    private router: Router) {
    this.addActivityForm = this.formBuilder.group({
      'name': ['', Validators.required],
      'Oname': '',
      'formatted_address': '',
      'country': '',
      'lat': '',
      'lng': '',
      'international_phone_number':'',
      'opening_hours': '',
      'input_opening_hours': '',
      'website': '',
      'date': '',
      'time': '',
      'note': '',
      'locationCheckedIn': '',
      'url': '',
      'place_id': '',
      'meals': this.initMeals(),
    })
  }

  ngOnInit() {
    this.currentUserSubscription = this.userService.updateCurrentUser.subscribe(
      result => { this.currentUser = result; })

    this.itinerarySubscription = this.itineraryService.currentItinerary.subscribe(
      result => { this.itinerary = result; })

    this.dateSubscription = this.itineraryService.updateDate.subscribe(
      result => { this.dateRange  = Object.keys(result).map(key => result[key]); })

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
      this.timePicker = false;
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

  initMeals()  {
    this.meals = this.formBuilder.array([
      this.formBuilder.group({ value: "Breakfast", checked: false }),
      this.formBuilder.group({ value: "Brunch", checked: false }),
      this.formBuilder.group({ value: "Lunch", checked: false }),
      this.formBuilder.group({ value: "Dinner", checked: false }),
      this.formBuilder.group({ value: "Supper", checked: false }),
      this.formBuilder.group({ value: "Coffee/Tea", checked: false }),
      this.formBuilder.group({ value: "Drinks", checked: false }),
    ])
    return this.meals;
  }

  getCountriesName()  {
    this.countriesName = [];

    for(let i = 0; i < this.countries.length; i++) {
      this.countriesName.push(this.countries[i]['name']);
    }
  }


  // progress bar (disabled due issue with init meal array)
  // backToSelect()  {
  //   this.step1 = true;
  //   this.selected = false;
  //   this.noLocation = false;
  //   this.searchDone = false;
  //   this.searchActivity = false;
  //
  //   this.addActivityForm.reset();
  //   this.initMeals();
  //   this.displayPic = undefined;
  //   this.pictureOptions = [];
  //   this.dragAddress = '';
  //   this.marker = undefined;
  //   this.details = undefined;
  // }
  //
  // backToSearch() {
  //   this.selected = true;
  //   this.searchDone = false;
  //
  //   this.addActivityForm.reset();
  //   this.initMeals();
  //   this.displayPic = undefined;
  //   this.pictureOptions = [];
  //   this.dragAddress = '';
  //   this.marker = undefined;
  //   this.details = undefined;
  //
  //   setTimeout(() => {this.initMap()}, 100)
  // }

  getForm() {
    this.step1 = false;
    this.selected = true;
    this.searchDone = true;
    this.noLocation = true;

    let date;
    if(this.date) {
      date = this.date;
    } else  {
      date = 'any day'
    }

    this.addActivityForm.patchValue({
      date: date,
    })
  }

  locationSearch()  {
    this.step1 = false;
    this.selected = true;
    this.searchActivity = true;

    setTimeout(() => {this.initMap()},100);
  }

  next()  {
    this.selected = false;
    this.searchDone = true;
  }


  //get activity details from Google
  getActivityDetails(value)  {
    this.newPlace = value;

    if(this.newPlace['opening_hours'])  {
      this.newPlace['opening_hours_raw'] = this.newPlace['opening_hours']['periods'];
    }
    this.newPlace['lat'] = value['geometry'].location.lat()
    this.newPlace['lng'] = value['geometry'].location.lng()
    this.newPlace['opening_hours'] = this.getOpeningHours(value.opening_hours);

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
    this.getCountry(this.newPlace['address_components']);

    this.dragAddress = '';
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

        if(this.details['opening_hours']) {
          this.details['formatted_hours'] = this.details['opening_hours'].replace(/\r?\n/g, '<br/> ');
        }

        let date;
        if(this.date) {
          date = this.date;
        } else  {
          date = 'any day'
        }

        this.addActivityForm.patchValue({
          Oname: this.details['name'],
          name: this.details['name'],
          date: date,
          formatted_address: this.details['formatted_address'],
          lat: this.details['lat'],
          lng: this.details['lng'],
          international_phone_number: this.details['international_phone_number'],
          website: this.details['website'],
          opening_hours: this.details['opening_hours'],
          url: this.details['url'],
          place_id: this.details['place_id'],
          note: ''
        })

      }
    )
  }

  patchLocationData() {
    this.displayPic = '';
    this.pictureOptions = [];
    this.details = undefined;
  }


  // select time
  selectPicker()  {
    this.timePicker = true;
  }

  selectHour(h) {
    this.hour = h;
  }

  selectMinute(m) {
    this.minute = m;
  }


  // select picture as display pic
  selectPic(image)  {
    this.displayPic = image;
  }

  // fileUploaded(event) {
  //   let file = event.target.files[0];
  //   let type = file['type'].split('/')[0]
  //
  //   if (type !== 'image') {
  //     this.fileTypeError = true;
  //   } else  {
  //     if(event.target.files[0]) {
  //       this.newImageFile = event.target.files[0];
  //       let reader = new FileReader();
  //
  //       reader.onload = (event) =>  {
  //         this.uploadPic = event['target']['result'];
  //       }
  //
  //       reader.readAsDataURL(event.target.files[0]);
  //       return;
  //     }
  //   }
  // }
  //
  // deletePicture() {
  //   this.inputValue = null;
  //   this.uploadPic = '';
  //   this.newImageFile = '';
  // }


  // save
  saveNew()  {
    this.submitted = true;

    let newActivity = this.addActivityForm.value;

    if(this.hour === 'anytime')  {
      newActivity['time'] = 'anytime';
    } else  {
      newActivity['time'] = this.hour + ':' + this.minute;
    }

    if(this.displayPic)  {
      newActivity['photo'] = this.displayPic;
    }

    newActivity['user'] = {
      _id: this.currentUser['_id'],
      username: this.currentUser['username'],
    }

    newActivity['created_at'] = new Date();
    newActivity['type'] = 'activity';
    newActivity['location'] = !this.noLocation;
    newActivity['highlight'] = this.highlight;

    if(this.newImageFile !== '')  {
      this.fileuploadService.uploadFile(this.newImageFile).subscribe(
        result => {
          newActivity['photo'] = {
            url: result.secure_url,
            public_id: result.public_id,
            credit: ""
          };

          this.addActivity(newActivity);
        })
    } else  {
      this.addActivity(newActivity);
    }
  }

  addActivity(activity) {
    this.itineraryEventService.addEvent(activity, this.itinerary).subscribe(
      result => {
        if(this.route.snapshot['_urlSegment'].segments[3].path !== 'summary' &&
           this.route.snapshot['_urlSegment'].segments[3].path !== 'activities') {

          this.changeRoute.emit('ACTIVITY');

          let id = this.route.snapshot['_urlSegment'].segments[2].path;
          this.router.navigateByUrl('/me/itinerary/' + id + '/activity');
        }

        this.flashMessageService.handleFlashMessage(result.message);
        this.inputValue = null;
        this.uploadPic = '';
        this.newImageFile = '';
        this.submitted = false;
        this.hideActivityForm.emit(false);
      });
  }

  cancelForm()  {
    this.hideActivityForm.emit(false);
  }

}
