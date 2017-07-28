import { Component, OnInit, OnDestroy, HostListener, Renderer2, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Rx';
import { DaterangePickerComponent } from 'ng2-daterangepicker';
import { Title }        from '@angular/platform-browser';

import { Itinerary }              from '../itinerary';
import { ItineraryService }       from '../itinerary.service';
import { ItineraryEventService }  from '../itinerary-events/itinerary-event.service';
import { ResourceService }        from '../itinerary-resources/resource.service';
import { UserService }            from '../../user';
import { FlashMessageService }    from '../../flash-message';
import { NotificationService }    from '../../notifications';
import { LoadingService }         from '../../loading';

@Component({
  selector: 'ww-itinerary-settings',
  templateUrl: './itinerary-settings.component.html',
  styleUrls: ['./itinerary-settings.component.scss']
})
export class ItinerarySettingsComponent implements OnInit, OnDestroy {
  @ViewChild(DaterangePickerComponent)
  private picker: DaterangePickerComponent;

  editItineraryForm: FormGroup;
  dateChanged = false;
  dateRange = [];
  newDateRange = [];
  newDailyNote = [];
  itinDateSubscription: Subscription;

  showOptions = [];
  deleteItinerary = false;
  leaveItinerary = false;

  currentItinerarySubscription: Subscription;
  currentItinerary;
  private = false;

  currentUserSubscription: Subscription;
  currentUser;
  currentUserAdmin;
  masterAdmin = false;

  adminInfo = false;
  copyInfo = false;
  shareInfo = false;

  // share itinerary
  shareType;
  itineraries;
  eventSubscription: Subscription;
  events = [];

  updateResourcesSubscription: Subscription;
  resources = [];

  itemsSelected = false;

  shared = false;
  shareItin = false;
  shareAll = true;
  shareIndex = [];
  shareIndexResource = [];

  showUsers = false;
  users = [];
  filteredResult = [];
  selectedUsers = []
  validAddUser = false;

  dateFrom;
  dateTo;

  options = {
    locale: { format: 'YYYY-MM-DD' },
    alwaysShowCalendars: false,
  }

  constructor(
    private titleService: Title,
    private renderer: Renderer2,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private itineraryService: ItineraryService,
    private itineraryEventService: ItineraryEventService,
    private resourceService: ResourceService,
    private flashMessageService: FlashMessageService,
    private notificationService: NotificationService,
    private loadingService: LoadingService,
    private router: Router) {
      this.editItineraryForm = this.formBuilder.group({
        'name': ['', Validators.required],
        'date_from': ['', Validators.required],
        'date_to': ['', Validators.required],
        'invite_password': '',
      })
    }

  ngOnInit() {
    this.currentItinerarySubscription = this.itineraryService.currentItinerary.subscribe(
      result => {
        this.currentItinerary = result;
        this.currentItinerary['date_from'] = result['date_from'].slice(0,10);
        this.currentItinerary['date_to'] = result['date_to'].slice(0,10);
        this.private = result['private'];

        let title = this.currentItinerary['name'] + " | Settings"
        this.titleService.setTitle(title);

        this.getUsers();
        this.sortAdmin();

        setTimeout(() => {
          this.updateDateRange();
        },1000)
      })

    this.currentUserSubscription = this.userService.updateCurrentUser.subscribe(
      result => {
        this.currentUser = result;
        this.checkStatus();
        this.patchValue();
        this.filterItineraries();
      })

    this.eventSubscription = this.itineraryEventService.updateEvent.subscribe(
      result => {
        this.filterEvents(result);
      })

    this.updateResourcesSubscription = this.resourceService.updateResources.subscribe(
      result => {
        this.resources = Object.keys(result).map(key => result[key]);
        for (let i = 0; i < this.resources.length; i++) {
          this.shareIndexResource.push(true);
        }
      })

    this.itinDateSubscription = this.itineraryService.updateDate.subscribe(
      result => {
        this.dateRange = Object.keys(result).map(key => result[key]);
    })
  }

  getUsers()  {
    this.userService.getAllUsers().subscribe(
      result => {
        this.filterUsers(result.users);
      })
  }

  @HostListener('document:click', ['$event'])
  checkClick(event) {
    if(!event.target.classList.contains("fa-cog")) {
      for (let i = 0; i < this.showOptions.length; i++) {
        this.showOptions[i] = false;
      }
    }

    if(!event.target.classList.contains("info")) {
      for (let i = 0; i < this.showOptions.length; i++) {
        this.copyInfo = false;
        this.shareInfo = false;
      }
    }
  }

  ngOnDestroy() {
    if(this.currentUserSubscription) this.currentUserSubscription.unsubscribe();
    if(this.currentItinerarySubscription) this.currentItinerarySubscription.unsubscribe();
    if(this.eventSubscription) this.eventSubscription.unsubscribe();
    if(this.updateResourcesSubscription) this.updateResourcesSubscription.unsubscribe();
    if(this.itinDateSubscription) this.itinDateSubscription.unsubscribe();
    this.loadingService.setLoader(true, "");
  }

  sortAdmin() {
    for (let i = 0; i < this.currentItinerary['members'].length; i++) {
      this.showOptions.push(false);

      for (let j = 0; j < this.currentItinerary['admin'].length; j++) {
        if(this.currentItinerary['members'][i]['_id'] === this.currentItinerary['admin'][j])  {
          this.currentItinerary['members'][i]['admin'] = true;
        }
      }
    }
  }

  checkStatus()  {
    for (let i = 0; i < this.currentItinerary['admin'].length; i++) {
      if(this.currentItinerary['admin'][i] === this.currentUser['_id']) {
        this.currentUserAdmin = true;
      }
    }

    for (let i = 0; i < this.currentItinerary['members'].length; i++) {
      if(this.currentItinerary['members'][i]['_id'] === this.currentUser['_id'])  {
        this.currentItinerary['members'][i]['hide_option'] = true;
      }

      if(this.currentItinerary['members'][i]['_id'] === this.currentItinerary['created_by']['_id']) {
        this.currentItinerary['members'][i]['hide_option'] = true;
      }
    }

    if(this.currentUser['_id'] === this.currentItinerary['members'][0]['_id']) {
      this.masterAdmin = true;
    }

    if(this.currentItinerary['shares'].length !== 0) {
      this.shared = true;
    }

    setTimeout(() =>  {
      this.loadingService.setLoader(false, "");
      this.preventScroll(false);
    }, 1000)
  }

  patchValue()  {
    this.editItineraryForm.patchValue({
      name: this.currentItinerary['name'],
      date_from: this.formatDate(this.currentItinerary['date_from']),
      date_to: this.formatDate(this.currentItinerary['date_to']),
      invite_password: this.currentItinerary['invite_password'],
    })

    this.updateDateRange();
  }

  formatDate(date)  {
    let d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }

  updateDateRange() {
    this.dateFrom = this.currentItinerary['date_from'];
    this.dateTo = this.currentItinerary['date_to'];

    setTimeout(() =>  {
      this.picker.datePicker.setStartDate(this.dateFrom);
      this.picker.datePicker.setEndDate(this.dateTo);
    },1000)
  }

  filterUsers(users)  {
    this.users = users;

    for (let i = 0; i < this.currentItinerary['members'].length; i++) {
      for (let j = 0; j < this.users.length; j++) {
        if(this.currentItinerary['members'][i]['_id'] === this.users[j]['_id']) {
          this.users.splice(j,1);
          j--
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

  filterEvents(events)  {
    this.events = []

    for (let i = 0; i < events.length; i++) {
      if(events[i]['type'] === 'activity')  {
        this.events.push(events[i])
      }
    }
  }

  // display dropdown option for each member
  showMemberOption(i)  {
    this.showOptions[i] = true;
  }

  makeAdmin(member, i) {
    member['admin'] = true;
    this.showOptions[i] = false;

    this.currentItinerary['admin'].push(member['_id'])

    this.itineraryService.editItin(this.currentItinerary, 'edit')
        .subscribe(data => {})
  }

  removeAdmin(member, i) {
    member['admin'] = false;
    this.showOptions[i] = false;

    this.currentItinerary['admin'].splice(this.currentItinerary['admin'].indexOf(member['_id']), 1);

    this.itineraryService.editItin(this.currentItinerary, 'edit').subscribe(
         data => {})
  }

  removeFromItin(member, i) {
    this.showOptions[i] = false;

    this.currentItinerary['members'].splice(i, 1)

    if(member['admin']) {
      this.currentItinerary['admin'].splice(this.currentItinerary['admin'].indexOf(member['_id']), 1);
    }

    this.itineraryService.editItin(this.currentItinerary, 'edit').subscribe(
         data => {})
  }

  // edit section
  selectedDate(value) {
    let startDate = value.start._d;
    let startDay = startDate.getDate();
    if(startDay < 10) {
      startDay = "0" + startDay;
    }

    let startMonth = startDate.getMonth() + 1;
    if(startMonth < 10) {
      startMonth = "0" + startMonth;
    }

    let startYear = startDate.getFullYear();
    this.dateFrom = startYear + "-" + startMonth + "-" + startDay + "T00:00:00.000Z";

    let endDate = value.end._d;
    let endDay = endDate.getDate();
    let endMonth = endDate.getMonth() + 1;
    let endYear = endDate.getFullYear();
    this.dateTo = endMonth + "-" + endDay + "-" + endYear;

    this.editItineraryForm.patchValue({
      date_from: this.dateFrom,
      date_to: this.dateTo
    })
  }

  undoEdit()  {
    this.patchValue();
    this.private = this.currentItinerary['private'];
  }

  checkEdit() {
    this.preventScroll(true);

    if(this.currentItinerary['date_from'] === this.editItineraryForm.value['date_from'] &&
       this.currentItinerary['date_to'] === this.editItineraryForm.value['date_to'])  {
      this.saveEdit()
    } else  {
      this.dateChanged = true;
      this.setDateRange();
    }
  }

  setDateRange()  {
    let editedDetails = this.editItineraryForm.value;

    let startDate = new Date(editedDetails['date_from']);
    let endDate = new Date(editedDetails['date_to']);

    this.newDateRange = [];

    this.newDateRange.push('any day');
    this.newDateRange.push((new Date(editedDetails['date_from'])).toISOString());

    while(startDate < endDate){
      let addDate = startDate.setDate(startDate.getDate() + 1);
      let newDate = new Date(addDate);
      this.newDateRange.push(newDate.toISOString());
    }

    this.setDailyNotes();
  }

  setDailyNotes() {
    this.newDailyNote = [];

    for (let i = 0; i < this.newDateRange.length; i++) {
      this.newDailyNote.push({
        date: this.newDateRange[i],
        note: "e.g. Day trip to the outskirts"
      })
    }
  }

  sameDates() {
    this.dateChanged = false;

    for (let i = 0; i < this.events.length; i++) {
      let index = this.newDateRange.indexOf(this.events[i]['date']);

      if(index < 0) {
        this.events[i]['date'] = "any day";
        this.updateEvent(this.events[i]);
      }
    }

    for (let i = 0; i < this.currentItinerary['daily_note'].length; i++) {
      let index = this.newDateRange.indexOf(this.currentItinerary['daily_note'][i]['date']);

      if(index > -1)  {
        this.newDailyNote[index]['note'] = this.currentItinerary['daily_note'][i]['note'];
      }
    }

    this.currentItinerary['daily_note'] = this.newDailyNote;
    this.saveEdit();
  }

  sameDays()  {
    this.dateChanged = false;

    for (let i = 0; i < this.events.length; i++) {
      let index = this.dateRange.indexOf(this.events[i]['date']);

      if(index < this.newDateRange.length && index > -1) {
        this.events[i]['date'] = this.newDateRange[index];
        this.updateEvent(this.events[i]);
      }

      if(index >= this.newDateRange.length) {
        this.events[i]['date'] = "any day";
        this.updateEvent(this.events[i]);
      }
    }

    if(this.newDateRange.length <= this.dateRange.length)  {
      for (let i = 0; i < this.newDailyNote.length; i++) {
        this.newDailyNote[i]['note'] = this.currentItinerary['daily_note'][i]['note'];
      }
    } else if(this.newDateRange.length > this.dateRange.length)  {
      for (let i = 0; i < this.currentItinerary['daily_note'].length; i++) {
        this.newDailyNote[i]['note'] = this.currentItinerary['daily_note'][i]['note'];
      }
    }

    this.currentItinerary['daily_note'] = this.newDailyNote;
    this.saveEdit();
  }

  cancelEdit()  {
    this.dateChanged = false;
    this.preventScroll(false);
  }

  updateEvent(event) {
    this.itineraryEventService.editEvent(event).subscribe(
      result => {})
  }

  saveEdit() {
    this.loadingService.setLoader(true, "Saving...");

    let editedDetails = this.editItineraryForm.value;

    for (let value in editedDetails)  {
      this.currentItinerary[value] = editedDetails[value]
    }

    this.currentItinerary['private'] = this.private;

    this.itineraryService.editItin(this.currentItinerary, 'edit').subscribe(
          data => {
            this.loadingService.setLoader(false, "");
            this.preventScroll(false);

            this.flashMessageService.handleFlashMessage(data.message);
          })
  }

  // delete section
  confirmDelete()  {
    this.itineraryService.deleteItin(this.currentItinerary)
        .subscribe(
          data => {
            this.router.navigateByUrl('/me');
            this.flashMessageService.handleFlashMessage(data.message);
        })
    this.deleteItinerary = false;
  }

  confirmLeave()  {
    let members = this.currentItinerary['members'];
    let admin = this.currentItinerary['admin'];

    for (let i = 0; i < members.length; i++) {
      if(members[i]['_id'] === this.currentUser['_id']) {
        if(members[i]['admin'])  {
          for (let j = 0; j < admin.length; j++) {
            if(admin[j] === this.currentUser['_id']) {
              admin.splice(j,1);
              members.splice(i,1);
            } else  {
              members.splice(i,1)
            }
          }
        }
      }
    }

    this.itineraryService.editItin(this.currentItinerary, 'delete').subscribe(
        data => {
          for (let i = 0; i < this.currentItinerary['members'].length; i++) {
            this.notificationService.newNotification({
              recipient: this.currentItinerary['members'][i]['_id'],
              originator: this.currentUser['_id'],
              message: " has left the itinerary - " + this.currentItinerary['name'],
              link: "/me/itinerary/" + this.currentItinerary['_id'],
              read: false
            }).subscribe(data => {})
          }
          this.router.navigateByUrl('/me');
        })
  }

  // share section
  share(type) {
    this.shareItin = true;
    this.shareType = type;
  }

  cancelShare() {
    this.shareItin = false;
  }

  routeToUser(id) {
    if(id === this.currentUser['_id']) {
      this.router.navigateByUrl('/me/profile');
    } else  {
      this.router.navigateByUrl('/wondererwanderer/' + id)
    }
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
