import { Component, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { Subscription } from 'rxjs/Rx';
import { Title }        from '@angular/platform-browser';
import { ActivatedRoute, Params, Router } from '@angular/router';

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
  preview;

  eventSubscription: Subscription;
  activities = [];
  totalActivities = 1;

  itinDateSubscription: Subscription;
  itinDateRange = [];

  currentItinerarySubscription: Subscription;
  currentItinerary;

  showActivitySummary = false;
  highlightedEvent;

  addActivity = false;

  constructor(
    private titleService: Title,
    private renderer: Renderer2,
    private route: ActivatedRoute,
    private itineraryService: ItineraryService,
    private itineraryEventService: ItineraryEventService,
    private loadingService: LoadingService) { }

  ngOnInit() {
    let segments = this.route.snapshot['_urlSegment'].segments;
    if(segments[0]['path'] === 'preview') this.preview = true;

    this.eventSubscription = this.itineraryEventService.updateEvent.subscribe(
      result => { this.filterEvents(result); })

    this.currentItinerarySubscription = this.itineraryService.currentItinerary.subscribe(
      result => {
        this.currentItinerary = result;

        let header = ''
        if(this.preview) header = "Preview : ";

        let title = header + this.currentItinerary['name'] + " | Activity";

        this.titleService.setTitle(title);
      })

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
    this.preventScroll(false);
  }

  toggleSummary() {
    this.showActivitySummary = !this.showActivitySummary;
    this.preventScroll(this.showActivitySummary);
  }

  hideActivityForm()  {
    this.addActivity = false;
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
