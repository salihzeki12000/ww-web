import { Component, OnInit, Renderer } from '@angular/core';
import { Subscription } from 'rxjs/Rx';

import { ItineraryEvent } from '../../itinerary-event';
import { ItineraryEventService } from '../../itinerary-event.service';
import { UserService }           from '../../../../user';

@Component({
  selector: 'ww-activity-list',
  templateUrl: './activity-list.component.html',
  styleUrls: ['./activity-list.component.scss']
})
export class ActivityListComponent implements OnInit {
  activities: ItineraryEvent[] = [];
  eventSubscription: Subscription;

  currentUserSubscription: Subscription;
  currentUser;

  showActivitySummary = false;
  highlightedEvent;

  constructor(
    private renderer: Renderer,
    private itineraryEventService: ItineraryEventService,
    private userService: UserService) { }

  ngOnInit() {
    this.currentUserSubscription = this.userService.updateCurrentUser
                                       .subscribe(
                                         result => {
                                           this.currentUser = result;
                                         }
                                       )

    this.eventSubscription = this.itineraryEventService.updateEvent
                                 .subscribe(
                                  result => {
                                    this.filterEvents(result);
                                  })
  }

  filterEvents(events)  {
    this.activities = [];
    for (let i = 0; i < events.length; i++) {
      if(events[i]['type'] === 'activity') {
        if(events[i]['user']['_id'] === this.currentUser['id']) {
          events[i]['sameUser'] = true;
        }

        if(events[i]['user']['_id'] !== this.currentUser['id']) {
          events[i]['sameUser'] = false;
        }

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
