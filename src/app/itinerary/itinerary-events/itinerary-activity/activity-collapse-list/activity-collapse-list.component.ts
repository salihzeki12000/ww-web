import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Rx';

import { ItineraryService } from '../../../itinerary.service';
import { ItineraryEvent } from '../../itinerary-event';
import { ItineraryEventService } from '../../itinerary-event.service';

@Component({
  selector: 'ww-activity-collapse-list',
  templateUrl:'./activity-collapse-list.component.html' ,
  styleUrls: ['./activity-collapse-list.component.scss']
})
export class ActivityCollapseListComponent implements OnInit {
  eventSubscription: Subscription;
  events: ItineraryEvent[] = [];

  itinDateSubscription: Subscription;
  itinDateRange = [];
  collapseDate = [];

  constructor(
    private itineraryEventService: ItineraryEventService,
    private itineraryService: ItineraryService) { }

  ngOnInit() {
    this.eventSubscription = this.itineraryEventService.updateEvent
                                 .subscribe(
                                  result => {
                                    this.events = Object.keys(result).map(key => result[key]);
                                  })

    this.itinDateSubscription = this.itineraryService.updateDate
                                    .subscribe(
                                      result => {
                                        this.itinDateRange = Object.keys(result).map(key => result[key]);
                                        for (let i = 0; i < this.itinDateRange.length; i++) {
                                          this.collapseDate.push(false);
                                        }
                                    })
  }

  toggleCollapse(i) {
    this.collapseDate[i] = !this.collapseDate[i];
  }

  expandAll() {
    for (let i = 0; i < this.collapseDate.length; i++) {
        this.collapseDate[i] = false;
    }
  }

  collapseAll() {
    for (let i = 0; i < this.collapseDate.length; i++) {
        this.collapseDate[i] = true;
    }
  }

}
