import { Component, OnInit, OnDestroy, Renderer } from '@angular/core';
import { Subscription } from 'rxjs/Rx';

import { ItineraryService }      from '../../../itinerary.service';
import { ItineraryEvent }        from '../../itinerary-event';
import { ItineraryEventService } from '../../itinerary-event.service';
import { UserService }           from '../../../../user';

@Component({
  selector: 'ww-activity-list',
  templateUrl: './activity-list.component.html',
  styleUrls: ['./activity-list.component.scss']
})
export class ActivityListComponent implements OnInit, OnDestroy {
  eventSubscription: Subscription;
  activities: ItineraryEvent[] = [];

  itinDateSubscription: Subscription;
  itinDateRange = [];

  currentUserSubscription: Subscription;
  currentUser;

  currentItinerarySubscription: Subscription;
  currentItinerary;

  showActivitySummary = false;
  highlightedEvent;

  constructor(
    private renderer: Renderer,
    private itineraryService: ItineraryService,
    private itineraryEventService: ItineraryEventService,
    private userService: UserService) { }

  ngOnInit() {
    this.eventSubscription = this.itineraryEventService.updateEvent.subscribe(
                                  result => { this.filterEvents(result); })

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

  filterEvents(events)  {
    this.activities = [];
    for (let i = 0; i < events.length; i++) {
      if(events[i]['type'] === 'activity') {
        this.activities.push(events[i]);
      }
    }
  }

  showSummary() {
    this.showActivitySummary = !this.showActivitySummary;
    this.togglePreventScroll(this.showActivitySummary);
  }

  togglePreventScroll(value)  {
    this.renderer.setElementClass(document.body, 'prevent-scroll', value);
  }

  centerItem(activity)  {
    this.showActivitySummary = false;
    this.renderer.setElementClass(document.body, 'prevent-scroll', false);

    this.highlightedEvent = activity;
  }

}
