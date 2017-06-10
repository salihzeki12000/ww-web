import { Component, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
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
  eventSubscription: Subscription;
  accommodations: ItineraryEvent[] = [];
  totalAccommodations = 1;

  itinDateSubscription: Subscription;
  itinDateRange = [];

  currentItinerarySubscription: Subscription;
  currentItinerary;

  showAccommodationSummary = false;
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
    this.accommodations = [];
    for (let i = 0; i < events.length; i++) {
      if(events[i]['type'] === 'accommodation') {
        let index = this.itinDateRange.indexOf(events[i]['check_in_date'])
        let outIndex = this.itinDateRange.indexOf(events[i]['check_out_date'])

        if(index < 0 || outIndex < 0) {
          events[i]['out_of_range'] = true;
        }
        this.accommodations.push(events[i])
      }
    }
    this.totalAccommodations = this.accommodations.length;
    this.loadingService.setLoader(false, "");
    this.preventScroll(false);
  }

  showSummary() {
    this.showAccommodationSummary = !this.showAccommodationSummary;
    this.preventScroll(this.showAccommodationSummary);
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
