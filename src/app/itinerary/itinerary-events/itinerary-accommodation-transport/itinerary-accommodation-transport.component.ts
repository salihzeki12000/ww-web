import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs/Rx';

import { ItineraryService } from '../../itinerary.service';
import { Itinerary } from '../../itinerary';
import { ItineraryEvent } from '../itinerary-event';
import { ItineraryEventService } from '../itinerary-event.service';
import { UserService } from '../../../user';

@Component({
  selector: 'ww-itinerary-accommodation-transport',
  templateUrl: './itinerary-accommodation-transport.component.html',
  styleUrls: ['./itinerary-accommodation-transport.component.scss']
})
export class ItineraryAccommodationTransportComponent implements OnInit {
  itinerary: Itinerary;
  itinDateRange = [];

  itinerarySubscription: Subscription;
  itinDateSubscription: Subscription;
  eventSubscription: Subscription;

  currentUserSubscription: Subscription;
  currentUser;

  // to show/hide accommodation/transport section
  accommodationSection = true;
  transportSection = true;

  // array of accommodations/transports to pass to respective views
  accommodations: ItineraryEvent[] = [];
  transports: ItineraryEvent[] = [];

  // to see the add new accommodation/transport form
  addNewAccommodation = false;
  addNewTransport = false;

  constructor(
    private itineraryService: ItineraryService,
    private itineraryEventService: ItineraryEventService,
    private userService: UserService) { }

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
                                      this.filterEvent(result);
                                  })

    this.currentUserSubscription = this.userService.updateCurrentUser
                                       .subscribe(
                                         result => {
                                           this.currentUser = result;
                                         }
                                       )
  }

  filterEvent(events) {
    this.accommodations = [];
    this.transports = [];
    for (let i = 0; i < events.length; i++) {
      if(events[i]['type'] === 'accommodation') {
        this.accommodations.push(events[i])
      }

      if(events[i]['type'] === 'transport') {
        this.transports.push(events[i])
      }
    }
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

}
