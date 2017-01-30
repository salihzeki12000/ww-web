import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Rx';

import { Itinerary } from '../itinerary';
import { ItineraryService } from '../itinerary.service';

import { ItineraryEventService } from '../itinerary-events/itinerary-event.service';

@Component({
  selector: 'ww-itinerary-summary',
  templateUrl: './itinerary-summary.component.html',
  styleUrls: ['./itinerary-summary.component.scss']
})
export class ItinerarySummaryComponent implements OnInit {
  events = [];

  eventSubscription: Subscription;

  itinDateSubscription: Subscription;
  itinDateRange = [];

  constructor(
    private itineraryService: ItineraryService,
    private itineraryEventService: ItineraryEventService) { }

  ngOnInit() {
    this.events = [];
    this.itinDateSubscription = this.itineraryService.updateDate
                                    .subscribe(
                                      result => {
                                        this.itinDateRange = Object.keys(result).map(key => result[key]);
                                    })

    this.eventSubscription = this.itineraryEventService.updateEvent
                                .subscribe(
                                  result => {
                                    this.filterEvents(result);
                                  }
                                )
  }

  filterEvents(events)  {
    let accommodations = [];
    let unsortedEvents = [];
    let anyDateEvents = [];
    let anyTimeEvents = [];

    for (let i = 0; i < events.length; i++) {
      if(events[i]['type'] === 'accommodation') {
        accommodations.push({
          type: events[i]['type'],
          date: events[i]['checkInDate'],
          time: events[i]['checkInTime'],
          checkOutDate: events[i]['checkOutDate'],
          name: events[i]['name'],
          formatted_address: events[i]['formatted_address'],
          international_phone_number: events[i]['international_phone_number'],
          website: events[i]['website'],
          note: events[i]['note'],
          inOut: "checkin"
        });
        accommodations.push({
          type: events[i]['type'],
          date: events[i]['checkOutDate'],
          time: events[i]['checkOutTime'],
          name: events[i]['name'],
          note: events[i]['note'],
          inOut: "checkout"
        })
      }
      if(events[i]['type'] === 'activity') {
        if(events[i]['date'] === 'any day' && events[i]['time'] === 'anytime') {
          anyTimeEvents.push(events[i]);
        } else if (events[i]['date'] === 'any day' && events[i]['time'] !== 'anytime')  {
          anyDateEvents.push(events[i])
        } else  {
          unsortedEvents.push(events[i]);
        }
      }
      if(events[i]['type'] === 'transport') {
        unsortedEvents.push({
          date: events[i]['depDate'],
          time: events[i]['depTime'],
          depCity: events[i]['depCity'],
          arrCity: events[i]['arrCity'],
          transportType: events[i]['transportType'],
          type: events[i]['type'],
          referenceNumber: events[i]['referenceNumber'],
          approach: 'departure'
        });
        unsortedEvents.push({
          date: events[i]['arrDate'],
          time: events[i]['arrTime'],
          depCity: events[i]['depCity'],
          arrCity: events[i]['arrCity'],
          transportType: events[i]['transportType'],
          type: events[i]['type'],
          referenceNumber: events[i]['referenceNumber'],
          approach: 'arrival'
        })
      }
    }

    for (let i = 0; i < accommodations.length; i++) {
      if(accommodations[i]['time'] === 'anytime')  {
        anyTimeEvents.push(accommodations[i]);
      } else if(accommodations[i]['time'] !== 'anytime') {
        unsortedEvents.push(accommodations[i]);
      }
    }
    this.sortEventByDate(unsortedEvents, anyDateEvents, anyTimeEvents);
  }

  sortEventByDate(datedEvents, anyDateEvents, anyTimeEvents) {
    datedEvents.sort((a,b) =>  {
      return new Date(a['date']).getTime() - new Date(b['date']).getTime();
    })

    datedEvents.sort((a,b) =>  {
      let aTime = a['time'].replace(a['time'].substring(2,3), "");
      let convertedATime = parseInt(aTime);

      let bTime = b['time'].replace(b['time'].substring(2,3), "");
      let convertedBTime = parseInt(bTime);

      return convertedATime - convertedBTime;
    })

    anyDateEvents.sort((a,b) =>  {
      let aTime = a['time'].replace(a['time'].substring(2,3), "");
      let convertedATime = parseInt(aTime);

      let bTime = b['time'].replace(b['time'].substring(2,3), "");
      let convertedBTime = parseInt(bTime);

      return convertedATime - convertedBTime;
    })

    this.events = anyTimeEvents.concat(datedEvents, anyDateEvents);
  }

}
