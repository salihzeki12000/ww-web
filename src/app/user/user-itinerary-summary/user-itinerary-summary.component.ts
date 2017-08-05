import { Component, OnInit, OnDestroy, Renderer2, ElementRef, HostListener } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs/Rx';

import { ItineraryService, ItineraryEventService }  from '../../itinerary';
import { LoadingService } from '../../loading';

@Component({
  selector: 'ww-user-itinerary-summary',
  templateUrl: './user-itinerary-summary.component.html',
  styleUrls: ['./user-itinerary-summary.component.scss']
})
export class UserItinerarySummaryComponent implements OnInit, OnDestroy {
  eventSubscription: Subscription;
  events = [];
  totalEvents = 1;

  itinDateSubscription: Subscription;
  itinDateRange = [];

  currentItinerarySubscription: Subscription;
  currentItinerary;
  dailyNotes = [];

  scroll = false;
  dateBar;
  dateRow;

  left;
  itemPosition = [];
  currentDate = 'any day';
  index = 0;

  oldWidth;
  newWidth;

  constructor(
    private renderer: Renderer2,
    private element: ElementRef,
    private route: ActivatedRoute,
    private itineraryService: ItineraryService,
    private itineraryEventService: ItineraryEventService,
    private loadingService: LoadingService) { }

  ngOnInit() {
    this.route.params.forEach((params: Params) => {
      let id = params['id'];

      this.itineraryService.getItin(id).subscribe(
        result => {})

      this.itineraryEventService.getEvents(id).subscribe(
        eventResult => {})
    })

    this.events = [];
    this.currentItinerarySubscription = this.itineraryService.currentItinerary.subscribe(
       result => {
         this.currentItinerary = result;
         this.sortDailyNotes();
       })

    this.itinDateSubscription = this.itineraryService.updateDate.subscribe(
      result => {
        this.itinDateRange = Object.keys(result).map(key => result[key]);
      })

    this.eventSubscription = this.itineraryEventService.updateEvent.subscribe(
      result => {
        this.events = Object.keys(result).map(key => result[key]);
        // this.filterEvents(result);
        this.loadingService.setLoader(false, "")
      })
  }

  ngOnDestroy() {
    this.itinDateSubscription.unsubscribe();
    this.eventSubscription.unsubscribe();
  }

  sortDailyNotes()  {
    this.dailyNotes = []
    let notes = this.currentItinerary['daily_note'];

    for (let i = 0; i < notes.length; i++) {
      if(notes[i]['note'] === 'e.g. Day trip to the outskirts') {
        notes[i]['note'] = '';
      }
    }

    this.dailyNotes = notes;
  }

  filterEvents(events)  {
    this.events = [];
    this.totalEvents = events.length;

    let summaryEvents = [];
    let copyEvents = [];

    for (let i = 0; i < events.length; i++) {

      if(events[i]['type'] === 'activity')  {
        events[i]['summary_date'] = events[i]['date'];
        events[i]['summary_time'] = events[i]['time'];
      }

      if(events[i]['type'] === 'accommodation') {
        let oneDay = 24*60*60*1000;
        let inDate = new Date(events[i]['check_in_date']);
        let outDate = new Date(events[i]['check_out_date']);
        let numDaysDiff = Math.round(Math.abs((inDate.getTime() - outDate.getTime())/oneDay));
        let numDays = numDaysDiff + " night" + (numDaysDiff > 1 ? "s" : "");

        let copy = Object.assign({}, events[i]);

        events[i]['inOut'] = "checkin";
        events[i]['numDays'] = numDays;
        events[i]['summary_date'] = events[i]['check_in_date'];
        events[i]['summary_time'] = events[i]['check_in_time'];

        copy['inOut'] = "checkout";
        copy['summary_date'] = events[i]['check_out_date'];
        copy['summary_time'] = events[i]['check_out_time'];

        copyEvents.push(copy);
      }

      if(events[i]['type'] === 'transport') {
        let copy = Object.assign({}, events[i]);

        events[i]['approach'] = 'departure';
        events[i]['summary_date'] = events[i]['dep_date'];
        events[i]['summary_time'] = events[i]['dep_time'];

        copy['approach'] = 'arrival';
        copy['summary_date'] = events[i]['arr_date'];
        copy['summary_time'] = events[i]['arr_time'];

        copyEvents.push(copy);
      }
    }

    summaryEvents = events.concat(copyEvents);
    this.sortEvents(summaryEvents);
  }

  sortEvents(events)  {
    let flex = [];
    let dated = [];

    for (let i = 0; i < events.length; i++) {
      if(events[i]['summary_time'] === 'anytime') {
        events[i]['sort_time'] = "25:00"
      } else  {
        events[i]['sort_time'] = events[i]['summary_time']
      }

      if(events[i]['summary_date'] === 'any day') {
        flex.push(events[i]);
      } else  {
        dated.push(events[i])
      }
    }

    flex = this.sort(flex);
    dated = this.sort(dated);

    this.events = dated.concat(flex);

    setTimeout(() =>  {this.loadingService.setLoader(false, "")}, 1000);
  }

  sort(events)  {
    events.sort((a,b) =>  {
      let dateA = new Date(a['summary_date']).getTime();
      let dateB = new Date(b['summary_date']).getTime();

      let timeA = parseInt((a['sort_time'].replace(a['sort_time'].substring(2,3), "")));
      let timeB = parseInt((b['sort_time'].replace(b['sort_time'].substring(2,3), "")));

      if (dateA < dateB) return -1;
      if (dateA > dateB) return 1;
      if (timeA < timeB) return -1;
      if (timeA > timeB) return 1;

      return 0;
    })

    return events;
  }

  preventScroll(value)  {
    if(value) {
      this.renderer.addClass(document.body, 'prevent-scroll');
    } else  {
      this.renderer.removeClass(document.body, 'prevent-scroll');
    }
  }

}
