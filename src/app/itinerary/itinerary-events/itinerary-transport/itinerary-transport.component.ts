import { Component, OnInit, Renderer2 } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Title }        from '@angular/platform-browser';
import { Subscription } from 'rxjs/Rx';

import { ItineraryService }      from '../../itinerary.service';
import { ItineraryEvent }        from '../itinerary-event';
import { ItineraryEventService } from '../itinerary-event.service';
import { LoadingService }        from '../../../loading';

@Component({
  selector: 'ww-itinerary-transport',
  templateUrl: './itinerary-transport.component.html',
  styleUrls: ['./itinerary-transport.component.scss']
})
export class ItineraryTransportComponent implements OnInit {
  preview;

  eventSubscription: Subscription;
  transports = [];
  totalTransports = 1;

  dateSubscription: Subscription;
  dateRange = [];

  itinerarySubscription: Subscription;
  itinerary;

  showTransportSummary = false;
  highlightedEvent;

  addTransport = false;

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

        let title = header + this.itinerary['name'] + " | Transport";

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
    this.transports = [];
    for (let i = 0; i < events.length; i++) {
      if(events[i]['type'] === 'transport') {

        if(!this.itinerary['num_days']) {

          let index = this.dateRange.indexOf(events[i]['dep_date'])
          let outIndex = this.dateRange.indexOf(events[i]['arr_date'])

          if(index < 0 || outIndex < 0) {
            events[i]['out_of_range'] = true;
          } else  {
            events[i]['out_of_range'] = false;
          }

        }

        this.transports.push(events[i])
      }
    }

    this.totalTransports = this.transports.length
    this.loadingService.setLoader(false, "");
    this.preventScroll(false);
  }

  toggleSummary() {
    this.showTransportSummary = !this.showTransportSummary;
    this.preventScroll(this.showTransportSummary);
  }

  hideTransportForm() {
    this.addTransport = false;
  }

  preventScroll(value)  {
    if(value) {
      this.renderer.addClass(document.body, 'prevent-scroll');
    } else  {
      this.renderer.removeClass(document.body, 'prevent-scroll');
    }
  }

  centerItem(event)  {
    this.showTransportSummary = false;
    this.preventScroll(false);

    this.highlightedEvent = event;
  }
}
