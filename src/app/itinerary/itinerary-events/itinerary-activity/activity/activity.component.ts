import { Component, OnInit, OnDestroy, Input, Renderer2, HostListener } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router }       from '@angular/router';
import { Subscription } from 'rxjs/Rx';

import { ItineraryService }      from '../../../itinerary.service';
import { ItineraryEvent }        from '../../itinerary-event';
import { ItineraryEventService } from '../../itinerary-event.service';
import { FlashMessageService }   from '../../../../flash-message';
import { UserService }           from '../../../../user';
import { LoadingService }        from '../../../../loading';
import { CheckInService }        from '../../../../check-in';
import { RelationshipService }   from '../../../../relationships';
import { RecommendationService } from '../../../../recommendations';

@Component({
  selector: 'ww-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss']
})
export class ActivityComponent implements OnInit, OnDestroy {
  @Input() activity;
  @Input() dateRange;
  @Input() itinerary;
  @Input() totalActivities;
  @Input() index;
  @Input() summary;
  @Input() preview;

  currentUserSubscription: Subscription;
  currentUser;
  sameUser;
  mealTag = false;
  showContactDetails = false;

  itineraries = [];

  showMenu = false;
  allowCheckin = false;
  checkedInDate = undefined;
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

  // recommend
  relationshipSubscription: Subscription;
  followings = [];
  recommending = false;
  users = [];
  filteredResult = [];
  selectedUsers = []
  validAddUser = false;
  message = '';
  usersSelected = false;

  constructor(
    private formBuilder: FormBuilder,
    private renderer: Renderer2,
    private router: Router,
    private userService: UserService,
    private checkinService: CheckInService,
    private itineraryEventService: ItineraryEventService,
    private relationshipService: RelationshipService,
    private recommendationService: RecommendationService,
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
        this.checkCheckIn();
      })

    if(this.activity['location'] && this.activity['place']['opening_hours']){
      this.activity['formatted_hours'] = this.activity['place']['opening_hours'].replace(/\r?\n/g, '<br/> ');
    }

    this.checkMealTag();
    this.activity['formatted_note'] = this.activity['note'].replace(/\r?\n/g, '<br/> ');

    this.initTime();

    this.relationshipSubscription = this.relationshipService.updateRelationships.subscribe(
     result => {
       this.filterFollowings(result['followings']);

       this.followings = Object.keys(result['followings']).map(key => result['followings'][key]);
     })
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
      let admin = this.itinerary['admin'];
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
      if(this.currentUser['itineraries'][i]['_id'] !== this.itinerary['_id'])  {
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

  checkCheckIn()  {
    let today = new Date();
    let start = new Date(this.itinerary['date_from'])

    for (let i = 0; i < this.activity['checked_in'].length; i++) {
      if(this.currentUser['_id'] === this.activity['checked_in'][i]['user'])  {
        this.checkedInDate = this.activity['checked_in'][i]['date'];
      }
    }

    if(today.getTime() >= start.getTime())  {
      if(!this.checkedInDate) {
        this.allowCheckin = true;
      }
    }
  }

  filterFollowings(followings)  {
    this.filteredResult = [];
    this.users = [];
    for (let i = 0; i < followings.length; i++) {
      this.users.push(followings[i].following);
    }

    this.filteredResult = this.users;
  }


  //recommend section
  recommend() {
    this.recommending = true;
    this.preventScroll(true);
  }

  cancelRecommend()  {
    this.recommending = false;
    this.usersSelected = false;
    this.validAddUser = false;
    this.users.push.apply(this.users, this.selectedUsers);
    this.selectedUsers = [];
    this.preventScroll(false);
  }

  filterSearch(text)  {
    if(!text)   {
      this.filteredResult = this.users;
    } else  {
      this.filteredResult = Object.assign([], this.users).filter(
        user => user.username.toLowerCase().indexOf(text.toLowerCase()) > -1
      )
    }
  }

  toggleAdd(user) {
    let index = this.selectedUsers.indexOf(user);
    if(index > -1 ) {
      this.selectedUsers.splice(index, 1);
      this.filteredResult.push(user);
    }

    if(index < 0 )  {
      this.selectedUsers.push(user);
      this.filteredResult.splice(this.filteredResult.indexOf(user),1);
    }

    if(this.selectedUsers.length > 0) {
      this.validAddUser = true;
    }

    if(this.selectedUsers.length < 1) {
      this.validAddUser = false;
    }
  }

  logMessage(msg) {
    this.message = msg;
  }

  recommendTo() {
    for (let i = 0; i < this.selectedUsers.length; i++) {
      let recommendation = {
        recipient: this.selectedUsers[i]["_id"],
        originator: this.currentUser['_id'],
        place: this.activity['place'],
        message: this.message,
        note: this.activity['note'],
        type: this.activity['type'],
      }

      this.recommendationService.addRecommendation(recommendation).subscribe(
        result =>{ })
    }

    this.cancelRecommend();

    this.flashMessageService.handleFlashMessage("Recommendation sent");
  }

  backToSelectUsers() {
    this.usersSelected = false;
  }


  //check in section
  checkin() {
    this.loadingService.setLoader(true, "Checking you in...");

    let checkin = {
      lat: this.activity['place']['lat'],
      lng: this.activity['place']['lng'],
      name: this.activity['place']['name'],
      address: this.activity['place']['formatted_address'],
      country: this.activity['place']['country'],
      place_id: this.activity['place']['place_id'],
      itinerary: this.itinerary['_id'],
      user: this.currentUser['_id']
    }

    this.checkinService.addCheckin(checkin).subscribe(
      result  =>  {
        this.loadingService.setLoader(false, "");
        this.flashMessageService.handleFlashMessage(result.message);
      })

    this.activity['checked_in'].push({
      date: new Date(),
      user: this.currentUser['_id']
    });

    this.allowCheckin = false;
    this.checkedInDate = new Date();

    this.itineraryEventService.editEvent(this.activity).subscribe(
      result => {})
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
    if(this.activity.location)  {
      this.editActivityForm.patchValue({
        name: this.activity['name'],
        meals: this.activity['meals'],
        opening_hours: this.activity['place']['opening_hours'],
        entry_fee: this.activity['entry_fee'],
        website: this.activity['place']['website'],
        formatted_address: this.activity['place']['formatted_address'],
        international_phone_number: this.activity['place']['international_phone_number'],
        date: this.activity['date'],
        note: this.activity['note'],
      })
    }

    if(!this.activity.location) {
      this.editActivityForm.patchValue({
        name: this.activity['name'],
        date: this.activity['date'],
        note: this.activity['note'],
      })
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

    if(originalActivity['place']['opening_hours'])  {
      this.activity['formatted_hours'] = originalActivity['place']['opening_hours'].replace(/\r?\n/g, '<br/> ');
    }

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
    this.itineraryEventService.deleteEvent(this.activity).subscribe(
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
