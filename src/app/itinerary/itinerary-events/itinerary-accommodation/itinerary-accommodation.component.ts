import { Component, OnInit, OnDestroy, Renderer } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs/Rx';

import { ItineraryService }      from '../../itinerary.service';
import { ItineraryEvent }        from '../itinerary-event';
import { ItineraryEventService } from '../itinerary-event.service';
import { UserService }           from '../../../user';

@Component({
  selector: 'ww-itinerary-accommodation',
  templateUrl: './itinerary-accommodation.component.html',
  styleUrls: ['./itinerary-accommodation.component.scss']
})
export class ItineraryAccommodationComponent implements OnInit, OnDestroy {
  eventSubscription: Subscription;
  accommodations: ItineraryEvent[] = [];

  itinDateSubscription: Subscription;
  itinDateRange = [];

  currentUserSubscription: Subscription;
  currentUser;

  currentItinerarySubscription: Subscription;
  currentItinerary;

  showAccommodationSummary = false;
  highlightedEvent;

  constructor(
    private renderer: Renderer,
    private itineraryService: ItineraryService,
    private itineraryEventService: ItineraryEventService,
    private userService: UserService) { }

  ngOnInit() {
    this.eventSubscription = this.itineraryEventService.updateEvent.subscribe(
                                 result => { this.filterEvent(result); })

    this.currentUserSubscription = this.userService.updateCurrentUser.subscribe(
                                       result => { this.currentUser = result; })

    this.currentItinerarySubscription = this.itineraryService.currentItinerary.subscribe(
                                            result => { this.currentItinerary = result; })

    this.itinDateSubscription = this.itineraryService.updateDate.subscribe(
                                      result => {
                                        this.itinDateRange = Object.keys(result).map(key => result[key]);
                                        this.itinDateRange.splice(0,1);
                                    })
  }

  ngOnDestroy() {
    this.itinDateSubscription.unsubscribe();
    this.eventSubscription.unsubscribe();
    this.currentUserSubscription.unsubscribe();
    this.currentItinerarySubscription.unsubscribe();
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
    this.togglePreventScroll(this.showAccommodationSummary);
  }

  togglePreventScroll(value)  {
    this.renderer.setElementClass(document.body, 'prevent-scroll', value);
  }

  centerItem(event)  {
    this.showAccommodationSummary = false;
    this.renderer.setElementClass(document.body, 'prevent-scroll', false);

    this.highlightedEvent = event;
  }
}
