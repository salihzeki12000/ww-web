import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs/Rx';

import { ItineraryService }      from '../../../itinerary.service';
import { ItineraryEvent }        from '../../itinerary-event';
import { ItineraryEventService } from '../../itinerary-event.service';
import { FlashMessageService }   from '../../../../flash-message';
import { UserService }           from '../../../../user';

@Component({
  selector: 'ww-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss']
})
export class ActivityComponent implements OnInit {
  @Input() activity: ItineraryEvent;

  editing = false;
  deleteActivity = false;

  editCustomActivityForm: FormGroup;
  categories;
  anytime;

  itinDateSubscription: Subscription;
  itinDateRange = [];

  currentUserSubscription: Subscription;
  currentUser;
  sameUser;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private itineraryEventService: ItineraryEventService,
    private flashMessageService: FlashMessageService,
    private itineraryService: ItineraryService) {
      this.editCustomActivityForm = this.formBuilder.group({
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
      })
    }

  ngOnInit() {
    this.itinDateSubscription = this.itineraryService.updateDate
                                    .subscribe(
                                      result => {
                                        let updatedItinDate = Object.keys(result).map(key => result[key]);
                                        this.itinDateRange = updatedItinDate;
                                    })

    this.currentUserSubscription = this.userService.updateCurrentUser
                                       .subscribe(
                                         result => {
                                           this.currentUser = result;
                                           this.checkSameUser();
                                         }
                                       )
  }

  checkSameUser() {
    if(this.currentUser['id'] === this.activity['user']['_id']) {
      this.sameUser = true;
    }
  }

  initCategoryArray() {
    this.categories = this.formBuilder.array([
      this.formBuilder.group({ value: 'adventure', icon: 'hand-peace-o', checked: false }),
      this.formBuilder.group({ value: 'food/drink', icon: 'cutlery', checked: false }),
      this.formBuilder.group({ value: 'sight-seeing', icon: 'eye', checked: false }),
      this.formBuilder.group({ value: 'shopping', icon: 'shopping-bag', checked: false }),
    ])
    return this.categories;
  }

  onEdit()  {
    console.log(this.activity);
    this.editing = true;
    if(this.activity['time'] === 'anytime') {
      this.anytime = true;
    }
  }

  cancelEditActivity()  {
    this.editing = false;
  }

  onUpdateActivity()  {
    let categoryArray = [
      { value: 'adventure', icon: 'hand-peace-o' },
      { value: 'food/drink', icon: 'cutlery' },
      { value: 'shopping', icon: 'shopping-bag'},
      { value: 'sight-seeing', icon: 'eye' },
    ]

    let editedActivity = this.editCustomActivityForm.value;

    for (let i = 0; i < this.activity['categories'].length; i++) {
      this.activity['categories'][i]['value'] = categoryArray[i]['value']
      this.activity['categories'][i]['icon'] = categoryArray[i]['icon']
    }

    for (let value in editedActivity) {
      if(editedActivity[value] === null)  {
        editedActivity[value] = '';
      }
      if(editedActivity[value] !== '')  {
        this.activity[value] = editedActivity[value];
      }
    }

    if(editedActivity['time'] === '' || this.anytime) {
      this.activity['time'] = 'anytime';
    }

    this.itineraryEventService.editEvent(this.activity)
        .subscribe(
          result => {
          this.flashMessageService.handleFlashMessage(result.message);
        })

    this.editing = false;

    this.editCustomActivityForm.reset([{
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
    }])
  }

  // delete activity
  confirmDelete() {
    this.deleteActivity = true;
  }

  cancelDelete()  {
    this.deleteActivity = false;
  }

  onDeleteActivity()  {
    this.itineraryEventService.deleteEvent(this.activity)
        .subscribe(
          result => {
            this.flashMessageService.handleFlashMessage(result.message);
          })
    this.deleteActivity = false;
  }

  toggleAnytime() {
    this.anytime = !this.anytime;
  }
}
