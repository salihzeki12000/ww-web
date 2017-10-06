import { Component, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Title }        from '@angular/platform-browser';
import { Subscription } from 'rxjs/Rx';

import { ItineraryService }      from '../../itinerary.service';
import { ItineraryEvent }        from '../itinerary-event';
import { ItineraryEventService } from '../itinerary-event.service';
import { LoadingService }        from '../../../loading';

@Component({
  selector: 'ww-itinerary-accommodation',
  templateUrl: './itinerary-accommodation.component.html',
  styleUrls: ['./itinerary-accommodation.component.scss']
})
export class ItineraryAccommodationComponent implements OnInit, OnDestroy {
  preview;

  eventSubscription: Subscription;
  accommodations = [];
  totalAccommodations = 1;

  dateSubscription: Subscription;
  dateRange = [];

  itinerarySubscription: Subscription;
  itinerary;

  showAccommodationSummary = false;
  highlightedEvent;

  addAccommodation = false;

  constructor(
    private titleService: Title,
    private renderer: Renderer2,
    private route: ActivatedRoute,
    private itineraryService: ItineraryService,
    private itineraryEventService: ItineraryEventService,
    private loadingService: LoadingService) { }

  ngOnInit() {
    let segments = this.route.snapshot['_urlSegment'].segments;
    if(segments[0]['path'] === 'preview') this.preview = true;

    this.dateSubscription = this.itineraryService.updateDate.subscribe(
      result => {
        this.dateRange = Object.keys(result).map(key => result[key]);
        this.dateRange.splice(0,1);
    })

    this.eventSubscription = this.itineraryEventService.updateEvent.subscribe(
      result => {

        setTimeout(() =>  {
          this.filterEvent(result);
        }, 1000)
      })

    this.itinerarySubscription = this.itineraryService.currentItinerary.subscribe(
      result => {
        this.itinerary = result;

        let header = ''
        if(this.preview) header = "Preview : ";

        let title = header + this.itinerary['name'] + " | Accommodation";

        this.titleService.setTitle(title);
      })
  }

  ngOnDestroy() {
    if(this.dateSubscription) this.dateSubscription.unsubscribe();
    if(this.eventSubscription) this.eventSubscription.unsubscribe();
    if(this.itinerarySubscription) this.itinerarySubscription.unsubscribe();

    this.loadingService.setLoader(true, "");
  }

  filterEvent(events) {
    this.accommodations = [];

    for (let i = 0; i < events.length; i++) {
      if(events[i]['type'] === 'accommodation') {

        if(!this.itinerary['num_days']) {

          let index = this.dateRange.indexOf(events[i]['check_in_date'])
          let outIndex = this.dateRange.indexOf(events[i]['check_out_date'])

          if(index < 0 || outIndex < 0) {
            events[i]['out_of_range'] = true;
          } else  {
            events[i]['out_of_range'] = false;
          }

          let oneDay = 24*60*60*1000;
          let inDate = new Date(events[i]['check_in_date']);
          let outDate = new Date(events[i]['check_out_date']);
          let numDaysDiff = Math.round(Math.abs((inDate.getTime() - outDate.getTime())/oneDay));
          events[i]['numDays'] = numDaysDiff + " night" + (numDaysDiff > 1 ? "s" : "");

        } else  {
          let inDay = events[i]['check_in_date'].slice(4,events[i]['check_in_date'].length);
          let outDay = events[i]['check_out_date'].slice(4,events[i]['check_out_date'].length)
          let numDaysDiff = +outDay - +inDay;
          events[i]['numDays'] = numDaysDiff + " night" + (numDaysDiff > 1 ? "s" : "");
        }

        this.accommodations.push(events[i])
      }
    }

    this.totalAccommodations = this.accommodations.length;
    this.loadingService.setLoader(false, "");
    this.preventScroll(false);
  }

  toggleSummary() {
    this.showAccommodationSummary = !this.showAccommodationSummary;
    this.preventScroll(this.showAccommodationSummary);
  }

  hideAccommodationForm() {
    this.addAccommodation = false;
  }

  preventScroll(value)  {
    if(value) {
      this.renderer.addClass(document.body, 'prevent-scroll');
    } else  {
      this.renderer.removeClass(document.body, 'prevent-scroll');
    }
  }

  centerItem(event)  {
    this.showAccommodationSummary = false;
    this.preventScroll(false);

    this.highlightedEvent = event;
  }
}
