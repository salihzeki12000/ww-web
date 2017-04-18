import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs/Rx';

import { ItineraryService } from '../../itinerary.service';
import { Itinerary } from '../../itinerary';
import { ItineraryEvent } from '../itinerary-event';
import { ItineraryEventService } from '../itinerary-event.service';
import { UserService } from '../../../user';

@Component({
  selector: 'ww-itinerary-transport',
  templateUrl: './itinerary-transport.component.html',
  styleUrls: ['./itinerary-transport.component.scss']
})
export class ItineraryTransportComponent implements OnInit {
  itinerary: Itinerary;
  itinDateRange = [];

  itinerarySubscription: Subscription;
  itinDateSubscription: Subscription;
  eventSubscription: Subscription;

  currentUserSubscription: Subscription;
  currentUser;

  transports: ItineraryEvent[] = [];

  showTransportSummary = false;
  highlightedEvent;

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
    this.transports = [];
    for (let i = 0; i < events.length; i++) {
      if(events[i]['type'] === 'transport') {
        this.transports.push(events[i])
      }
    }
  }

  showSummary() {
    this.showTransportSummary = !this.showTransportSummary;
  }

  centerItem(event)  {
    this.highlightedEvent = event;
  }
}
