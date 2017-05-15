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
  googleAccommodationDetail;

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
        'name': '',
        'formatted_address': '',
        'website': '',
        'international_phone_number': '',
        'check_in_date': '',
        'check_out_date': '',
        'check_in_time': '',
        'check_out_time': '',
        'stay_city':'',
        'note': '',
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
  }

  backToSearch() {
    this.searchDone = false;
  }

  // get place details from Google
  getAccommodationDetails(value)  {
    let index = 0;
    this.googleAccommodationDetail = value;

    if(this.googleAccommodationDetail.photos) {
      this.displayPic = value.photos[0].getUrl({'maxWidth': 300, 'maxHeight': 250});
      if(this.googleAccommodationDetail.photos.length > 5)  {
        index = 5;
      } else  {
        index = this.googleAccommodationDetail.photos.length
      }
      this.googleAccommodationDetail['pictures'] = [];
      for (let i = 0; i < index; i++) {
        this.googleAccommodationDetail['pictures'].unshift(value.photos[i].getUrl({'maxWidth': 300, 'maxHeight': 250}));
      }
    }

    let address_components = value['address_components'];

    for (let i = 0; i < address_components.length; i++) {
      if(address_components[i]['types'][0] === 'locality')  {
        this.googleAccommodationDetail['stay_city'] = address_components[i]['long_name'];
      } else if(address_components[i]['types'][0] === 'administrative_area_level_1') {
        this.googleAccommodationDetail['stay_city'] += ', ' + address_components[i]['long_name'];
      }
    }

    this.searchDone = true;
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
    if(this.googleAccommodationDetail)  {
      for (var value in newAccommodation)  {
        if (newAccommodation[value] === '' && this.googleAccommodationDetail[value]) {
          newAccommodation[value] = this.googleAccommodationDetail[value];
        }
      }

      newAccommodation['url'] = this.googleAccommodationDetail['url'];
      newAccommodation['place_id'] = this.googleAccommodationDetail['place_id'];

      let lat = this.googleAccommodationDetail['geometry'].location.lat();
      let lng = this.googleAccommodationDetail['geometry'].location.lng();

      newAccommodation['lat'] = lat;
      newAccommodation['lng'] = lng;
    }

    if(newAccommodation['check_in_date'] === '')  {
      newAccommodation['check_in_date'] = this.firstDay;
    }

    if(newAccommodation['check_out_date'] === '')  {
      newAccommodation['check_out_date'] = this.lastDay;
    }

    if(newAccommodation['check_in_time'] === '')  {
      newAccommodation['check_in_time'] = '15:00';
    }

    if(newAccommodation['check_out_time'] === '')  {
      newAccommodation['check_out_time'] = '12:00';
    }

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
