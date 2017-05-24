import { Component, OnInit, OnDestroy, ElementRef, HostListener, trigger, state, style, transition, animate } from '@angular/core';
import { Subscription } from 'rxjs/Rx';

import { ItineraryService }      from '../itinerary.service';
import { ItineraryEventService } from '../itinerary-events/itinerary-event.service';
import { LoadingService }        from '../../loading';

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
export class ItinerarySummaryComponent implements OnInit, OnDestroy {
  eventSubscription: Subscription;
  events = [];
  totalEvents = 1;

  itinDateSubscription: Subscription;
  itinDateRange = [];

  showDetailsInSummary = false;
  detailsInSummary = 'out';

  chosenEvent;

  left;
  itemPosition = [];
  currentDate = 'any day';
  index = 0;

  constructor(
    private element: ElementRef,
    private itineraryService: ItineraryService,
    private itineraryEventService: ItineraryEventService,
    private loadingService: LoadingService) { }

  ngOnInit() {
    this.events = [];
    this.itinDateSubscription = this.itineraryService.updateDate.subscribe(
                                      result => {
                                        this.itinDateRange = Object.keys(result).map(key => result[key]);
                                    })

    this.eventSubscription = this.itineraryEventService.updateEvent.subscribe(
                                  result => {
                                    this.showDetailsInSummary = false;
                                    this.filterEvents(result);
                                  }
                                )
  }

  ngOnDestroy() {
    this.itinDateSubscription.unsubscribe();
    this.eventSubscription.unsubscribe();
    this.loadingService.setLoader(true, "");
  }

  @HostListener("window:scroll", [])
  onWindowScroll() {

    for (let i = 0; i < this.itemPosition.length; i++) {
      let offset = this.element.nativeElement.offsetParent.scrollTop;
      let item = this.itemPosition[i]['position'];
      let diff = item - offset;

      if(diff < 0)  {
        this.currentDate = this.itemPosition[i]['date']
        this.index = i;
      }
    }
    // console.log(offset);
  }

  sectionPosition(event)  {
    this.itemPosition.push(event);
  }

  onScroll(event) {
    // console.log(event);
    if(event.srcElement.clientWidth > 1090) {
      this.left = 200 - event.srcElement.scrollLeft + "px";
    } else  {
      this.left = -event.srcElement.scrollLeft + "px";

    }
  }

  filterEvents(events)  {
    this.totalEvents = events.length;

    let accommodations = [];
    let datedEvents = [];
    let anyDateEvents = [];
    let anyTimeEvents = [];

    for (let i = 0; i < events.length; i++) {
      if(events[i]['type'] === 'accommodation') {
        let oneDay = 24*60*60*1000;
        let inDate = new Date(events[i]['check_in_date']);
        let outDate = new Date(events[i]['check_out_date']);
        let numDaysDiff = Math.round(Math.abs((inDate.getTime() - outDate.getTime())/oneDay));
        let numDays = numDaysDiff + " night" + (numDaysDiff > 1 ? "s" : "");
        accommodations.push({
          check_in_date: events[i]['check_in_date'],
          check_in_time: events[i]['check_in_time'],
          check_out_date: events[i]['check_out_date'],
          check_out_time: events[i]['check_out_time'],
          created_at: events[i]['created_at'],
          date: events[i]['date'],
          formatted_address: events[i]['formatted_address'],
          international_phone_number: events[i]['international_phone_number'],
          itinerary: events[i]['itinerary'],
          name: events[i]['name'],
          note: events[i]['note'],
          stay_city: events[i]['stay_city'],
          time: events[i]['time'],
          time_ago: events[i]['time_ago'],
          type: events[i]['type'],
          user: events[i]['user'],
          website: events[i]['website'],
          _id: events[i]['_id'],
          inOut: "checkin",
          numDays: numDays,
          summary_date: events[i]['check_in_date'],
          summary_time: events[i]['check_in_time']
        });
        accommodations.push({
          check_in_date: events[i]['check_in_date'],
          check_in_time: events[i]['check_in_time'],
          check_out_date: events[i]['check_out_date'],
          check_out_time: events[i]['check_out_time'],
          created_at: events[i]['created_at'],
          date: events[i]['date'],
          formatted_address: events[i]['formatted_address'],
          international_phone_number: events[i]['international_phone_number'],
          itinerary: events[i]['itinerary'],
          name: events[i]['name'],
          note: events[i]['note'],
          stay_city: events[i]['stay_city'],
          time: events[i]['time'],
          time_ago: events[i]['time_ago'],
          type: events[i]['type'],
          user: events[i]['user'],
          website: events[i]['website'],
          _id: events[i]['_id'],
          inOut: "checkout",
          summary_date: events[i]['check_out_date'],
          summary_time: events[i]['check_out_time']
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
          arr_city: events[i]['arr_city'],
          arr_date: events[i]['arr_date'],
          arr_station: events[i]['arr_station'],
          arr_terminal: events[i]['arr_terminal'],
          arr_time: events[i]['arr_time'],
          contact_number: events[i]['contact_number'],
          created_at: events[i]['created_at'],
          date: events[i]['date'],
          dep_city: events[i]['dep_city'],
          dep_date: events[i]['dep_date'],
          dep_station: events[i]['dep_station'],
          dep_terminal: events[i]['dep_terminal'],
          dep_time: events[i]['dep_time'],
          itinerary: events[i]['itinerary'],
          note: events[i]['note'],
          reference_number: events[i]['reference_number'],
          time: events[i]['time'],
          time_ago: events[i]['time_ago'],
          transport_company: events[i]['transport_company'],
          transport_type: events[i]['transport_type'],
          type: events[i]['type'],
          user: events[i]['user'],
          _id: events[i]['_id'],
          approach: 'departure',
          summary_date: events[i]['dep_date'],
          summary_time: events[i]['dep_time']
        });
        datedEvents.push({
          arr_city: events[i]['arr_city'],
          arr_date: events[i]['arr_date'],
          arr_station: events[i]['arr_station'],
          arr_terminal: events[i]['arr_terminal'],
          arr_time: events[i]['arr_time'],
          contact_number: events[i]['contact_number'],
          created_at: events[i]['created_at'],
          date: events[i]['date'],
          dep_city: events[i]['dep_city'],
          dep_date: events[i]['dep_date'],
          dep_station: events[i]['dep_station'],
          dep_terminal: events[i]['dep_terminal'],
          dep_time: events[i]['dep_time'],
          itinerary: events[i]['itinerary'],
          note: events[i]['note'],
          reference_number: events[i]['reference_number'],
          time: events[i]['time'],
          time_ago: events[i]['time_ago'],
          transport_company: events[i]['transport_company'],
          transport_type: events[i]['transport_type'],
          type: events[i]['type'],
          user: events[i]['user'],
          _id: events[i]['_id'],
          approach: 'arrival',
          summary_date: events[i]['arr_date'],
          summary_time: events[i]['arr_time']
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

    setTimeout(() =>  {this.loadingService.setLoader(false, "")}, 1000);
  }

  showEventDetails(event)  {
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
