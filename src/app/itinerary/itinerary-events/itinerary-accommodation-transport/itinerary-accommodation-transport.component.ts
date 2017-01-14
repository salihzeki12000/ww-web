import { Component, OnInit } from '@angular/core';
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
export class ItineraryAccommodationTransportComponent implements OnInit {
  itinerary: Itinerary;
  itinDateRange = [];
  events: ItineraryEvent[] = [];

  itinerarySubscription: Subscription;
  itinDateSubscription: Subscription;
  eventSubscription: Subscription;

  // for editing accommodation
  accommodationSection = true;
  accommodations = [];

  // for editing transport
  transportSection = true;
  transports = [];

  // to see the add new accommodation/transport form
  addNewAccommodation = false;
  addNewTransport = false;

  constructor(
    private itineraryService: ItineraryService,
    private itineraryEventService: ItineraryEventService,
    private userService: UserService,
    private flashMessageService: FlashMessageService,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.itinerarySubscription = this.itineraryService.currentItinerary
                                     .subscribe(
                                       result =>  {
                                         this.itinerary = result;
                                       }
                                     )

    this.itinDateSubscription = this.itineraryService.updateDate
                                    .subscribe(
                                      result => {
                                        this.itinDateRange = Object.keys(result).map(key => result[key]);
                                    })

    this.eventSubscription = this.itineraryEventService.updateEvent
                                 .subscribe(
                                    result => {
                                      this.events = Object.keys(result).map(key => result[key]);
                                      this.filterEventType();
                                  })

  }

  // show/hide accommodation/transport section
  toggleAccommodation() {
    this.accommodationSection = !this.accommodationSection;
  }

  toggleTransport() {
    this.transportSection = !this.transportSection;
  }

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

  filterEventType() {
    this.accommodations = [];
    this.transports = [];
    for (let i = 0; i < this.events.length; i++) {
      if(this.events[i]['type'] === 'accommodation') {
        this.accommodations.push(this.events[i])
      }

      if(this.events[i]['type'] === 'transport') {
        this.transports.push(this.events[i])
      }
    }
  }
}
