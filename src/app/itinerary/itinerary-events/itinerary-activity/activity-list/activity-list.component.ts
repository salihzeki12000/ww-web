import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Rx';

import { ItineraryEvent } from '../../itinerary-event';
import { ItineraryEventService } from '../../itinerary-event.service';

@Component({
  selector: 'ww-activity-list',
  template: `
    <div class="flex-container">
      <ww-activity [activity]="activity" *ngFor="let activity of activities"></ww-activity>
    </div>
  `,
  styleUrls: ['./activity-list.component.scss']
})
export class ActivityListComponent implements OnInit {
  events: ItineraryEvent[] = [];
  activities: ItineraryEvent[] = [];
  eventSubscription: Subscription;

  constructor(private itineraryEventService: ItineraryEventService) { }

  ngOnInit() {
    this.eventSubscription = this.itineraryEventService.updateEvent
                                 .subscribe(
                                  result => {
                                    this.events = Object.keys(result).map(key => result[key]);
                                    this.filterEvents()
                                  })
  }

  filterEvents()  {
    for (let i = 0; i < this.events.length; i++) {
      if(this.events[i]['type'] === 'activity') {
        this.activities.push(this.events[i]);
      }
    }
  }
  
}
