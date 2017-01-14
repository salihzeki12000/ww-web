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

  editAccommodationForm: FormGroup;
  editing = false;

  deleteAccommodation = false;

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
  }

  // to show/hide edit form
  editAccommodation()  {
    console.log(this.event);
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
          data => {
            this.flashMessageService.handleFlashMessage(data.message);
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
          data => {
            this.flashMessageService.handleFlashMessage(data.message);
          })
    this.deleteAccommodation = false;
  }
}
