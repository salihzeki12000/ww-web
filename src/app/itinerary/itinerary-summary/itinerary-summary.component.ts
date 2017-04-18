import { Component, OnInit, trigger, state, style, transition, animate } from '@angular/core';
import { Subscription } from 'rxjs/Rx';

import { Itinerary } from '../itinerary';
import { ItineraryService } from '../itinerary.service';

import { ItineraryEventService } from '../itinerary-events/itinerary-event.service';

@Component({
  selector: 'ww-itinerary-summary',
  templateUrl: './itinerary-summary.component.html',
  styleUrls: ['./itinerary-summary.component.scss'],
  animations: [
    trigger('slideInOut', [
      state('in', style({ transform: 'translate3d(0, 0, 0)' })),
      state('out', style({ transform: 'translate3d(0, -100%, 0)' })),
      transition('in => out', animate('800ms ease-in-out')),
      transition('out => in', animate('800ms ease-in-out'))
    ])
  ]
})
export class ItinerarySummaryComponent implements OnInit {
  events = [];

  eventSubscription: Subscription;

  itinDateSubscription: Subscription;
  itinDateRange = [];

  showDetailsInSummary = false;
  detailsInSummary = 'out';

  chosenEvent;

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
                                    this.showDetailsInSummary = false;
                                    this.filterEvents(result);
                                  }
                                )
  }

  filterEvents(events)  {
    let accommodations = [];
    let datedEvents = [];
    let anyDateEvents = [];
    let anyTimeEvents = [];

    for (let i = 0; i < events.length; i++) {
      if(events[i]['type'] === 'accommodation') {
        let oneDay = 24*60*60*1000;
        let inDate = new Date(events[i]['checkInDate']);
        let outDate = new Date(events[i]['checkOutDate']);
        let numDaysDiff = Math.round(Math.abs((inDate.getTime() - outDate.getTime())/oneDay));
        let numDays = numDaysDiff + " night" + (numDaysDiff > 1 ? "s" : "");
        accommodations.push({
          checkInDate: events[i]['checkInDate'],
          checkInTime: events[i]['checkInTime'],
          checkOutDate: events[i]['checkOutDate'],
          checkOutTime: events[i]['checkOutTime'],
          created_at: events[i]['created_at'],
          date: events[i]['date'],
          formatted_address: events[i]['formatted_address'],
          international_phone_number: events[i]['international_phone_number'],
          itinerary: events[i]['itinerary'],
          name: events[i]['name'],
          note: events[i]['note'],
          stayCity: events[i]['stayCity'],
          time: events[i]['time'],
          time_ago: events[i]['time_ago'],
          type: events[i]['type'],
          user: events[i]['user'],
          website: events[i]['website'],
          _id: events[i]['_id'],
          inOut: "checkin",
          numDays: numDays,
          summary_date: events[i]['checkInDate'],
          summary_time: events[i]['checkInTime']
        });
        accommodations.push({
          checkInDate: events[i]['checkInDate'],
          checkInTime: events[i]['checkInTime'],
          checkOutDate: events[i]['checkOutDate'],
          checkOutTime: events[i]['checkOutTime'],
          created_at: events[i]['created_at'],
          date: events[i]['date'],
          formatted_address: events[i]['formatted_address'],
          international_phone_number: events[i]['international_phone_number'],
          itinerary: events[i]['itinerary'],
          name: events[i]['name'],
          note: events[i]['note'],
          stayCity: events[i]['stayCity'],
          time: events[i]['time'],
          time_ago: events[i]['time_ago'],
          type: events[i]['type'],
          user: events[i]['user'],
          website: events[i]['website'],
          _id: events[i]['_id'],
          inOut: "checkout",
          summary_date: events[i]['checkOutDate'],
          summary_time: events[i]['checkOutTime']
        })
      }
      if(events[i]['type'] === 'activity') {
        if(events[i]['time'] === 'anytime') {
          events[i]['summary_date'] = events[i]['date'];
          events[i]['summary_time'] = 'anytime';
          anyTimeEvents.push(events[i]);
        } else if (events[i]['date'] === 'any day' && events[i]['time'] !== 'anytime')  {
          events[i]['summary_date'] = 'any day';
          events[i]['summary_time'] = events[i]['time'];
          anyDateEvents.push(events[i])
        } else  {
          events[i]['summary_date'] = events[i]['date'];
          events[i]['summary_time'] = events[i]['time'];
          datedEvents.push(events[i]);
        }
      }
      if(events[i]['type'] === 'transport') {
        datedEvents.push({
          arrCity: events[i]['arrCity'],
          arrDate: events[i]['arrDate'],
          arrStation: events[i]['arrStation'],
          arrTerminal: events[i]['arrTerminal'],
          arrTime: events[i]['arrTime'],
          contactNumber: events[i]['contactNumber'],
          created_at: events[i]['created_at'],
          date: events[i]['date'],
          depCity: events[i]['depCity'],
          depDate: events[i]['depDate'],
          depStation: events[i]['depStation'],
          depTerminal: events[i]['depTerminal'],
          depTime: events[i]['depTime'],
          itinerary: events[i]['itinerary'],
          note: events[i]['note'],
          referenceNumber: events[i]['referenceNumber'],
          time: events[i]['time'],
          time_ago: events[i]['time_ago'],
          transportCompany: events[i]['transportCompany'],
          transportType: events[i]['transportType'],
          type: events[i]['type'],
          user: events[i]['user'],
          _id: events[i]['_id'],
          approach: 'departure',
          summary_date: events[i]['depDate'],
          summary_time: events[i]['depTime']
        });
        datedEvents.push({
          arrCity: events[i]['arrCity'],
          arrDate: events[i]['arrDate'],
          arrStation: events[i]['arrStation'],
          arrTerminal: events[i]['arrTerminal'],
          arrTime: events[i]['arrTime'],
          contactNumber: events[i]['contactNumber'],
          created_at: events[i]['created_at'],
          date: events[i]['date'],
          depCity: events[i]['depCity'],
          depDate: events[i]['depDate'],
          depStation: events[i]['depStation'],
          depTerminal: events[i]['depTerminal'],
          depTime: events[i]['depTime'],
          itinerary: events[i]['itinerary'],
          note: events[i]['note'],
          referenceNumber: events[i]['referenceNumber'],
          time: events[i]['time'],
          time_ago: events[i]['time_ago'],
          transportCompany: events[i]['transportCompany'],
          transportType: events[i]['transportType'],
          type: events[i]['type'],
          user: events[i]['user'],
          _id: events[i]['_id'],
          approach: 'arrival',
          summary_date: events[i]['arrDate'],
          summary_time: events[i]['arrTime']
        })
      }
    }

    for (let i = 0; i < accommodations.length; i++) {
      if(accommodations[i]['time'] === 'anytime')  {
        anyTimeEvents.push(accommodations[i]);
      } else if(accommodations[i]['time'] !== 'anytime') {
        datedEvents.push(accommodations[i]);
      }
    }
    this.sortEventByDate(datedEvents, anyDateEvents, anyTimeEvents);
  }

  sortEventByDate(datedEvents, anyDateEvents, anyTimeEvents) {
    datedEvents.sort((a,b) =>  {
      return new Date(a['summary_date']).getTime() - new Date(b['summary_date']).getTime();
    })

    datedEvents.sort((a,b) =>  {
      let aTime = a['summary_time'].replace(a['summary_time'].substring(2,3), "");
      let convertedATime = parseInt(aTime);

      let bTime = b['summary_time'].replace(b['summary_time'].substring(2,3), "");
      let convertedBTime = parseInt(bTime);

      return convertedATime - convertedBTime;
    })

    anyDateEvents.sort((a,b) =>  {
      let aTime = a['summary_time'].replace(a['summary_time'].substring(2,3), "");
      let convertedATime = parseInt(aTime);

      let bTime = b['summary_time'].replace(b['summary_time'].substring(2,3), "");
      let convertedBTime = parseInt(bTime);

      return convertedATime - convertedBTime;
    })

    this.events = anyTimeEvents.concat(datedEvents, anyDateEvents);
  }

  showDetails(event)  {
    this.showDetailsInSummary = true;
    this.detailsInSummary = 'in';
    this.chosenEvent = event;
  }

  hideDetailsInSummary()  {
    this.showDetailsInSummary = false;
    this.detailsInSummary = 'out';
    this.chosenEvent = '';
  }

}
