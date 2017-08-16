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

  dateSubscription: Subscription;
  dateRange = [];

  itinerarySubscription: Subscription;
  itinerary;
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
    this.itinerarySubscription = this.itineraryService.currentItinerary.subscribe(
       result => {
         this.itinerary = result;
         this.sortDailyNotes();
       })

    this.dateSubscription = this.itineraryService.updateDate.subscribe(
      result => {
        this.dateRange = Object.keys(result).map(key => result[key]);
      })

    this.eventSubscription = this.itineraryEventService.updateEvent.subscribe(
      result => {
        this.events = Object.keys(result).map(key => result[key]);
        this.loadingService.setLoader(false, "")
      })
  }

  ngOnDestroy() {
    if(this.dateSubscription) this.dateSubscription.unsubscribe();
    if(this.eventSubscription) this.eventSubscription.unsubscribe();
    if(this.itinerarySubscription) this.itinerarySubscription.unsubscribe();
  }

  sortDailyNotes()  {
    this.dailyNotes = []
    let notes = this.itinerary['daily_note'];

    for (let i = 0; i < notes.length; i++) {
      if(notes[i]['note'] === 'e.g. Day trip to the outskirts') {
        notes[i]['note'] = '';
      }
    }

    this.dailyNotes = notes;
  }

  preventScroll(value)  {
    if(value) {
      this.renderer.addClass(document.body, 'prevent-scroll');
    } else  {
      this.renderer.removeClass(document.body, 'prevent-scroll');
    }
  }

}
