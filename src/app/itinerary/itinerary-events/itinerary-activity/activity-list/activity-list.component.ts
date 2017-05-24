import { Component, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { Subscription } from 'rxjs/Rx';

import { ItineraryService }      from '../../../itinerary.service';
import { ItineraryEvent }        from '../../itinerary-event';
import { ItineraryEventService } from '../../itinerary-event.service';
import { LoadingService }        from '../../../../loading';

@Component({
  selector: 'ww-activity-list',
  templateUrl: './activity-list.component.html',
  styleUrls: ['./activity-list.component.scss']
})
export class ActivityListComponent implements OnInit, OnDestroy {
  eventSubscription: Subscription;
  activities: ItineraryEvent[] = [];
  totalActivities = 1;

  itinDateSubscription: Subscription;
  itinDateRange = [];

  currentItinerarySubscription: Subscription;
  currentItinerary;

  showActivitySummary = false;
  highlightedEvent;

  constructor(
    private renderer: Renderer2,
    private itineraryService: ItineraryService,
    private itineraryEventService: ItineraryEventService,
    private loadingService: LoadingService) { }

  ngOnInit() {
    this.eventSubscription = this.itineraryEventService.updateEvent.subscribe(
                                  result => { this.filterEvents(result); })

    this.currentItinerarySubscription = this.itineraryService.currentItinerary.subscribe(
                                             result => { this.currentItinerary = result; })

    this.itinDateSubscription = this.itineraryService.updateDate.subscribe(
                                      result => {
                                        this.itinDateRange = Object.keys(result).map(key => result[key]);
                                    })
  }

  ngOnDestroy() {
    this.itinDateSubscription.unsubscribe();
    this.eventSubscription.unsubscribe();
    this.currentItinerarySubscription.unsubscribe();
    this.loadingService.setLoader(true, "");
  }

  filterEvents(events)  {
    this.activities = [];
    for (let i = 0; i < events.length; i++) {
      if(events[i]['type'] === 'activity') {
        this.activities.push(events[i]);
      }
    }

    this.totalActivities = this.activities.length
    this.loadingService.setLoader(false, "");
  }

  showSummary() {
    this.showActivitySummary = !this.showActivitySummary;
    this.preventScroll(this.showActivitySummary);
  }

  preventScroll(value)  {
    if(value) {
      this.renderer.addClass(document.body, 'prevent-scroll');
    } else  {
      this.renderer.removeClass(document.body, 'prevent-scroll');
    }
  }

  centerItem(activity)  {
    this.showActivitySummary = false;
    this.preventScroll(false);

    this.highlightedEvent = activity;
  }

}
