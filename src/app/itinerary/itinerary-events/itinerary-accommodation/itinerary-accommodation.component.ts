import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs/Rx';

import { ItineraryService } from '../../itinerary.service';
import { Itinerary } from '../../itinerary';
import { ItineraryEvent } from '../itinerary-event';
import { ItineraryEventService } from '../itinerary-event.service';
import { UserService } from '../../../user';

@Component({
  selector: 'ww-itinerary-accommodation',
  templateUrl: './itinerary-accommodation.component.html',
  styleUrls: ['./itinerary-accommodation.component.scss']
})
export class ItineraryAccommodationComponent implements OnInit {
  itinerary: Itinerary;
  itinDateRange = [];

  itinerarySubscription: Subscription;
  itinDateSubscription: Subscription;
  eventSubscription: Subscription;

  currentUserSubscription: Subscription;
  currentUser;

  // array of accommodations to pass to respective views
  accommodations: ItineraryEvent[] = [];

  showAccommodationSummary = false;
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
    this.accommodations = [];
    for (let i = 0; i < events.length; i++) {
      if(events[i]['type'] === 'accommodation') {
        this.accommodations.push(events[i])
      }
    }
  }

  showSummary() {
    this.showAccommodationSummary = !this.showAccommodationSummary;
  }

  centerItem(event)  {
    this.highlightedEvent = event;
  }
}
