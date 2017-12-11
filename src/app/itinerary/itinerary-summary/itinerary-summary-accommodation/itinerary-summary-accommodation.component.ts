import { Component, OnInit, OnDestroy, Input, Renderer2, HostListener } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Rx';

import { ItineraryEventService } from '../../itinerary-events/itinerary-event.service';
import { FlashMessageService }   from '../../../flash-message';
import { UserService }           from '../../../user';
import { LoadingService }        from '../../../loading';
import { FavouriteService }      from '../../../favourite';
import { RelationshipService }   from '../../../relationships';
import { RecommendationService } from '../../../recommendations/recommendation.service';
import { FileuploadService }     from '../../../shared';

@Component({
  selector: 'ww-itinerary-summary-accommodation',
  templateUrl: './itinerary-summary-accommodation.component.html',
  styleUrls: ['./itinerary-summary-accommodation.component.scss']
})
export class ItinerarySummaryAccommodationComponent implements OnInit, OnDestroy {
  @Input() event;
  @Input() preview;
  @Input() dateRange;
  @Input() itinerary;
  @Input() summary;

  currentUserSubscription: Subscription;
  currentUser;
  sameUser;

  showContactDetails = false;

  itineraries = [];

  showMenu = false;
  allowFav = false;
  favDate = undefined;
  copying = false;
  editing = false;
  deleteAccommodation = false;

  editAccommodationForm: FormGroup;

  // time picker
  ats = true;
  initHourIn = "";
  initMinuteIn = "";
  timePickerIn = false;
  hourIn = "";
  minuteIn = "";

  initHourOut = "";
  initMinuteOut = "";
  timePickerOut = false;
  hourOut = "";
  minuteOut = "";

  // recommend
  relationshipSubscription: Subscription;
  followings = [];
  recommending = false;
  users = [];
  filteredResult = [];
  selectedUsers = []
  validAddUser = false;
  message = '';

  selectUsers = true;
  addMsg = false;

  // control check out date edit
  outDateRange = [];
  outRange = [];
  months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  dayWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  constructor(
    private renderer: Renderer2,
    private router: Router,
    private userService: UserService,
    private favouriteService: FavouriteService,
    private itineraryEventService: ItineraryEventService,
    private loadingService: LoadingService,
    private relationshipService: RelationshipService,
    private recommendationService: RecommendationService,
    private fileuploadService: FileuploadService,
    private flashMessageService: FlashMessageService,
    private formBuilder: FormBuilder) {
      this.editAccommodationForm = this.formBuilder.group({
        'name': ['', Validators.required],
        'formatted_address': '',
        'website': '',
        'international_phone_number': '',
        'check_in_date': '',
        'check_out_date': '',
        'check_in_time': '',
        'check_out_time': '',
        'city':'',
        'note': '',
      })
    }

