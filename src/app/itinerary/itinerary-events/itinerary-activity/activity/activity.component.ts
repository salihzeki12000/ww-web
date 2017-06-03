import { Component, OnInit, OnDestroy, Input, Renderer2, HostListener } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs/Rx';

import { ItineraryService }      from '../../../itinerary.service';
import { ItineraryEvent }        from '../../itinerary-event';
import { ItineraryEventService } from '../../itinerary-event.service';
import { FlashMessageService }   from '../../../../flash-message';
import { UserService }           from '../../../../user';
import { LoadingService }        from '../../../../loading';

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
  @Input() summary;

  currentUserSubscription: Subscription;
  currentUser;
  sameUser;

  showContactDetails = false;

  itineraries = [];

  showMenu = false;
  copying = false;
  editing = false;
  deleteActivity = false;

  editActivityForm: FormGroup;
  categories;
  anytime;

  constructor(
    private formBuilder: FormBuilder,
    private renderer: Renderer2,
    private userService: UserService,
    private itineraryEventService: ItineraryEventService,
    private loadingService: LoadingService,
    private flashMessageService: FlashMessageService,
    private itineraryService: ItineraryService) {
      this.editActivityForm = this.formBuilder.group({
        'categories': this.initCategoryArray(),
        'name': ['', Validators.required],
        'description': '',
        'sub_description': '',
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
                                          this.filterItineraries();
                                        })
    this.activity['formatted_hours'] = this.activity['opening_hours'].replace(/\r?\n/g, '<br/> ');
    this.activity['formatted_note'] = this.activity['note'].replace(/\r?\n/g, '<br/> ');
  }

  @HostListener('document:click', ['$event'])
  checkClick(event) {
    if(!event.target.classList.contains("dots-menu")) {
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

  filterItineraries() {
    this.itineraries = [];
    for (let i = 0; i < this.currentUser['itineraries'].length; i++) {
      if(this.currentUser['itineraries'][i]['_id'] !== this.currentItinerary['_id'])  {
        this.itineraries.push(this.currentUser['itineraries'][i])
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

  // copy section
  copy()  {
    this.copying = true;
    this.preventScroll(true);
  }

  cancelCopy()  {
    this.copying = false;
    this.preventScroll(false);
  }

  copyTo(itinerary) {
    let copiedEvent = this.activity;

    delete copiedEvent['_id'];
    delete copiedEvent['created_at'];
    delete copiedEvent['itinerary'];

    copiedEvent['date'] = 'any day';
    copiedEvent['time'] = 'anytime';
    copiedEvent['user'] ={
      _Id: this.currentUser['id'],
      username: this.currentUser['username'],
    }

    this.itineraryEventService.copyEvent(copiedEvent, itinerary).subscribe(
      result => {
        this.flashMessageService.handleFlashMessage(result.message);
      }
    )

    this.copying = false;
    this.preventScroll(false);
  }

  // edit section
  patchValue()  {
    this.editActivityForm.patchValue({
      name: this.activity['name'],
      description: this.activity['description'],
      sub_description: this.activity['sub_description'],
      opening_hours: this.activity['opening_hours'],
      entry_fee: this.activity['entry_fee'],
      website: this.activity['website'],
      formatted_address: this.activity['formatted_address'],
      international_phone_number: this.activity['international_phone_number'],
      date: this.activity['date'],
      note: this.activity['note'],
    })

    if(this.activity['time'] === 'anytime') {
      this.anytime = true;
    } else  {
      this.anytime = false;
    }
  }

  edit()  {
    this.patchValue();

    this.editing = true;
    this.preventScroll(true);
  }

  undoEdit()  {
    this.patchValue()
  }

  cancelEdit()  {
    this.editing = false;
    this.preventScroll(false);
  }

  saveEdit()  {
    this.loadingService.setLoader(true, "Saving...");

    let editedActivity = this.editActivityForm.value;
    let originalActivity = this.activity;

    let categoryArray = [
      { value: 'adventure', icon: 'hand-peace-o' },
      { value: 'food/drink', icon: 'cutlery' },
      { value: 'shopping', icon: 'shopping-bag'},
      { value: 'sight-seeing', icon: 'eye' },
    ]

    for (let i = 0; i < originalActivity['categories'].length; i++) {
      originalActivity['categories'][i]['value'] = categoryArray[i]['value']
      originalActivity['categories'][i]['icon'] = categoryArray[i]['icon']
    }

    if(this.anytime === true) {
      editedActivity['time'] = 'anytime';
    } else if(!this.anytime && !editedActivity['time'])  {
      editedActivity['time'] = originalActivity['time']
    }

    for (let value in editedActivity) {
      originalActivity[value] = editedActivity[value];
    }

    this.itineraryEventService.editEvent(originalActivity)
        .subscribe(
          result => {
            this.loadingService.setLoader(false, "");
            this.flashMessageService.handleFlashMessage(result.message);
          })

    this.editing = false;
    this.preventScroll(false);
  }

  // delete section
  delete() {
    this.deleteActivity = true;
    this.preventScroll(true);
  }

  cancelDelete()  {
    this.deleteActivity = false;
    this.preventScroll(false);
  }

  confirmDelete()  {
    this.itineraryEventService.deleteEvent(this.activity)
        .subscribe(
          result => {
            this.flashMessageService.handleFlashMessage(result.message);
          })
    this.deleteActivity = false;
    this.preventScroll(false);
}

  toggleAnytime() {
    this.anytime = !this.anytime;
  }

  // others
  preventScroll(value)  {
    if(value) {
      this.renderer.addClass(document.body, 'prevent-scroll');
    } else  {
      this.renderer.removeClass(document.body, 'prevent-scroll');
    }
  }

}
