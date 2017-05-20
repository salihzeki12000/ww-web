import { Component, OnInit, OnDestroy, Input, Renderer, HostListener } from '@angular/core';
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
export class ActivityComponent implements OnInit, OnDestroy {
  @Input() activity: ItineraryEvent;
  @Input() itinDateRange;
  @Input() currentItinerary;
  @Input() totalActivities;
  @Input() index;

  currentUserSubscription: Subscription;
  currentUser;
  sameUser;

  showContactDetails = false;

  showMenu = false;
  editing = false;
  deleteActivity = false;

  editCustomActivityForm: FormGroup;
  categories;
  anytime;

  constructor(
    private formBuilder: FormBuilder,
    private renderer: Renderer,
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
        'entry_fee': '',
        'website': '',
        'formatted_address': '',
        'international_phone_number':'',
        'date': '',
        'time': '',
        'note': '',
      })
    }

  ngOnInit() {
    this.currentUserSubscription = this.userService.updateCurrentUser.subscribe(
                                        result => {
                                          this.currentUser = result;
                                          this.checkSameUser();
                                        })
    // this.activity['formatted_hours'] = this.activity['opening_hours'].replace(/\r?\n/g, '<br/> ');
  }

  @HostListener('document:click', ['$event'])
  checkClick(event) {
    if(!event.target.classList.contains("item-menu")) {
      this.showMenu = false;
    }
  }

  ngOnDestroy() {
    this.currentUserSubscription.unsubscribe();
  }

  checkSameUser() {
    if(this.currentUser['id'] === this.activity['user']['_id']) {
      this.sameUser = true;
    } else  {
      let admin = this.currentItinerary['admin'];
      for (let i = 0; i < admin.length; i++) {
        if(this.currentUser['id'] === admin[i]) {
          this.sameUser = true;
          i = admin.length;
        }
      }
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

  showMenuOptions() {
    this.showMenu = true;
  }

  // edit section
  edit()  {
    this.editing = true;
    this.renderer.setElementClass(document.body, 'prevent-scroll', true);
    if(this.activity['time'] === 'anytime') {
      this.anytime = true;
    }
  }

  cancelEdit()  {
    this.editing = false;
    this.renderer.setElementClass(document.body, 'prevent-scroll', false);
  }

  saveEdit()  {
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
    this.renderer.setElementClass(document.body, 'prevent-scroll', false);
  }

  // delete section
  delete() {
    this.deleteActivity = true;
    this.renderer.setElementClass(document.body, 'prevent-scroll', true);
  }

  cancelDelete()  {
    this.deleteActivity = false;
    this.renderer.setElementClass(document.body, 'prevent-scroll', false);
  }

  confirmDelete()  {
    this.itineraryEventService.deleteEvent(this.activity)
        .subscribe(
          result => {
            this.flashMessageService.handleFlashMessage(result.message);
          })
    this.deleteActivity = false;
    this.renderer.setElementClass(document.body, 'prevent-scroll', false);
}

  toggleAnytime() {
    this.anytime = !this.anytime;
  }

  toggleContactDetails()  {
    this.showContactDetails = !this.showContactDetails;
  }

}
