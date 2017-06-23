import { Component, OnInit, OnDestroy, Input, Renderer2, HostListener } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
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
  mealTag = false;
  showContactDetails = false;

  itineraries = [];

  showMenu = false;
  copying = false;
  editing = false;
  deleteActivity = false;

  editActivityForm: FormGroup;
  categories;
  meals;

  //time picker
  ats = true;
  initHour = "";
  initMinute = "";
  timePicker = false;
  hour = "";
  minute = "";

  constructor(
    private formBuilder: FormBuilder,
    private renderer: Renderer2,
    private router: Router,
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
        'meals': this.initMeals(),
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

    this.checkMealTag();
    this.initTime();
  }

  @HostListener('document:click', ['$event'])
  checkClick(event) {
    if(!event.target.classList.contains("dots-menu")) {
      this.showMenu = false;
    }

    if(!event.target.classList.contains("time-picker-dropdown") &&
      !event.target.classList.contains("time") &&
      !event.target.classList.contains("time-select") &&
      !event.target.classList.contains("selected-time")) {
      this.timePicker = false;
    }
  }

  ngOnDestroy() {
    this.currentUserSubscription.unsubscribe();
  }

  checkSameUser() {
    if(this.currentUser['_id'] === this.activity['user']['_id']) {
      this.sameUser = true;
    } else  {
      let admin = this.currentItinerary['admin'];
      for (let i = 0; i < admin.length; i++) {
        if(this.currentUser['_id'] === admin[i]) {
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

  initCategoryArray() {
    this.categories = this.formBuilder.array([
      this.formBuilder.group({ value: 'adventure', icon: 'hand-peace-o', checked: false }),
      this.formBuilder.group({ value: 'food/drink', icon: 'cutlery', checked: false }),
      this.formBuilder.group({ value: 'sight-seeing', icon: 'eye', checked: false }),
      this.formBuilder.group({ value: 'shopping', icon: 'shopping-bag', checked: false }),
    ])
    return this.categories;
  }

  initTime()  {
    if(this.activity['time'] === "anytime") {
      this.hour = 'anytime';
      this.minute = "00";
    } else {
      this.hour = this.activity['time'].slice(0,2);
      this.minute = this.activity['time'].slice(3,6);
    }

    this.initHour = this.hour;
    this.initMinute = this.minute;
  }

  checkMealTag()  {
    for (let i = 0; i < this.activity['meals'].length; i++) {
      if(this.activity['meals'][i]['checked'])  {
        this.mealTag = true;
        i = this.activity['meals'].length;
      }
    }
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
      _id: this.currentUser['_id'],
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
      meals: this.activity['meals'],
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


  saveEdit()  {
    this.loadingService.setLoader(true, "Saving...");

    let editedActivity = this.editActivityForm.value;
    let originalActivity = this.activity;

    if(this.hour === 'anytime')  {
      editedActivity['time'] = 'anytime';
    } else  {
      editedActivity['time'] = this.hour + ':' + this.minute;
    }

    for (let value in editedActivity) {
      originalActivity[value] = editedActivity[value];
    }

    this.activity['formatted_hours'] = originalActivity['opening_hours'].replace(/\r?\n/g, '<br/> ');
    this.activity['formatted_note'] = originalActivity['note'].replace(/\r?\n/g, '<br/> ');

    this.itineraryEventService.editEvent(originalActivity).subscribe(
          result => {
            this.loadingService.setLoader(false, "");
            this.flashMessageService.handleFlashMessage(result.message);
          })

    this.editing = false;
    this.preventScroll(false);
    this.initTime();
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

  // others
  preventScroll(value)  {
    if(value) {
      this.renderer.addClass(document.body, 'prevent-scroll');
    } else  {
      this.renderer.removeClass(document.body, 'prevent-scroll');
    }
  }

  routeToUser(id) {
    if(id === this.currentUser['_id']) {
      this.router.navigateByUrl('/me/profile');
    } else  {
      this.router.navigateByUrl('/wondererwanderer/' + id)
    }
  }

}
