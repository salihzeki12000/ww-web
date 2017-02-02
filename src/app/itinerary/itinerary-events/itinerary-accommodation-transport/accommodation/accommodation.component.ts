import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';

import { ItineraryEvent } from '../../itinerary-event';
import { ItineraryEventService } from '../../itinerary-event.service';
import { FlashMessageService } from '../../../../flash-message';

@Component({
  selector: 'ww-accommodation',
  templateUrl: './accommodation.component.html',
  styleUrls: ['./accommodation.component.scss']
})
export class AccommodationComponent implements OnInit {
  @Input() event: ItineraryEvent;
  @Input() itinDateRange;
  @Input() currentUser;

  editAccommodationForm: FormGroup;
  editing = false;
  anyCheckInTime;
  anyCheckOutTime;

  deleteAccommodation = false;

  sameUser;

  constructor(
    private itineraryEventService: ItineraryEventService,
    private flashMessageService: FlashMessageService,
    private formBuilder: FormBuilder) {
      this.editAccommodationForm = this.formBuilder.group({
        'name': '',
        'formatted_address': '',
        'website': '',
        'international_phone_number': '',
        'checkInDate': '',
        'checkOutDate': '',
        'checkInTime': '',
        'checkOutTime': '',
        'stayCity':'',
        'note': '',
      })
    }

  ngOnInit()  {
    this.checkSameUser();
  }

  checkSameUser() {
    if(this.currentUser['id'] === this.event['user']['_id']) {
      this.sameUser = true;
    }
  }

  // to show/hide edit form
  editAccommodation()  {
    this.editing = true;
    if(this.event['checkInTime'] === 'anytime') {
      this.anyCheckInTime = true;
    }
    if(this.event['checkOutTime'] === 'anytime') {
      this.anyCheckOutTime = true;
    }
  }

  cancelEditAccommodation()  {
    this.editing = false;
  }

  // to submit edit form
  onEditAccommodation() {
    let editedAccommodation = this.editAccommodationForm.value;
    let originalAccommodation = this.event;

    if(!editedAccommodation['checkInTime']) {
      editedAccommodation['checkInTime'] = originalAccommodation['checkInTime'];
    }

    if(!editedAccommodation['checkOutTime']) {
      editedAccommodation['checkOutTime'] = originalAccommodation['checkOutTime'];
    }

    for (var value in editedAccommodation)  {
      if(editedAccommodation[value] === null) {
        editedAccommodation[value] = '';
      }
      if(editedAccommodation[value] !== '')  {
        originalAccommodation[value] = editedAccommodation[value];
      }
    }

    if(editedAccommodation['checkInTime'] === '' || this.anyCheckInTime)  {
      originalAccommodation['checkInTime'] = 'anytime';
    }

    if(editedAccommodation['checkOutTime'] === '' || this.anyCheckOutTime)  {
      originalAccommodation['checkOutTime'] = 'anytime';
    }

    originalAccommodation['date'] = originalAccommodation['checkInDate'];
    originalAccommodation['time'] = originalAccommodation['checkInTime'];


    this.itineraryEventService.editEvent(originalAccommodation)
        .subscribe(
          result => {
            this.flashMessageService.handleFlashMessage(result.message);
          })

    this.editing = false;

    this.editAccommodationForm.reset({
      'name': '',
      'formatted_address': '',
      'website': '',
      'international_phone_number': '',
      'checkInDate': '',
      'checkOutDate': '',
      'checkInTime': '',
      'checkOutTime': '',
      'stayCity':'',
      'note': '',
    })
  }

  // TO DELETE EXISTING ACCOMMODATION/TRANSPORT
  confirmDeleteAccommodation() {
    this.deleteAccommodation = true;
  }

  cancelDeleteAccommodation()  {
    this.deleteAccommodation = false;
  }

  onDeleteAccommodation() {
    this.itineraryEventService.deleteEvent(this.event)
        .subscribe(
          result => {
            this.flashMessageService.handleFlashMessage(result.message);
          })
    this.deleteAccommodation = false;
  }

  toggleCheckInTime() {
    this.anyCheckInTime = !this.anyCheckInTime;
  }

  toggleCheckOutTime() {
    this.anyCheckOutTime = !this.anyCheckOutTime;
  }
}
