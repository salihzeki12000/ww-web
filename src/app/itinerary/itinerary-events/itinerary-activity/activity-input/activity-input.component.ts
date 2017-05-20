import { Component, OnInit, OnDestroy, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs/Rx';

import { UserService }           from '../../../../user';
import { ItineraryService }      from '../../../itinerary.service';
import { ItineraryEventService } from '../../itinerary-event.service';
import { FlashMessageService }   from '../../../../flash-message';
import { FileuploadService }     from '../../../../shared';

@Component({
  selector: 'ww-activity-input',
  templateUrl: './activity-input.component.html',
  styleUrls: ['./activity-input.component.scss']
})
export class ActivityInputComponent implements OnInit, OnDestroy {
  @Output() hideActivityForm = new EventEmitter<boolean>();

  customActivityForm: FormGroup;
  categories;

  searchDone = false;

  itinDateSubscription: Subscription;
  itinDateRange = [];

  currentUserSubscription: Subscription;
  currentUser;

  currentItinerarySubscription: Subscription;
  currentItinerary;

  activityDetail;

  displayPic;
  uploadPic;
  newImageFile = '';

  inputValue = '';
  fileTypeError = false;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private itineraryService: ItineraryService,
    private itineraryEventService: ItineraryEventService,
    private flashMessageService: FlashMessageService,
    private fileuploadService: FileuploadService,
    private route: ActivatedRoute,
    private router: Router) {
    this.customActivityForm = this.formBuilder.group({
      'categories': this.initCategoryArray(),
      'name': '',
      'description': '',
      'subDescription': '',
      'opening_hours': '',
      'entry_fee': '',
      'website': '',
      'formatted_address': '',
      'international_phone_number':'',
      'date': '',
      'time': '',
      'note': '',
      'locationCheckedIn': '',
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
                                        // this.itinDateRange.splice(0,1);
                                    })
  }

  ngOnDestroy() {
    this.currentUserSubscription.unsubscribe();
    this.currentItinerarySubscription.unsubscribe();
    this.itinDateSubscription.unsubscribe();
  }

  initCategoryArray() {
    this.categories = this.formBuilder.array([
      this.formBuilder.group({ value: 'adventure', icon: 'hand-peace-o', checked: false }),
      this.formBuilder.group({ value: 'food/drink', icon: 'cutlery', checked: false }),
      this.formBuilder.group({ value: 'shopping', icon: 'shopping-bag', checked: false }),
      this.formBuilder.group({ value: 'sight-seeing', icon: 'eye', checked: false }),
    ])
    return this.categories;
  }

  // progress bar
  skipSearch()  {
    this.searchDone = true;
  }

  backToSearch() {
    this.searchDone = false;
  }

  //get activity details from Google
  getActivityDetails(value)  {
    this.resetActivityForm();
    let index = 0;

    this.activityDetail = value;

    if(this.activityDetail.photos) {
      this.displayPic = value.photos[0].getUrl({'maxWidth': 300, 'maxHeight': 250});
      if(this.activityDetail.photos.length > 5)  {
        index = 5;
      } else  {
        index = this.activityDetail.photos.length
      }
      this.activityDetail['pictures'] = [];
      for (let i = 0; i < index; i++) {
        this.activityDetail['pictures'].unshift(value.photos[i].getUrl({'maxWidth': 300, 'maxHeight': 250}));
      }
    }

    this.activityDetail.opening_hours = this.getOpeningHours(this.activityDetail.opening_hours);

    this.searchDone = true;
  }

  resetActivityForm() {
    this.customActivityForm.reset([{
      'categories': this.initCategoryArray(),
      'name': '',
      'description': '',
      'subDescription': '',
      'opening_hours': '',
      'entry_fee': '',
      'website': '',
      'formatted_address': '',
      'international_phone_number':'',
      'date': '',
      'time': '',
      'note': '',
      'locationCheckedIn': '',
    }])
  }

  getOpeningHours(hours)  {
    let openingHours = [];
    let openingHoursGroup = {};
    let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let output = '';

    if (hours === undefined) {
      return ''
    }

    //to handle 24hrs establishments
    if(hours.periods.length === 1)  {
      return "Open 24hrs"
    }

    //reorgnise each day to open-close time
    for (let i = 0; i < hours.periods.length; i++) {
      openingHours.push(hours.periods[i].open.time + "hrs" + " - " + hours.periods[i].close.time + "hrs");
    }

    //group similar timings
    for (let i = 0; i < openingHours.length; i++) {
      if(openingHoursGroup[openingHours[i]])  {
        openingHoursGroup[openingHours[i]].push([days[i], i])
      } else  {
        openingHoursGroup[openingHours[i]] = [];
        openingHoursGroup[openingHours[i]].push([days[i], i])
      }
    }

    //to handle daily same timing
    for (let time in openingHoursGroup) {
      let groupLength = Object.keys(openingHoursGroup).length;
      if( groupLength === 1 && openingHoursGroup[time].length === 7)  {
        return "Daily: " + time
      }
    }

    //to handle different timings
    for (let i = 0; i < hours.weekday_text.length; i++) {
      output += hours.weekday_text[i] + " \n";
    }
    return output;
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

  deletePicture() {
    this.inputValue = null;
    this.uploadPic = '';
    this.newImageFile = '';
  }

  // save
  saveNew()  {
    let activityForm = this.customActivityForm.value;
    let additionalField = ['url', 'place_id', 'photo'];
    let categoryArray = [
      { value: 'adventure', icon: 'hand-peace-o' },
      { value: 'food/drink', icon: 'cutlery' },
      { value: 'shopping', icon: 'shopping-bag'},
      { value: 'sight-seeing', icon: 'eye' },
    ]

    if(this.activityDetail)  {
      for (var value in activityForm)  {
        if( activityForm[value] === ('' || null) && this.activityDetail) {
          activityForm[value] = this.activityDetail[value];
        }
        if( activityForm[value] === undefined) {
          activityForm[value] = '';
        }
      }

      for (let j = 0; j < additionalField.length; j++) {
        if(this.activityDetail[additionalField[j]])  {
          activityForm[additionalField[j]] = this.activityDetail[additionalField[j]];
        }
      }

      for (let k = 0; k < activityForm['categories'].length; k++) {
        activityForm['categories'][k]['value'] = categoryArray[k]['value'];
        activityForm['categories'][k]['icon'] = categoryArray[k]['icon'];
        if(!activityForm['categories'][k]['checked'])  {
          activityForm['categories'][k]['checked'] = false;
        }
      }

      let lat = this.activityDetail['geometry'].location.lat();
      let lng = this.activityDetail['geometry'].location.lng();

      activityForm['lat'] = lat;
      activityForm['lng'] = lng;
    } // end of data adjustment if details pre-populated by Google

    if(activityForm['date'] === '')  {
      activityForm['date'] = 'any day';
    }

    if(activityForm['time'] === '')  {
      activityForm['time'] = 'anytime';
    }

    if(this.displayPic)  {
      activityForm['photo'] = this.displayPic;
    }

    activityForm['user'] = {
      _Id: this.currentUser['id'],
      username: this.currentUser['username'],
    }

    activityForm['created_at'] = new Date();

    activityForm['type'] = 'activity';

    if(this.newImageFile !== '')  {
      this.fileuploadService.uploadFile(this.newImageFile)
          .subscribe(
            result => {
              activityForm['photo'] = result.secure_url;

              this.addActivity(activityForm);
          })
    } else  {
      this.addActivity(activityForm);
    }


    this.hideActivityForm.emit(false);
    this.resetActivityForm();
  }

  addActivity(activity) {
    this.itineraryEventService.addEvent(activity, this.currentItinerary)
        .subscribe(
          result => {
            if(this.route.snapshot['_urlSegment'].segments[3].path !== 'activities') {
              let id = this.route.snapshot['_urlSegment'].segments[2].path;
              this.router.navigateByUrl('/me/itinerary/' + id + '/activity');
            }
            this.flashMessageService.handleFlashMessage(result.message);
            this.inputValue = null;
            this.uploadPic = '';
            this.newImageFile = '';
          }
        );
  }

  cancelForm()  {
    this.hideActivityForm.emit(false);
  }

}
