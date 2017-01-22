import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Rx';

import { UserService }           from '../../../../user';
import { ItineraryService }      from '../../../itinerary.service';
import { ItineraryEventService } from '../../itinerary-event.service';
import { FlashMessageService }   from '../../../../flash-message';

@Component({
  selector: 'ww-activity-input',
  templateUrl: './activity-input.component.html',
  styleUrls: ['./activity-input.component.scss']
})
export class ActivityInputComponent implements OnInit {
  @Input() itinDateRange;
  @Output() hideForm = new EventEmitter<boolean>();

  customActivityForm: FormGroup;
  categories;

  currentUserSubscription: Subscription;
  currentUser;
  itineraryId;

  activityDetail;
  anytime = false;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private itineraryService: ItineraryService,
    private itineraryEventService: ItineraryEventService,
    private flashMessageService: FlashMessageService,
    private route: ActivatedRoute) {
    this.customActivityForm = this.formBuilder.group({
      'categories': this.initCategoryArray(),
      'name': '',
      'description': '',
      'subDescription': '',
      'opening_hours': '',
      'entryFee': '',
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
    this.currentUserSubscription = this.userService.updateCurrentUser
                                       .subscribe(
                                         result => {
                                           this.currentUser = result;
                                         }
                                       )
    this.itineraryId = this.itineraryService.itineraryId;
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

  onSubmit()  {
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

    if(activityForm['time'] === '' || this.anytime)  {
      activityForm['time'] = 'anytime';
    }

    activityForm['user'] = {
      _Id: this.currentUser['id'],
      username: this.currentUser['username'],
    }

    activityForm['created_at'] = new Date();

    activityForm['type'] = 'activity';

    this.itineraryEventService.addEvent(activityForm, this.itineraryId)
        .subscribe(
          result => {
            this.flashMessageService.handleFlashMessage(result.message);
          }
        );

    this.hideForm.emit(false);
    this.resetActivityForm();
  }

  cancelForm()  {
    this.hideForm.emit(false);
  }

  //date retreived from google
  getActivityDetails(value)  {
    this.resetActivityForm();

    this.activityDetail = value;

    if(this.activityDetail.photos)  {
      this.activityDetail.photo = this.activityDetail.photos[0].getUrl({'maxWidth': 300, 'maxHeight': 250});
    }
    this.activityDetail.opening_hours = this.getOpeningHours(this.activityDetail.opening_hours);
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

    //reorgnise to open-close time
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

    //to handle open daily same timing
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

  toggleAnytime() {
    this.anytime = !this.anytime;
  }

  resetActivityForm() {
    this.customActivityForm.reset([{
      'categories': this.initCategoryArray(),
      'name': '',
      'description': '',
      'subDescription': '',
      'opening_hours': '',
      'entryFee': '',
      'website': '',
      'formatted_address': '',
      'international_phone_number':'',
      'date': '',
      'time': '',
      'note': '',
      'locationCheckedIn': '',
    }])
  }

}
