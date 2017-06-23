import { Component, OnInit, OnDestroy, Input, Renderer2, HostListener } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Rx';

import { ItineraryEvent }        from '../../itinerary-event';
import { ItineraryEventService } from '../../itinerary-event.service';
import { FlashMessageService }   from '../../../../flash-message';
import { UserService }           from '../../../../user';
import { LoadingService }        from '../../../../loading';

@Component({
  selector: 'ww-transport',
  templateUrl: './transport.component.html',
  styleUrls: ['./transport.component.scss']
})
export class TransportComponent implements OnInit, OnDestroy {
  @Input() event: ItineraryEvent;
  @Input() itinDateRange;
  @Input() currentItinerary;
  @Input() totalTransports;
  @Input() index;
  @Input() summary;

  currentUserSubscription: Subscription;
  currentUser;
  sameUser;

  itineraries = [];

  showMenu = false;
  copying = false;
  editing = false;
  deleteTransport = false;

  editTransportForm: FormGroup;

  // time picker
  ats = true;
  initHourDep = "";
  initMinuteDep = "";
  timePickerDep = false;
  hourDep = "";
  minuteDep = "";

  initHourArr = "";
  initMinuteArr = "";
  timePickerArr = false;
  hourArr = "";
  minuteArr = "";

  constructor(
    private renderer: Renderer2,
    private router: Router,
    private userService: UserService,
    private itineraryEventService: ItineraryEventService,
    private loadingService: LoadingService,
    private flashMessageService: FlashMessageService,
    private formBuilder: FormBuilder) {
      this.editTransportForm = this.formBuilder.group({
        'reference_number': '',
        'dep_terminal': '',
        'arr_terminal': '',
        'dep_station': '',
        'arr_station': '',
        'dep_city': ['', Validators.required],
        'arr_city': ['', Validators.required],
        'dep_date': ['', Validators.required],
        'dep_time': '',
        'arr_date': ['', Validators.required],
        'arr_time': '',
        'transport_company': '',
        'contact_number': '',
        'note': '',
      })
    }

  ngOnInit()  {
    this.currentUserSubscription = this.userService.updateCurrentUser.subscribe(
                                       result => {
                                         this.currentUser = result;
                                         this.checkSameUser();
                                         this.filterItineraries();
                                       })

    this.event['formatted_note'] = this.event['note'].replace(/\r?\n/g, '<br/> ');
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
      this.timePickerDep = false;
      this.timePickerArr = false;
    }
  }

  ngOnDestroy() {
    this.currentUserSubscription.unsubscribe();
  }

  checkSameUser() {
    if(this.currentUser['_id'] === this.event['user']['_id']) {
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

  initTime()  {
    if(this.event['dep_time'] === 'anytime') {
      this.hourDep = 'anytime';
      this.minuteDep = "00";
    } else  {
      this.hourDep = this.event['dep_time'].slice(0,2);
      this.minuteDep = this.event['dep_time'].slice(3,6);
    }

    this.initHourDep = this.hourDep;
    this.initMinuteDep = this.minuteDep;


    if(this.event['arr_time'] === 'anytime')  {
      this.hourArr = 'anytime';
      this.minuteArr = "00";
    } else  {
      this.hourArr = this.event['arr_time'].slice(0,2);
      this.minuteArr = this.event['arr_time'].slice(3,6);
    }

    this.initHourArr = this.hourArr;
    this.initMinuteArr = this.minuteArr;
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
    this.editTransportForm.patchValue({
      reference_number: this.event['reference_number'],
      dep_city: this.event['dep_city'],
      arr_city: this.event['arr_city'],
      dep_terminal: this.event['dep_terminal'],
      arr_terminal: this.event['arr_terminal'],
      dep_station: this.event['dep_station'],
      arr_station: this.event['arr_station'],
      dep_date: this.event['dep_date'],
      arr_date: this.event['arr_date'],
      dep_time: this.event['dep_time'],
      arr_time: this.event['arr_time'],
      transport_company: this.event['transport_company'],
      contact_number: this.event['contact_number'],
      note: this.event['note'],
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

  // select departure time
  selectPickerDep()  {
    this.timePickerDep = true;
  }

  selectHourDep(h) {
    this.hourDep = h;
  }

  selectMinuteDep(m) {
    this.minuteDep = m;
  }

  // select arrival time
  selectPickerArr()  {
    this.timePickerArr = true;
  }

  selectHourArr(h) {
    this.hourArr = h;
  }

  selectMinuteArr(m) {
    this.minuteArr = m;
  }

  saveEdit()  {
    this.loadingService.setLoader(true, "Saving...");

    let editedTransport = this.editTransportForm.value;
    let originalTransport = this.event;

    if(this.hourDep === 'anytime')  {
      editedTransport['dep_time'] = 'anytime';
    } else  {
      editedTransport['dep_time'] = this.hourDep + ':' + this.minuteDep;
    }

    if(this.hourArr === 'anytime')  {
      editedTransport['arr_time'] = 'anytime';
    } else  {
      editedTransport['arr_time'] = this.hourArr + ':' + this.minuteArr;
    }

    for (var value in editedTransport) {
      originalTransport[value] = editedTransport[value];
    }

    originalTransport['date'] = originalTransport['dep_date'];
    originalTransport['time'] = originalTransport['dep_time'];

    this.itineraryEventService.editEvent(originalTransport)
        .subscribe(
          result => {
            this.loadingService.setLoader(false, "");
            this.flashMessageService.handleFlashMessage(result.message);
          })

    this.editing = false;
    this.preventScroll(false);
    this.initTime()
  }

  // delete section
  delete() {
    this.deleteTransport = true;
    this.preventScroll(true);
  }

  cancelDelete()  {
    this.deleteTransport = false;
    this.preventScroll(false);
  }

  confirmDelete()  {
    this.itineraryEventService.deleteEvent(this.event)
        .subscribe(
          result => {
            this.flashMessageService.handleFlashMessage(result.message);
          })
    this.deleteTransport = false;
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
