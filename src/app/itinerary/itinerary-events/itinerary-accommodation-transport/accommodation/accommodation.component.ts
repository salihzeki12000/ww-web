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
  }

  cancelEditAccommodation()  {
    this.editing = false;
  }

  // to submit edit form
  onEditAccommodation() {
    let editedAccommodation = this.editAccommodationForm.value;
    let originalAccommodation = this.event;

    for (var value in editedAccommodation)  {
      if(editedAccommodation[value] === null) {
        editedAccommodation[value] = '';
      }
      if(editedAccommodation[value] !== '')  {
        originalAccommodation[value] = editedAccommodation[value];
      }
    }

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
}
