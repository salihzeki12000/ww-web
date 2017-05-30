import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs/Rx';

import { Itinerary }             from '../../../itinerary';
import { ItineraryService }      from '../../../itinerary.service';
import { ItineraryEvent }        from '../../itinerary-event';
import { ItineraryEventService } from '../../itinerary-event.service';

import { UserService }         from '../../../../user';
import { FlashMessageService } from '../../../../flash-message';
import { FileuploadService }   from '../../../../shared';

@Component({
  selector: 'ww-accommodation-form',
  templateUrl: './accommodation-form.component.html',
  styleUrls: ['./accommodation-form.component.scss']
})
export class AccommodationFormComponent implements OnInit, OnDestroy {
  @Output() hideAccommodationForm = new EventEmitter();

  addAccommodationForm: FormGroup;
  manualEntry = true;

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
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder) {
      this.addAccommodationForm = this.formBuilder.group({
        'name': ['', Validators.required],
        'formatted_address': '',
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
  }

  ngOnDestroy() {
    this.currentUserSubscription.unsubscribe();
    this.currentItinerarySubscription.unsubscribe();
    this.itinDateSubscription.unsubscribe();
  }

  // progress bar
  skipSearch()  {
    this.searchDone = true;

    this.addAccommodationForm.patchValue({
      check_in_date: this.firstDay,
      check_out_date: this.lastDay,
      check_in_time: this.timeCheckIn,
      check_out_time: this.timeCheckOut,
    })
  }

  backToSearch() {
    this.searchDone = false;
    this.manualEntry = true;
    this.addAccommodationForm.reset();
    this.displayPic = '';
    this.pictureOptions = [];
  }

  // get place details from Google
  getAccommodationDetails(value)  {
    let lat = value['geometry'].location.lat();
    let lng = value['geometry'].location.lng();

    let address_components = value['address_components'];

    for (let i = 0; i < address_components.length; i++) {
      if(address_components[i]['types'][0] === 'locality')  {
        value['stay_city'] = address_components[i]['long_name'];
      } else if(address_components[i]['types'][0] === 'administrative_area_level_1') {
        value['stay_city'] += ', ' + address_components[i]['long_name'];
      }
    }

    this.addAccommodationForm.patchValue({
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
    })

    let index = 0;

    if(value.photos) {
      this.displayPic = value.photos[0].getUrl({'maxWidth': 300, 'maxHeight': 250});
      if(value.photos.length > 5)  {
        index = 5;
      } else  {
        index = value.photos.length
      }

      this.pictureOptions = [];
      for (let i = 0; i < index; i++) {
        this.pictureOptions.unshift(value.photos[i].getUrl({'maxWidth': 300, 'maxHeight': 250}));
      }
    }

    this.searchDone = true;
    this.manualEntry = false;
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

  exitError() {
    this.fileTypeError = false;
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

    newAccommodation['date'] = newAccommodation['check_in_date'];
    newAccommodation['time'] = newAccommodation['check_in_time'];
    newAccommodation['type'] = 'accommodation';
    newAccommodation['user'] =  {
      _Id: this.currentUser['id'],
      username: this.currentUser['username'],
    }
    newAccommodation['created_at'] = new Date();

    if(this.newImageFile !== '')  {
      this.fileuploadService.uploadFile(this.newImageFile)
          .subscribe(
            result => {
              newAccommodation['photo'] = result.secure_url;

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
