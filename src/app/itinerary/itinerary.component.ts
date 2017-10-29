import { Component, OnInit, OnDestroy, Output, EventEmitter, Renderer2, ElementRef } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs/Rx';
import { DaterangePickerComponent } from 'ng2-daterangepicker';

import { AuthService }           from '../auth/auth.service';
import { Itinerary }             from './itinerary';
import { ItineraryService }      from './itinerary.service';
import { ItineraryEventService } from './itinerary-events/itinerary-event.service';
import { FlashMessageService }   from '../flash-message';
import { User, UserService }     from '../user';
import { ResourceService }       from './itinerary-resources/resource.service';
import { NotificationService }   from '../notifications';
import { LoadingService }        from '../loading';

@Component({
  selector: 'ww-itinerary',
  templateUrl: './itinerary.component.html',
  styleUrls: ['./itinerary.component.scss']
})
export class ItineraryComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  preview = false;
  previewMessage = false;

  invalidPreview = false; // preview not avail for non-corporate/non-publish itin
  validUser = false;      // user not valid if not a member of itinerary
  validAccess = false;    // not valid when preview invalid && user not valid
  loadingMessage = "";

  creator = false; // to hide copy option if creator view preview

  itinerarySubscription: Subscription;
  itinerary;
  events = [];
  resources = [];

  currentUserSubscription: Subscription;
  currentUser: User;

  showUsersSearch = false;
  users: User[] = [];
  filteredUsers;
  newMembers = [];
  validAddUser = false;

  showAddNew = false;
  addAccommodation = false;
  addTransport = false;
  addActivity = false;
  addResource = false;

  inviteLink = '';

  authOptions = false;
  showSignin = false;
  showSignup = false;
  reload = false;

  // check dates for copying
  requestDate = false;
  dateFrom;
  dateTo;

  dateSubscription: Subscription;
  dateRange = []
  newDateRange = [];
  dailyNotes = [];

  options: any = {
    locale: { format: 'DD-MMM-YYYY' },
    alwaysShowCalendars: false,
  };

  // toggle show in mobile
  showNav = false;
  showCurrentMembers = false;
  currentRoute = '';

  constructor(
    private authService: AuthService,
    private element: ElementRef,
    private renderer: Renderer2,
    private loadingService: LoadingService,
    private itineraryService: ItineraryService,
    private itineraryEventService: ItineraryEventService,
    private resourceService: ResourceService,
    private flashMessageService: FlashMessageService,
    private notificationService: NotificationService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router) { }


  // log in / preview -> can see / cannot edit (log in + preview = can see itin ) + can add itin
  // log in / not preview -> only valid user in itinerary can see and edit (log in + not preview + valid user = can see/edit itin)
  // not log in / preview -> can see / cannot edit (log in + preview = can see itin ) + cannot add itin
  // not log in / not preview -> cannot see

  ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn();

    let segments = this.route.snapshot['_urlSegment'].segments;
    if(segments[0]['path'] === 'preview') {
      this.preview = true;
      this.reload = true;
    }

    this.route.params.forEach((params: Params) => {
      let id = params['id'];

      this.itineraryService.getItin(id).subscribe(
        result => {})

      this.itineraryEventService.getEvents(id).subscribe(
        eventResult => { this.events = eventResult })

      this.resourceService.getResources(id).subscribe(
        resourceResult => { this.resources = resourceResult })
    })

    this.itinerarySubscription = this.itineraryService.currentItinerary.subscribe(
      result =>  {
        this.itinerary = result;
        this.currentRoute = segments[3]['path']

        this.invalidPreview = false;
        this.validUser = false;
        this.validAccess = false;
        this.creator = false;

        if(this.currentUser) this.checkPreview();
        if(!this.isLoggedIn) this.checkAccess();

        if(!this.preview && this.isLoggedIn)  {
          this.getAllUsers();
          this.setInviteLink();
        }
      })

    this.currentUserSubscription = this.userService.updateCurrentUser.subscribe(
      result => {
        this.currentUser = result;

        if(this.itinerary) this.checkPreview();
      })

    this.dateSubscription = this.itineraryService.updateDate.subscribe(
      result => {
        this.dateRange = Object.keys(result).map(key => result[key]);
    })
  }

  ngOnDestroy() {
    if(this.itinerarySubscription) this.itinerarySubscription.unsubscribe();
    if(this.currentUserSubscription) this.currentUserSubscription.unsubscribe();
    if(this.dateSubscription) this.dateSubscription.unsubscribe();
  }

  checkPreview()  {
    if(this.isLoggedIn) {
      for (let i = 0; i < this.itinerary['members'].length; i++) {
        if(this.itinerary['members'][i]['_id'] === this.currentUser['_id']) {
          this.validUser = true;
        }
      }

      if(this.currentUser['_id'] === this.itinerary['created_by']['_id']) {
        this.creator = true;
      }
    }

    // invalid preview for non-corporate itinerary
    // invalid preview for corporate itinerary not published && not creator
    if((this.preview && !this.itinerary['corporate']['status']) ||
       (this.preview && this.itinerary['corporate']['status'] && !this.itinerary['corporate']['publish'] && !this.creator))  {
      this.invalidPreview = true;

      // setTimeout(() =>  {
      //   this.loadingService.setLoader(false, "");
      // }, 3000)

    } else  {
      this.checkAccess();
    }
  }

  checkAccess() {
    // valid access if preview, corporate & published
    // valid access if preview, corporate, not published & creator
    // valid access for non preview, logged in and valid user

    if((this.preview && this.itinerary['corporate']['status'] && this.itinerary['corporate']['publish']) ||
       (this.preview && this.itinerary['corporate']['status'] && this.creator) ||
       (!this.preview && this.isLoggedIn && this.validUser))  {

      this.validAccess = true;

    } else if(this.preview && !this.invalidPreview) {

      this.previewMessage = true;

      setTimeout(() => {
        this.previewMessage = false;
      }, 8000)
    } else if(!this.validAccess) {
      this.loadingMessage = 'You are not authorised to access the selected itinerary.';
      this.loadingService.setLoader(false, "");
    }

    // setTimeout(() =>  {
    //   this.loadingService.setLoader(false, "");
    // }, 3000)
  }

  getAllUsers() {
    this.userService.getAllUsers().subscribe(
      result => { this.filterUsers(result.users); })
  }

  filterUsers(users)  {
    this.users = users;

    for (let i = 0; i < this.itinerary['members'].length; i++) {
      for (let j = 0; j < this.users.length; j++) {
        if(this.itinerary['members'][i]['_id'] === this.users[j]['_id']) {
          this.users.splice(j,1);
          j--;
        }
      }
    }
    this.filteredUsers = this.users;
  }

  setInviteLink() {
    this.inviteLink = 'https://wondererwanderer.herokuapp.com/#/invite/me/' + this.itinerary['_id'];
  }


  // show add members modal
  inviteUsers()  {
    this.showUsersSearch = true;
    this.showAddNew = false;
    this.showCurrentMembers = false;
    this.preventScroll(true);
  }

  // add members modal
  filterSearch(text)  {
    if(!text)   {
      this.filteredUsers = this.users;
    } else  {
      this.filteredUsers = Object.assign([], this.users).filter(
        user => user.username.toLowerCase().indexOf(text.toLowerCase()) > -1
      )
    }
  }

  cancelShowUsers() {
    this.showUsersSearch = false;
    this.preventScroll(false);
    this.users.push.apply(this.users, this.newMembers);
    this.filteredUsers = this.users;

    this.newMembers = [];
  }

  toggleAdd(user) {
    let index = this.newMembers.indexOf(user);

    if(index > -1 ) {
      this.newMembers.splice(index, 1);
      this.filteredUsers.push(user);
    }

    if(index < 0 )  {
      this.newMembers.push(user);
      this.filteredUsers.splice(this.filteredUsers.indexOf(user),1)
    }

    if(this.newMembers.length > 0) {
      this.validAddUser = true;
    }

    if(this.newMembers.length < 1) {
      this.validAddUser = false;
    }
  }

  addMembers()  {
    for (let i = 0; i < this.newMembers.length; i++) {
      this.itinerary['members'].push(this.newMembers[i]);
    }

    this.itineraryService.editItin(this.itinerary, 'edit').subscribe(
      data => {
        for (let i = 0; i < this.newMembers.length; i++) {

          this.notificationService.newNotification({
            recipient: this.newMembers[i],
            originator: this.currentUser,
            message: " has included you to the itinerary" + this.itinerary['name'],
            link: "/me/itinerary/" + this.itinerary['_id'],
            read: false
          })

        }
      })

    this.flashMessageService.handleFlashMessage("Users added to the itinerary");

    this.cancelShowUsers();
  }


  // show and hide current members
  showMembers() {
    this.showCurrentMembers = true;

    this.showNav = false;
    this.showAddNew = false;
    this.preventScroll(true);
  }

  hideMembers() {
    this.showCurrentMembers = false;
    this.preventScroll(false);
  }


  // itinerary nav tabs to access forms
  showAddNewOptions() {
    this.showAddNew = true;

    this.showNav = false;
    this.showCurrentMembers = false;
    this.preventScroll(true);
  }

  cancelAddNewOptions() {
    this.showAddNew = false;
    this.preventScroll(false);
  }

  newAccommodation()  {
    this.addAccommodation = true;

    this.showAddNew = false;
    this.addTransport = false;
    this.addActivity = false;
    this.addResource = false;
    this.preventScroll(true);
  }

  newTransport()  {
    this.addTransport = true;

    this.showAddNew = false;
    this.addAccommodation = false;
    this.addActivity = false;
    this.addResource = false;
    this.preventScroll(true);
  }

  newActivity()  {
    this.addActivity = true;

    this.showAddNew = false;
    this.addAccommodation = false;
    this.addTransport = false;
    this.addResource = false;
    this.preventScroll(true);
  }

  newResource()  {
    this.addResource = true;

    this.showAddNew = false;
    this.addAccommodation = false;
    this.addTransport = false;
    this.addActivity = false;
    this.preventScroll(true);
  }


  // hide forms
  hideAccommodationForm(hide)  {
    this.addAccommodation = false;
    this.preventScroll(false);
  }

  hideTransportForm(hide)  {
    this.addTransport = false;
    this.preventScroll(false);
  }

  hideActivityForm(hide)  {
    this.addActivity = false;
    this.preventScroll(false);
  }

  hideResourceForm(hide)  {
    this.addResource = false;
    this.preventScroll(false);
  }



  // to close any open modal when navigate to child routes
  activateTab(route) {
    if(route !== '')  {
      this.currentRoute = route;
    }

    this.showNav = false;
    this.showAddNew = false;
    this.showCurrentMembers = false;
    this.showUsersSearch = false;
    this.preventScroll(false);
  }

  changeRoute(type) {
    this.currentRoute = type;
  }


  // to toggle nav and close any open modal in mobile < 420px
  toggleNav() {
    this.showNav = !this.showNav;

    if(this.showNav)  {
      this.showAddNew = false;
      this.showCurrentMembers = false;
      this.showUsersSearch = false;
    }
  }




  // copy a preview itinerary
  copy()  {
    if(this.isLoggedIn) {
      this.checkDates();
    } else if(!this.isLoggedIn) {
      this.authOptions = true;
      this.preventScroll(true);
    }

    this.showNav = false;
  }


  checkDates()  {
    if(this.itinerary['date_from'] !== '' && this.itinerary['date_from'] !== undefined) {
      this.dateFrom = this.itinerary['date_from'];
      this.dateTo = this.itinerary['date_to']
      this.duplicate();
    } else  {
      this.requestDate = true;
    }
  }

  selectedDate(value) {
    let startDate = value.start._d;
    let startDay = startDate.getDate();
    let startMonth = startDate.getMonth() + 1;
    let startYear = startDate.getFullYear();

    if(startDay < 10) startDay = "0" + startDay;
    if(startMonth < 10) startMonth = "0" + startMonth;
    this.dateFrom = startYear + "-" + startMonth + "-" + startDay + "T00:00:00.000Z";

    let endDate = value.end._d;
    let endDay = endDate.getDate();
    let endMonth = endDate.getMonth() + 1;
    let endYear = endDate.getFullYear();

    if(endDay < 10) endDay = "0" + endDay;
    if(endMonth < 10) endMonth = "0" + endMonth;
    this.dateTo = endYear + "-" + endMonth + "-" + endDay + "T00:00:00.000Z";

    this.setDailyNote();
  }

  setDailyNote()  {
    // let startDate = new Date(this.dateFrom);
    // let endDate = new Date(this.dateTo);

    let startArray = this.dateFrom.split(/[- :]/);
    let startDate = new Date(startArray[2], startArray[0] - 1, startArray[1]);

    let endArray = this.dateTo.split(/[- :]/);
    let endDate = new Date(endArray[2], endArray[0] - 1, endArray[1]);

    this.newDateRange = [];
    this.newDateRange.push('any day');
    this.newDateRange.push((new Date(startArray[2], startArray[0] - 1, startArray[1])).toISOString());

    while(startDate < endDate){
      let addDate = startDate.setDate(startDate.getDate() + 1);
      let newDate = new Date(addDate);
      this.newDateRange.push(newDate.toISOString());
    }

    this.dailyNotes = [];
    for (let i = 0; i < this.newDateRange.length; i++) {
      this.dailyNotes.push({
        date: this.newDateRange[i],
        note: "Note for the day (click to edit)\ne.g. Day trip to the outskirts"
      })
    }
  }

  dateSelected()  {
    this.requestDate = false;
    this.duplicate();
  }

  cancelDate()  {
    this.requestDate = false;
  }

  duplicate() {
    this.loadingService.setLoader(true, "Saving to your list of itineraries");

    let currentNote = this.itinerary['daily_note'].length;
    let newNote = this.newDateRange.length;

    if(currentNote === newNote) {
      this.dailyNotes = this.itinerary['daily_note'];
    } else if(currentNote < newNote)  {
      for (let i = 0; i < currentNote; i++) {
        this.dailyNotes[i] = this.itinerary['daily_note'][i];
      }
    } else if(currentNote > newNote)  {
      for (let i = 0; i < newNote; i++) {
        this.dailyNotes[i] = this.itinerary['daily_note'][i];
      }
    }

    let newItinerary = {
      name: this.itinerary['name'] + " - created by " + this.itinerary['created_by']['username'],
      date_from: this.dateFrom,
      date_to: this.dateTo,
      daily_note: this.dailyNotes,
      photo: this.itinerary['photo'],
      description: this.itinerary['description'],
      private: this.currentUser['settings']['itinerary_privacy'],
      view_only: this.currentUser['settings']['itinerary_viewonly'],
      members: [this.currentUser['_id']],
      admin: [this.currentUser['_id']],
      link: this.itinerary['link'],
      created_by: this.itinerary['created_by'],
      copied_from: this.itinerary['created_by'],
      invite_password: Math.random().toString(36).substr(2, 8),
      corporate:  {
        status: false,
        publish: false
      }
    }

    this.itineraryService.addItin(newItinerary).subscribe(
      result => {
        this.shareEvents(result.itinerary);
      })

    let newCopy = {
      user: this.currentUser['_id'],
      copied_on: new Date()
    }

    if(this.itinerary['copied_by'])  {
      this.itinerary['copied_by'].push(newCopy);
    } else  {
      this.itinerary['copied_by'] = [newCopy];
    }

    this.itineraryService.editItin(this.itinerary, '').subscribe(
      result =>{})
  }

  shareEvents(itinerary) {
    for (let i = 0; i < this.events.length; i++) {
      delete this.events[i]['_id'];
      delete this.events[i]['created_at'];
      delete this.events[i]['itinerary'];

      if(this.events[i]['type'] !== 'transport')  {
        if(this.events[i]['place']) {
          this.events[i]['place_id'] = this.events[i]['place']['place_id'];
          this.events[i]['lat'] = this.events[i]['place']['lat'];
          this.events[i]['lng'] = this.events[i]['place']['lng'];
        }
      }

      if(this.itinerary['date_from'] === '' || this.itinerary['date_from'] === undefined) {

        if(this.events[i]['type'] === 'activity') {
          let index = this.dateRange.indexOf(this.events[i]['date']);

          if(index < this.newDateRange.length)  {
            this.events[i]['date'] = this.newDateRange[index];
          } else if(index >= this.newDateRange.length)  {
            this.events[i]['date'] = 'any day';
          }
        }

        if(this.events[i]['type'] === 'accommodation')  {
          let CIIndex = this.dateRange.indexOf(this.events[i]['check_in_date']);
          let COIndex = this.dateRange.indexOf(this.events[i]['check_out_date']);

          if(CIIndex < this.newDateRange.length && COIndex < this.newDateRange.length) {
            this.events[i]['date'] = this.newDateRange[CIIndex];
            this.events[i]['check_in_date'] = this.newDateRange[CIIndex];
            this.events[i]['check_out_date'] = this.newDateRange[COIndex];
          } else  {
            this.events[i]['date'] = this.newDateRange[0];
            this.events[i]['check_in_date'] = this.newDateRange[0];
            this.events[i]['check_out_date'] = this.newDateRange[this.newDateRange.length - 1];
          }
        }

        if(this.events[i]['type'] === 'transport')  {
          let depIndex = this.dateRange.indexOf(this.events[i]['dep_date']);
          let arrIndex = this.dateRange.indexOf(this.events[i]['arr_date']);

          if(depIndex < this.newDateRange.length && arrIndex < this.newDateRange.length) {
            this.events[i]['date'] = this.newDateRange[depIndex];
            this.events[i]['dep_date'] = this.newDateRange[depIndex];
            this.events[i]['arr_date'] = this.newDateRange[arrIndex];
          } else  {
            this.events[i]['date'] = this.newDateRange[0];
            this.events[i]['dep_date'] = this.newDateRange[0];
            this.events[i]['arr_date'] = this.newDateRange[0];
          }
        }

      }

      this.itineraryEventService.copyEvent(this.events[i], itinerary).subscribe(
        result => {})
    }

    for (let i = 0; i < this.resources.length; i++) {
      delete this.resources[i]['_id'];
      delete this.resources[i]['created_at'];
      delete this.resources[i]['itinerary'];

      this.resources[i]['itinerary'] = itinerary;

      this.resourceService.copyResource(this.resources[i]).subscribe(
        result => {})
    }

    this.router.navigateByUrl('/me/itinerary/' + itinerary['_id'])
  }



  // sign up / log in
  cancelAuth()  {
    this.authOptions = false;
    this.preventScroll(false);
  }

  getSignin() {
    this.authOptions = false;
    this.showSignin = true;
    this.preventScroll(true);
  }

  getSignup() {
    this.authOptions = false;
    this.showSignup = true;
    this.preventScroll(true);
  }

  hideSignin()  {
    this.showSignin = false;
    this.preventScroll(false);
  }

  hideSignup()  {
    this.showSignup = false;
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

  scrollLeft()  {
    this.element.nativeElement.firstElementChild.children[4].firstElementChild.firstElementChild.scrollLeft -= 100;
  }

  scrollRight() {
    this.element.nativeElement.firstElementChild.children[4].firstElementChild.firstElementChild.scrollLeft += 100;
  }

  routeToUser(id) {
    if(id === this.currentUser['_id']) {
      this.router.navigateByUrl('/me/profile');
    } else  {
      this.router.navigateByUrl('/wondererwanderer/' + id)
    }
  }

  routeToPreview()  {
    this.loadingService.setLoader(true, "Routing to preview...");
    this.router.navigateByUrl('/preview/itinerary/' + this.itinerary['_id'])
  }

}
