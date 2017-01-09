import { Component, OnInit, DoCheck } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs/Rx';

import { ItineraryService } from '../../itinerary.service';
import { Itinerary } from '../../itinerary';
import { UserService } from '../../../user';
import { ItineraryEvent } from '../itinerary-event';
import { ItineraryEventService } from '../itinerary-event.service';
import { FlashMessageService } from '../../../flash-message';

@Component({
  selector: 'ww-itinerary-accommodation-transport',
  templateUrl: './itinerary-accommodation-transport.component.html',
  styleUrls: ['./itinerary-accommodation-transport.component.scss']
})
export class ItineraryAccommodationTransportComponent implements OnInit, DoCheck {
  itinerary: Itinerary;
  eventSubscription: Subscription;
  events: ItineraryEvent[] = [];

  itinDateSubscription: Subscription;
  itinDateRange = [];

  displayAccommodationDelete = 'none';
  displayTransportDelete = 'none';
  accommodationToDelete;
  transportToDelete;

  // for editing accommodation
  accommodationSection = true;
  editAccommodationForm: FormGroup;
  accommodations;

  // for editing transport
  transportSection = true;
  editTransportForm: FormGroup;
  transports;

  // to see the add new accommodation/transport form
  addNewAccommodation = false;
  addNewTransport = false;

  constructor(
    private itineraryService: ItineraryService,
    private itineraryEventService: ItineraryEventService,
    private userService: UserService,
    private flashMessageService: FlashMessageService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder) {
      this.editAccommodationForm = this.formBuilder.group({
        'name': '',
        'formatted_address': '',
        'website': '',
        'international_phone_number': '',
        'checkInDate': '',
        'checkOutDate': '',
        'note': '',
        'editing': false,
        'created_at': '',
        'user': '',
      }),
      this.editTransportForm = this.formBuilder.group({
        'transportType': '',
        'referenceNumber': '',
        'depTerminal': '',
        'arrTerminal': '',
        'depStation': '',
        'arrStation': '',
        'depCity': '',
        'arrCity': '',
        'depDate': '',
        'depTime': '',
        'arrDate': '',
        'arrTime': '',
        'transportCompany': '',
        'contactNumber': '',
        'note': '',
        'editing': false,
        'created_at': '',
        'user': '',
      })
    }

  // show/hide accommodation/transport section
  toggleAccommodation() {
    this.accommodationSection = !this.accommodationSection;
  }

  toggleTransport() {
    this.transportSection = !this.transportSection;
  }

  //-------------- SECTION FOR ADDING NEW ACCOMMODATION/TRANSPORT --------

  // to toggle view, true will show the accommodation/transport form
  addAccommodation()  {
    this.addNewAccommodation = true;
    this.accommodationSection = true;
  }

  addTransport()  {
    this.addNewTransport = true;
    this.transportSection = true;
  }

  // to hide accommodation/transport forms
  cancelAccommodationForm(value) {
    this.addNewAccommodation = false;
  }

  cancelTransportForm(value) {
    this.addNewTransport = false;
  }

  //-------------- END OF SECTION FOR ADDING NEW ACCOMMODATION/TRANSPORT --------


  //-------------- SECTION FOR EDITING CURRENT ACCOMMODATION/TRANSPORT --------

  // to show/hide edit form
  editAccommodation(accommodation)  {
    accommodation.editing = true;
  }

  cancelEditAccommodation(accommodation)  {
    accommodation.editing = false;
  }

  cancelEditTransport(transport)  {
    transport.editing = false;
  }

  editTransport(transport)  {
    transport.editing = true;
  }

  // to submit edit form
  onEditAccommodation(index) {
    let editedAccommodation = this.editAccommodationForm.value;
    let originalAccommodation = this.events[index];

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

    this.editAccommodationForm.reset({
      'name': '',
      'formatted_address': '',
      'website': '',
      'international_phone_number': '',
      'checkInDate': '',
      'checkOutDate': '',
      'note': '',
      'editing': false,
      'created_at': '',
      'user': '',
    })
  }

  onEditTransport(index)  {
    let editedTransport = this.editTransportForm.value;
    let originalTransport = this.events[index];

    for (var value in editedTransport) {
      if(editedTransport[value] === null) {
        editedTransport[value] = '';
      }
      if(editedTransport[value] !== '')  {
        originalTransport[value] = editedTransport[value];
      }
    }

    this.editTransportForm.reset({
      'transportType': '',
      'referenceNumber': '',
      'depTerminal': '',
      'arrTerminal': '',
      'depStation': '',
      'arrStation': '',
      'depCity': '',
      'arrCity': '',
      'depDate': '',
      'depTime': '',
      'arrDate': '',
      'arrTime': '',
      'transportCompany': '',
      'contactNumber': '',
      'note': '',
      'editing': false,
      'created_at': '',
      'user': '',
    });

    this.itineraryEventService.editEvent(originalTransport)
        .subscribe(
          data => {
            this.flashMessageService.handleFlashMessage(data.message);
          })
  }

  //-------------- END OF SECTION FOR EDITING CURRENT ACCOMMODATION/TRANSPORT --------

  // TO DELETE EXISTING ACCOMMODATION/TRANSPORT
  confirmDeleteAccommodation(event) {
    this.accommodationToDelete = event;
    this.displayAccommodationDelete = 'block';
  }

  cancelDeleteAccommodation()  {
    this.accommodationToDelete = '';
    this.displayAccommodationDelete = 'none';
  }

  confirmDeleteTransport(event) {
    this.transportToDelete = event;
    this.displayTransportDelete = 'block';
  }

  cancelDeleteTransport()  {
    this.transportToDelete = '';
    this.displayTransportDelete = 'none';
  }

  deleteAccommodation(event, i)  {
    this.events.splice(i, 1);

    this.itineraryEventService.deleteEvent(event)
        .subscribe(
          data => {
            this.displayAccommodationDelete = 'none';
            this.accommodationToDelete = '';
            // this.flashMessageService.handleFlashMessage(data.message);
          })
  }

  deleteTransport(event, i)  {
    this.events.splice(i, 1);

    this.itineraryEventService.deleteEvent(event)
        .subscribe(
          data => {
            this.displayTransportDelete = 'none';
            this.transportToDelete = '';
            this.flashMessageService.handleFlashMessage(data.message);
          })
  }

  ngOnInit() {
    this.itinDateSubscription = this.itineraryService.updateDate
                                    .subscribe(
                                      result => {
                                        let updatedItinDate = Object.keys(result).map(key => result[key]);
                                        this.itinDateRange = updatedItinDate;
                                    })

    this.itineraryEventService.getEvents(this.route.snapshot['_urlSegment'].segments[2].path)
        .subscribe(
          data => {
            this.events = data;
          }
        )

    this.eventSubscription = this.itineraryEventService.updateEvent
                                 .subscribe(
                                  result => {
                                    this.events = Object.keys(result).map(key => result[key]);
                                  })

  }

  ngDoCheck() {
    this.itinerary = this.itineraryService.itin();
    // console.log(this.itinerary);
  }


}
