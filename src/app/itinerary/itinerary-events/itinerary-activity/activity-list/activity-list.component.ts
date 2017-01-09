import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ItineraryEvent } from '../../itinerary-event';
import { ItineraryEventService } from '../../itinerary-event.service';

@Component({
  selector: 'ww-activity-list',
  template: `
    <div>
      <ww-activity [activity]="activity" *ngFor="let activity of activities"></ww-activity>
    </div>
  `,
  styleUrls: ['./activity-list.component.scss']
})
export class ActivityListComponent implements OnInit {
  activities: ItineraryEvent[] = [];

  constructor(
    private itineraryEventService: ItineraryEventService,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.itineraryEventService.getEvents(this.route.snapshot['_urlSegment'].segments[2].path)
        .subscribe(
          data => {
            this.activities = data;
          }
        )
  }
}
