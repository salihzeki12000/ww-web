import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Rx';

import { Itinerary } from '../itinerary';
import { ItineraryService } from '../itinerary.service';

import { ItineraryEventService } from '../itinerary-events/itinerary-event.service';

import { Resource } from '../itinerary-resources/resource';
import { ResourceService } from '../itinerary-resources/resource.service';

@Component({
  selector: 'ww-itinerary-print',
  templateUrl: './itinerary-print.component.html',
  styleUrls: ['./itinerary-print.component.scss']
})
export class ItineraryPrintComponent implements OnInit {
  itinerary;
  resources;
  transports = [];
  accommodations = [];
  activities = [];

  itinerarySubscription: Subscription;
  eventSubscription: Subscription;
  resourceSubscription: Subscription;

  category = false;
  date = true;

  constructor(
    private itineraryService: ItineraryService,
    private itineraryEventService: ItineraryEventService,
    private resourceService: ResourceService,
    private router: Router) { }

  ngOnInit() {
    this.itinerarySubscription = this.itineraryService.currentItinerary
                                     .subscribe(
                                       result =>  {
                                         this.itinerary = result;
                                       }
                                     )

    this.resourceSubscription = this.resourceService.updateResources
                                    .subscribe(
                                      result => {
                                        this.resources = result;
                                      }
                                    )

    this.eventSubscription = this.itineraryEventService.updateEvent
                                .subscribe(
                                  result => {
                                    this.filterEvents(result);
                                  }
                                )
  }

  filterEvents(events)  {
    this.transports = [];
    this.accommodations = [];
    this.activities = [];
    for (let i = 0; i < events.length; i++) {
      if(events[i]['type'] === 'transport') {
        this.transports.push(events[i]);
      }
      if(events[i]['type'] === 'accommodation') {
        this.accommodations.push(events[i]);
      }
      if(events[i]['type'] === 'activity') {
        this.activities.push(events[i]);
      }
    }
  }

  showCategory()  {
    this.category = true;
    this.date = false;
  }

  showDate()  {
    this.date = true;
    this.category = false;
  }
}
