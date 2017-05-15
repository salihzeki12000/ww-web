import { Component, OnInit, Input, Renderer } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';

import { ItineraryEvent }        from '../../itinerary-event';
import { ItineraryEventService } from '../../itinerary-event.service';
import { FlashMessageService }   from '../../../../flash-message';

@Component({
  selector: 'ww-accommodation',
  templateUrl: './accommodation.component.html',
  styleUrls: ['./accommodation.component.scss']
})
export class AccommodationComponent implements OnInit {
  @Input() event: ItineraryEvent;
  @Input() itinDateRange;
  @Input() currentItinerary;
  @Input() currentUser;
  sameUser = true;

  showContactDetails = false;

  showMenu = false;
  editing = false;
  deleteAccommodation = false;

  editAccommodationForm: FormGroup;
  anyCheckInTime;
  anyCheckOutTime;

  constructor(
    private renderer: Renderer,
    private itineraryEventService: ItineraryEventService,
    private flashMessageService: FlashMessageService,
    private formBuilder: FormBuilder) {
      this.editAccommodationForm = this.formBuilder.group({
        'name': '',
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
    // this.checkSameUser()
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
    }  }

  showMenuOptions() {
    this.showMenu = true;
  }

  // edit section
  edit()  {
    this.editing = true;
    this.renderer.setElementClass(document.body, 'prevent-scroll', true);

    if(this.event['check_in_time'] === 'anytime') {
      this.anyCheckInTime = true;
    }
    if(this.event['check_out_time'] === 'anytime') {
      this.anyCheckOutTime = true;
    }
  }

  cancelEdit()  {
    this.editing = false;
    this.renderer.setElementClass(document.body, 'prevent-scroll', false);
  }

  saveEdit() {
    let editedAccommodation = this.editAccommodationForm.value;
    let originalAccommodation = this.event;

    if(!editedAccommodation['check_in_time']) {
      editedAccommodation['check_in_time'] = originalAccommodation['check_in_time'];
    }

    if(!editedAccommodation['check_out_time']) {
      editedAccommodation['check_out_time'] = originalAccommodation['check_out_time'];
    }

    for (var value in editedAccommodation)  {
      if(editedAccommodation[value] === null) {
        editedAccommodation[value] = '';
      }
      if(editedAccommodation[value] !== '')  {
        originalAccommodation[value] = editedAccommodation[value];
      }
    }

    if(editedAccommodation['check_in_time'] === '' || this.anyCheckInTime)  {
      originalAccommodation['check_in_time'] = 'anytime';
    }

    if(editedAccommodation['check_out_time'] === '' || this.anyCheckOutTime)  {
      originalAccommodation['check_out_time'] = 'anytime';
    }

    originalAccommodation['date'] = originalAccommodation['check_in_date'];
    originalAccommodation['time'] = originalAccommodation['check_in_time'];


    this.itineraryEventService.editEvent(originalAccommodation)
        .subscribe(
          result => {
            this.flashMessageService.handleFlashMessage(result.message);
          })

    this.editing = false;
    this.renderer.setElementClass(document.body, 'prevent-scroll', false);
  }

  // delete section
  delete() {
    this.deleteAccommodation = true;
    this.renderer.setElementClass(document.body, 'prevent-scroll', true);
  }

  cancelDelete()  {
    this.deleteAccommodation = false;
    this.renderer.setElementClass(document.body, 'prevent-scroll', false);
  }

  confirmDelete() {
    this.itineraryEventService.deleteEvent(this.event)
        .subscribe(
          result => {
            this.flashMessageService.handleFlashMessage(result.message);
          })
    this.deleteAccommodation = false;
    this.renderer.setElementClass(document.body, 'prevent-scroll', false);
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
}
