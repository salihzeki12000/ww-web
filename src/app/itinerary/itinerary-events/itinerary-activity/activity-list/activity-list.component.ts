import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Rx';

import { ItineraryEvent } from '../../itinerary-event';
import { ItineraryEventService } from '../../itinerary-event.service';

@Component({
  selector: 'ww-activity-list',
  template: `
    <div class="activity-list">
      <ww-activity [activity]="activity" *ngFor="let activity of activities"></ww-activity>
    </div>
  `,
  styleUrls: ['./activity-list.component.scss']
})
export class ActivityListComponent implements OnInit {
  activities: ItineraryEvent[] = [];
  eventSubscription: Subscription;

  constructor(private itineraryEventService: ItineraryEventService) { }

  ngOnInit() {
    this.eventSubscription = this.itineraryEventService.updateEvent
                                 .subscribe(
                                  result => {
                                    this.filterEvents(result)
                                  })
  }

  filterEvents(events)  {
    this.activities = [];
    for (let i = 0; i < events.length; i++) {
      if(events[i]['type'] === 'activity') {
        this.activities.push(events[i]);
      }
    }
  }

}
