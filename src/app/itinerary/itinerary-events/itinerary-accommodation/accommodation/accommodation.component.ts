import { Component, OnInit, OnDestroy, Input, Renderer2, HostListener } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs/Rx';

import { ItineraryEvent }        from '../../itinerary-event';
import { ItineraryEventService } from '../../itinerary-event.service';
import { FlashMessageService }   from '../../../../flash-message';
import { UserService }           from '../../../../user';
import { LoadingService }        from '../../../../loading';

@Component({
  selector: 'ww-accommodation',
  templateUrl: './accommodation.component.html',
  styleUrls: ['./accommodation.component.scss']
})
export class AccommodationComponent implements OnInit, OnDestroy {
  @Input() event: ItineraryEvent;
  @Input() itinDateRange;
  @Input() currentItinerary;
  @Input() totalAccommodations;
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
  deleteAccommodation = false;

  editAccommodationForm: FormGroup;
  anyCheckInTime;
  anyCheckOutTime;

  constructor(
    private renderer: Renderer2,
    private userService: UserService,
    private itineraryEventService: ItineraryEventService,
    private loadingService: LoadingService,
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
        'stay_city':'',
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
    if(this.currentUser['id'] === this.event['user']['_id']) {
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

  showMenuOptions() {
    this.showMenu = true;
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

    copiedEvent['check_in_date'] = itinerary['date_from'];
    copiedEvent['check_out_date'] = itinerary['date_to'];
    copiedEvent['date'] = copiedEvent['check_in_date'];
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
    this.editAccommodationForm.patchValue({
      name: this.event['name'],
      formatted_address: this.event['formatted_address'],
      website: this.event['website'],
      international_phone_number: this.event['international_phone_number'],
      check_in_date: this.event['check_in_date'],
      check_out_date: this.event['check_out_date'],
      stay_city: this.event['stay_city'],
      note: this.event['note'],
    })

    if(this.event['check_in_time'] === 'anytime') {
      this.anyCheckInTime = true;
    } else  {
      this.anyCheckInTime = false;
    }

    if(this.event['check_out_time'] === 'anytime') {
      this.anyCheckOutTime = true;
    } else  {
      this.anyCheckOutTime = false;
    }
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

  saveEdit() {
    this.loadingService.setLoader(true, "Saving...");

    let editedAccommodation = this.editAccommodationForm.value;
    let originalAccommodation = this.event;

    if(this.anyCheckInTime === true)  {
      editedAccommodation['check_in_time'] = 'anytime';
    } else if(!this.anyCheckInTime && !editedAccommodation['check_in_time'])  {
      editedAccommodation['check_in_time'] = originalAccommodation['check_in_time']
    }

    if(this.anyCheckOutTime === true)  {
      editedAccommodation['check_out_time'] = 'anytime';
    } else if(!this.anyCheckOutTime && !editedAccommodation['check_out_time'])  {
      editedAccommodation['check_out_time'] = originalAccommodation['check_out_time']
    }

    for(let value in editedAccommodation) {
      originalAccommodation[value] = editedAccommodation[value];
    }

    originalAccommodation['date'] = originalAccommodation['check_in_date'];
    originalAccommodation['time'] = originalAccommodation['check_in_time'];

    this.itineraryEventService.editEvent(originalAccommodation)
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
    this.deleteAccommodation = true;
    this.preventScroll(true);
  }

  cancelDelete()  {
    this.deleteAccommodation = false;
    this.preventScroll(false);
  }

  confirmDelete() {
    this.itineraryEventService.deleteEvent(this.event)
        .subscribe(
          result => {
            this.flashMessageService.handleFlashMessage(result.message);
          })
    this.deleteAccommodation = false;
    this.preventScroll(false);
  }

  toggleCheckInTime() {
    this.anyCheckInTime = !this.anyCheckInTime;
  }

  toggleCheckOutTime() {
    this.anyCheckOutTime = !this.anyCheckOutTime;
  }

  toggleContactDetails()  {
    this.showContactDetails = !this.showContactDetails;
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
