import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Rx';

import { UserService }         from '../../../../user';
import { ItineraryEventService }        from '../../itinerary-event.service';
import { FlashMessageService } from '../../../../flash-message';

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
  userId;
  username;

  activityDetail;
  anytime = false;

  checkedIn;
  traveling;


  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
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
      'date': ['', Validators.required],
      'time': '',
      'note': '',
      'locationCheckedIn': '',
    })
  }

  initCategoryArray() {
    this.categories = this.formBuilder.array([
      this.formBuilder.group({ value:'sight-seeing', icon: 'eye', checked: false }),
      this.formBuilder.group({ value: 'food/drink', icon: 'cutlery', checked: false }),
      this.formBuilder.group({ value: 'adventure', icon: 'hand-peace-o', checked: false })
    ])
    return this.categories;
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

  onSubmit()  {
    let activityForm = this.customActivityForm.value;
    let itineraryId = this.route.snapshot['_urlSegment'].segments[2].path;
    let additionalField = ['url', 'place_id', 'photo'];
    let categoryArray = [
      { value:'sight-seeing', icon: 'eye' },
      { value: 'food/drink', icon: 'cutlery' },
      { value: 'adventure', icon: 'hand-peace-o' }
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

    // if (activityForm['locationCheckedIn']) {
    //   let now = new Date();
    //   activityForm['locationCheckedIn'] = now;
    //   activityForm['date'] = now;
    //   activityForm['time'] = now.getTime();
    // }

    if(activityForm['time'] === '' || this.anytime)  {
      activityForm['time'] = 'anytime';
    }

    activityForm['user'] = {
      _Id: this.userId,
      username: this.username,
    }

    activityForm['created_at'] = new Date();

    activityForm['type'] = 'activity';

    this.itineraryEventService.addEvent(activityForm, itineraryId)
        .subscribe(
          data => {
            this.flashMessageService.handleFlashMessage(data.message);
          }
        );

    this.hideForm.emit(false);
    this.resetActivityForm();
  }

  cancelForm()  {
    this.hideForm.emit(false);
  }

  // deleteCustomActivity(i) {
  //   if(this.activities.length === 1)  {
  //     this.hideForm.emit(false);
  //     this.resetActivityForm();
  //   } else  {
  //     this.activities.removeAt(i);
  //   }
  // }

  ngOnInit() {
    this.currentUserSubscription = this.userService.updateCurrentUser
                                       .subscribe(
                                         data => {
                                           this.userId = data['id'];
                                           this.username = data['username'];
                                         }
                                       )

    //to check whether to enable check in now option
    let now = new Date();
    let itinStart = this.itinDateRange[1];

    if(now < itinStart) {
      this.traveling = false;
    } else  {
      this.traveling = true;
    }
  }

  getActivityDetails(value)  {
    this.resetActivityForm();

    this.activityDetail = value;

    if(this.activityDetail.photos)  {
      this.activityDetail.photo = this.activityDetail.photos[0].getUrl({'maxWidth': 300, 'maxHeight': 250});
    }
    this.activityDetail.opening_hours = this.getOpeningHours(this.activityDetail.opening_hours);

    console.log(this.activityDetail);
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

  toggleCheckedIn()  {
    this.checkedIn = !this.checkedIn;
  }

  toggleAnytime() {
    this.anytime = !this.anytime;
  }

}
