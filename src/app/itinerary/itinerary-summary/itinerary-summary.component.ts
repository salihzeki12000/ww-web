import { Component, OnInit, OnDestroy, ElementRef, HostListener } from '@angular/core';
import { trigger, state, style, transition, animate }              from "@angular/animations"
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

  currentItinerarySubscription: Subscription;
  currentItinerary;

  showDetailsInSummary = false;
  detailsInSummary = 'out';

  chosenEvent;

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
    private element: ElementRef,
    private itineraryService: ItineraryService,
    private itineraryEventService: ItineraryEventService,
    private loadingService: LoadingService) { }

  ngOnInit() {
    this.events = [];
    this.itinDateSubscription = this.itineraryService.updateDate.subscribe(
                                      result => {
                                        this.itinDateRange = Object.keys(result).map(key => result[key]);
                                        this.checkScroll();
                                    })

    this.eventSubscription = this.itineraryEventService.updateEvent.subscribe(
                                  result => {
                                    this.showDetailsInSummary = false;
                                    this.filterEvents(result);
                                  }
                                )

    this.currentItinerarySubscription = this.itineraryService.currentItinerary.subscribe(
                                             result => {
                                               this.currentItinerary = result;
                                             })


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
      let item = this.itemPosition[i]['position'] - 30;
      let diff = item - offset;

      if(diff < 0)  {
        this.currentDate = this.itemPosition[i]['date']
        this.index = i;
      }
    }
  }

  checkScroll() {
    setTimeout(()=> {
      this.scroll = false;
      this.dateRow = this.element.nativeElement.children[1].clientWidth;
      this.dateBar = this.element.nativeElement.children[1].children[0].clientWidth - 20;

      if(this.dateBar > this.dateRow) {
        this.scroll = true
      }
    },500)
  }

  sectionPosition(event)  {
    this.itemPosition.push(event);
  }

  onScroll(event) {
    if(event.type === "resize") {
      this.oldWidth = this.newWidth;
      this.newWidth = event.srcElement.innerWidth;

      if(this.oldWidth >= 1091 && this.newWidth < 1091)  {
        if(this.left !== undefined) {
          this.left = (Number(this.left.slice(0, this.left.length - 2)) - 200) + 'px';
        }
      } else if(this.oldWidth <= 1091 && this.newWidth > 1091) {
        if(this.left !== undefined) {
          this.left = (Number(this.left.slice(0, this.left.length - 2)) + 200) + 'px';
        }
      }

      this.dateRow = this.element.nativeElement.children[1].clientWidth;

      if(this.dateBar > this.dateRow) {
        this.scroll = true
      } else if(this.dateBar < this.dateRow)  {
        this.scroll = false;
      }
    }

    if(event.type === "scroll") {
      this.left = event.srcElement.offsetParent.offsetLeft - event.srcElement.scrollLeft + "px"
    }
  }

  scrollLeft()  {
    this.element.nativeElement.lastElementChild.scrollLeft -= 280;
  }

  scrollRight() {
    this.element.nativeElement.lastElementChild.scrollLeft += 280;
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