  ngOnInit()  {
    this.currentUserSubscription = this.userService.updateCurrentUser.subscribe(
      result => {
        this.currentUser = result;
        this.checkSameUser();
        this.filterItineraries();
        this.checkFav();
      })

    this.event['formatted_note'] = this.event['note'].replace(/\r?\n/g, '<br/> ');

    this.initTime();

    this.relationshipSubscription = this.relationshipService.updateRelationships.subscribe(
     result => {
       this.filterFollowings(result['followings']);

       this.followings = Object.keys(result['followings']).map(key => result['followings'][key]);
     })

     this.sortDateRange();
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
      this.timePickerIn = false;
      this.timePickerOut = false;
    }
  }

  // @HostListener('window:popstate', ['$event'])
  // onPopState(event) {
  //   console.log('Back button pressed');
  //   event.preventDefault()
  // }

  ngOnDestroy() {
    this.currentUserSubscription.unsubscribe();
  }

  checkSameUser() {
    if(this.currentUser['_id'] === this.event['user']['_id']) {
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

  initTime()  {
    if(this.event['check_in_time'] === 'anytime') {
      this.hourIn = 'anytime';
      this.minuteIn = "00";
    } else  {
      this.hourIn = this.event['check_in_time'].slice(0,2);
      this.minuteIn = this.event['check_in_time'].slice(3,6);
    }

    this.initHourIn = this.hourIn;
    this.initMinuteIn = this.minuteIn;

    if(this.event['check_out_time'] === 'anytime')  {
      this.hourOut = 'anytime';
      this.minuteOut = "00";
    } else  {
      this.hourOut = this.event['check_out_time'].slice(0,2);
      this.minuteOut = this.event['check_out_time'].slice(3,6);
    }

    this.initHourOut = this.hourOut;
    this.initMinuteOut = this.minuteOut;
  }

  checkFav()  {
    let today = new Date();
    let start = new Date(this.itinerary['date_from'])

    for (let i = 0; i < this.event['favourite'].length; i++) {
      if(this.currentUser['_id'] === this.event['favourite'][i]['user'])  {
        this.favDate = this.event['favourite'][i]['date'];
      }
    }

    if(today.getTime() >= start.getTime())  {
      if(!this.favDate) {
        this.allowFav = true;
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

  // manage dates for check out
  sortDateRange() {
    this.outRange = [];
    for (let i = 0; i < this.dateRange.length; i++) {
      if(this.itinerary['num_days'])  {
        this.outRange.push({
          formatted: this.dateRange[i],
          date: this.dateRange[i],
        });
      } else  {
        if(this.dateRange[i] === 'any day') {
          this.outRange.push({
            formatted: this.dateRange[i],
            date: this.dateRange[i],
          })
        } else  {
          let ndate = new Date(this.dateRange[i])
          let year = ndate.getFullYear();
          let month = ndate.getMonth();
          let date = ndate.getDate();
          let day = ndate.getDay();

          let fdate;
          if(date < 10) {
            fdate = '0' + date;
          } else{
            fdate = date
          }

          this.outRange.push({
            formatted:"Day " + i + ", " + fdate + " " + this.months[month] + " " + year + " (" + this.dayWeek[day] + ")",
            date: this.dateRange[i]
          })
        }
      }
    }

    this.filterOutRange();
  }

  filterOutRange()  {
    let index = this.dateRange.indexOf(this.event['check_in_date']);
    this.outDateRange = this.outRange.slice(index);
  }

  dateChange()  {
    let inDate = this.editAccommodationForm.value.check_in_date;
    let outDate = this.editAccommodationForm.value.check_out_date;

    let index = this.dateRange.indexOf(inDate);
    this.outDateRange = this.outRange.slice(index);

    if(inDate > outDate)  {
      this.editAccommodationForm.patchValue({
        check_out_date: inDate,
      })

      if(this.hourIn === 'anytime') {
        this.hourOut = 'anytime'
      } else  {
        this.hourOut = this.hourIn;
        this.minuteOut = this.minuteIn;
      }
    }
  }

  //recommend section
  recommend() {
    this.recommending = true;
    this.preventScroll(true);
  }

  cancelRecommend()  {
    this.recommending = false;
    this.selectUsers = false;
    this.validAddUser = false;
    this.addMsg = false;
    this.message = '';
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
      this.filteredResult.splice(this.filteredResult.indexOf(user),1)
    }

    if(this.selectedUsers.length > 0) {
      this.validAddUser = true;
    }

    if(this.selectedUsers.length < 1) {
      this.validAddUser = false;
    }
  }

  usersSelected() {
    this.selectUsers = false;
    this.addMsg = true;
  }

  logRecMessage(msg) {
    this.message = msg;
  }

  recommendTo() {
    for (let i = 0; i < this.selectedUsers.length; i++) {
      let recommendation = {
        recipient: this.selectedUsers[i]["_id"],
        originator: this.currentUser['_id'],
        place: this.event['place'],
        message: this.message,
        note: this.event['note'],
        type: this.event['type'],
        city: this.event['city'],
      }

      this.recommendationService.addRecommendation(recommendation).subscribe(
        result =>{ })
    }

    this.flashMessageService.handleFlashMessage("Recommendation sent");

    this.cancelRecommend();
  }

  backToSelectUsers() {
    this.selectUsers = true;
    this.addMsg = false;
  }



  //favourite section
  favourite() {
    this.loadingService.setLoader(true, "Saving as favourite...");

    let favourite = {
      lat: this.event['place']['lat'],
      lng: this.event['place']['lng'],
      name: this.event['place']['name'],
      address: this.event['place']['formatted_address'],
      country: this.event['place']['country'],
      place_id: this.event['place']['place_id'],
      itinerary: this.itinerary['_id'],
      user: this.currentUser['_id']
    }

    this.favouriteService.addFav(favourite).subscribe(
      result  =>  {
        this.loadingService.setLoader(false, "");
        this.flashMessageService.handleFlashMessage(result.message);
      })

    this.event['favourite'].push({
      date: new Date(),
      user: this.currentUser['_id']
    });

    this.allowFav = false;
    this.favDate = new Date();

    this.itineraryEventService.editEvent(this.event).subscribe(
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
    let copiedEvent = this.event;

    delete copiedEvent['_id'];
    delete copiedEvent['created_at'];
    delete copiedEvent['itinerary'];

    if(!itinerary['num_days']) {
      copiedEvent['check_in_date'] = itinerary['date_from'];
      copiedEvent['check_out_date'] = itinerary['date_to'];
    } else  {
      copiedEvent['check_in_date'] = this.dateRange[0];
      copiedEvent['check_out_date'] = this.dateRange[this.dateRange.length - 1];
    }

    if(copiedEvent['place'])  {
      copiedEvent['place_id'] = copiedEvent['place']['place_id'];
      copiedEvent['lat'] = copiedEvent['place']['lat'];
      copiedEvent['lng'] = copiedEvent['place']['lng'];
    }

    copiedEvent['date'] = copiedEvent['check_in_date'];
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
    this.editAccommodationForm.patchValue({
      name: this.event['name'],
      formatted_address: this.event['place']['formatted_address'],
      website: this.event['place']['website'],
      international_phone_number: this.event['place']['international_phone_number'],
      check_in_date: this.event['check_in_date'],
      check_out_date: this.event['check_out_date'],
      city: this.event['city'],
      note: this.event['note'],
    })
  }

  edit()  {
    this.patchValue()

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


  // select check in time
  selectPickerIn()  {
    this.timePickerIn = true;
  }

  selectHourIn(h) {
    this.hourIn = h;
  }

  selectMinuteIn(m) {
    this.minuteIn = m;
  }

  // select check out time
  selectPickerOut()  {
    this.timePickerOut = true;
  }

  selectHourOut(h) {
    this.hourOut = h;
  }

  selectMinuteOut(m) {
    this.minuteOut = m;
  }


  saveEdit() {
    this.loadingService.setLoader(true, "Saving...");

    let editedAccommodation = this.editAccommodationForm.value;
    let originalAccommodation = this.event;

    // date and time

    if(this.hourIn === 'anytime') {
      editedAccommodation['check_in_time'] = 'anytime';
    } else  {
      editedAccommodation['check_in_time'] = this.hourIn + ':' + this.minuteIn;
    }

    if(this.hourOut === 'anytime') {
      editedAccommodation['check_out_time'] = 'anytime';
    } else  {
      editedAccommodation['check_out_time'] = this.hourOut + ':' + this.minuteOut;
    }

    if(editedAccommodation['check_in_date'] === "any day") {
      editedAccommodation['check_in_date'] = originalAccommodation['check_in_date'];
    }

    if(editedAccommodation['check_out_date'] === "any day") {
      editedAccommodation['check_out_date'] = originalAccommodation['check_out_date'];
    }


    // others

    for(let value in editedAccommodation) {
      originalAccommodation[value] = editedAccommodation[value];
    }

    this.event['formatted_note'] = originalAccommodation['note'].replace(/\r?\n/g, '<br/> ');

    originalAccommodation['date'] = originalAccommodation['check_in_date'];
    originalAccommodation['time'] = originalAccommodation['check_in_time'];

    this.itineraryEventService.editEvent(originalAccommodation).subscribe(
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
    this.deleteAccommodation = true;
    this.preventScroll(true);
  }

  cancelDelete()  {
    this.deleteAccommodation = false;
    this.preventScroll(false);
  }

  confirmDelete() {
    this.itineraryEventService.deleteEvent(this.event).subscribe(
      result => {

        if(this.event['photo']['public_id']) {
          this.fileuploadService.deleteFile(this.event['photo']['public_id']).subscribe(
            result => {})
        }

        this.flashMessageService.handleFlashMessage(result.message);
      })

    this.cancelDelete();
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
      this.router.navigateByUrl('/me/home');
    } else  {
      this.router.navigateByUrl('/wondererwanderer/' + id)
    }
  }
}
