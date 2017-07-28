import { Component, OnInit, Renderer2 } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
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
  eventSubscription: Subscription;
  transports = [];
  totalTransports = 1;

  itinDateSubscription: Subscription;
  itinDateRange = [];

  currentItinerarySubscription: Subscription;
  currentItinerary;

  showTransportSummary = false;
  highlightedEvent;

  constructor(
    private renderer: Renderer2,
    private itineraryService: ItineraryService,
    private itineraryEventService: ItineraryEventService,
    private loadingService: LoadingService) { }

  ngOnInit() {
    this.itinDateSubscription = this.itineraryService.updateDate.subscribe(
                                      result => {
                                        this.itinDateRange = Object.keys(result).map(key => result[key]);
                                    })

    this.eventSubscription = this.itineraryEventService.updateEvent.subscribe(
                                 result => { this.filterEvent(result); })

    this.currentItinerarySubscription = this.itineraryService.currentItinerary.subscribe(
                                            result => { this.currentItinerary = result; })
  }

  ngOnDestroy() {
    this.itinDateSubscription.unsubscribe();
    this.eventSubscription.unsubscribe();
    this.currentItinerarySubscription.unsubscribe();
    this.loadingService.setLoader(true, "");
  }

  filterEvent(events) {
    this.transports = [];
    for (let i = 0; i < events.length; i++) {
      if(events[i]['type'] === 'transport') {
        let index = this.itinDateRange.indexOf(events[i]['dep_date'])
        let outIndex = this.itinDateRange.indexOf(events[i]['arr_date'])

        if(index < 0 || outIndex < 0) {
          events[i]['out_of_range'] = true;
        } else  {
          events[i]['out_of_range'] = false;
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
