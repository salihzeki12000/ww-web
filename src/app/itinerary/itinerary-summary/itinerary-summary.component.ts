import { Component, OnInit, OnDestroy, Renderer2, ElementRef, HostListener } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs/Rx';
import { Title }        from '@angular/platform-browser';

declare var google:any;

import { ItineraryService }      from '../itinerary.service';
import { ItineraryEventService } from '../itinerary-events/itinerary-event.service';
import { LoadingService }        from '../../loading';

@Component({
  selector: 'ww-itinerary-summary',
  templateUrl: './itinerary-summary.component.html',
  styleUrls: ['./itinerary-summary.component.scss'],
})
export class ItinerarySummaryComponent implements OnInit, OnDestroy {
  preview;
  compressed = false;
  compressedView = false;
  show = false;

  eventSubscription: Subscription;
  events;
  cEvents;
  totalEvents = 1;

  dateSubscription: Subscription;
  dateRange = [];

  itinerarySubscription: Subscription;
  itinerary;
  dailyNotes = [];

  showDetailsInSummary = false;

  chosenEvent;

  today;
  scroll = false;
  dateBar;
  dateRow;

  left;
  itemPosition = [];
  currentDate = 'any day';
  index = 0;

  oldWidth;
  newWidth;

  addAccommodation = false;
  addTransport = false;
  addActivity = false;
  addDate;
  addEvent = false;

  constructor(
    private titleService: Title,
    private element: ElementRef,
    private renderer: Renderer2,
    private route: ActivatedRoute,
    private itineraryService: ItineraryService,
    private itineraryEventService: ItineraryEventService,
    private loadingService: LoadingService) { }

  ngOnInit() {
    if(this.element.nativeElement.ownerDocument.body.clientWidth > 420)  {
      this.compressedView = true;
    }

    let today = new Date();
    let year = today.getFullYear();
    let month = today.getMonth() + 1;
    let date = today.getDate();
    this.today = year + "-" + month + "-" + date + "T00:00:00.000Z";

    this.events = [];
    this.eventSubscription = this.itineraryEventService.updateEvent.subscribe(
      result => {
        this.showDetailsInSummary = false;
        this.cEvents = result;
        if(this.itinerary) this.filterEvents(this.cEvents);
      })

    this.itinerarySubscription = this.itineraryService.currentItinerary.subscribe(
       result => {
         this.show = false;
         setTimeout(()  =>  {this.show = true}, 200);

         this.itinerary = result;
         if(this.cEvents) this.filterEvents(this.cEvents);;

         this.itemPosition = [];

         this.setTitle();
         this.sortDailyNotes();
       })

    this.dateSubscription = this.itineraryService.updateDate.subscribe(
      result => {
        this.dateRange = Object.keys(result).map(key => result[key]);
        this.checkScroll();
      })
  }

  ngOnDestroy() {
    if(this.dateSubscription) this.dateSubscription.unsubscribe();
    if(this.eventSubscription) this.eventSubscription.unsubscribe();
    if(this.itinerarySubscription) this.itinerarySubscription.unsubscribe();

    this.loadingService.setLoader(true, "");
  }

  @HostListener("window:scroll", [])
  onWindowScroll() {
    if(!this.compressedView)  {
      for (let i = 0; i < this.itemPosition.length; i++) {
        let offset = this.element.nativeElement.ownerDocument.scrollingElement.scrollTop;
        let item = this.itemPosition[i]['position'] - 45;
        let diff = item - offset;

        if(diff < 0)  {
          this.currentDate = this.itemPosition[i]['date'];
          this.index = i;
        }
      }
    }

    if(this.compressedView) {
      for (let i = 0; i < this.itemPosition.length; i++) {
        let offset = this.element.nativeElement.ownerDocument.scrollingElement.scrollTop;
        let item = this.itemPosition[i]['position'] - 130;
        let diff = item - offset;

        if(diff < 0)  {
          this.currentDate = this.itemPosition[i]['date'];
          this.index = i;
        }
      }
    }

  }


  setTitle()  {
    this.preview = false;

    let segments = this.route.snapshot['_urlSegment'].segments;
    if(segments[0]['path'] === 'preview') this.preview = true;

    let header = ''
    if(this.preview) header = "Preview : ";

    let title = header + this.itinerary['name'] + " | Summary"
    this.titleService.setTitle(title);
  }

  sortDailyNotes()  {
    this.dailyNotes = [];

    for (let i = 0; i < this.itinerary['daily_note'].length; i++) {
      this.dailyNotes.push(this.itinerary['daily_note'][i]['note'].replace(/\r?\n/g, '<br/> '));
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

    if(!this.compressedView)  {
      if(this.today === event['date'])  {
        this.element.nativeElement.ownerDocument.scrollingElement.scrollTop = event['position'] - 30;
      }
    }
  }

  toggleView()  {
    this.itemPosition = [];
    this.currentDate = "any day";
    this.compressed = !this.compressed;
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

      if(this.newWidth > 420) {
        this.compressedView = true;
      } else  {
        this.compressedView = false;
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


  // sort events into individual timing
  filterEvents(events)  {
    this.events = [];
    this.totalEvents = events.length;

    let summaryEvents = [];
    let copyEvents = [];
    let numDays = '';

    for (let i = 0; i < events.length; i++) {

      if(events[i]['type'] === 'activity')  {

        events[i]['summary_date'] = events[i]['date'];
        events[i]['summary_time'] = events[i]['time'];
      }

      if(events[i]['type'] === 'accommodation') {

        if(!this.itinerary['num_days']) {
          let oneDay = 24*60*60*1000;
          let inDate = new Date(events[i]['check_in_date']);
          let outDate = new Date(events[i]['check_out_date']);
          let numDaysDiff = Math.round(Math.abs((inDate.getTime() - outDate.getTime())/oneDay));
          numDays = numDaysDiff + " night" + (numDaysDiff > 1 ? "s" : "");
        } else  {
          let inDay = events[i]['check_in_date'].slice(4,events[i]['check_in_date'].length);
          let outDay = events[i]['check_out_date'].slice(4,events[i]['check_out_date'].length)
          let numDaysDiff = +outDay - +inDay;
          numDays = numDaysDiff + " night" + (numDaysDiff > 1 ? "s" : "");
        }

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
    this.getDistance();

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

  getDistance() {
    for (let i = 1; i < this.events.length - 1; i++) {
      this.events[i]['distance'] = null;
      this.events[i]['walk'] = null;

      if(this.events[i]['summary_date'] === this.events[i - 1]['summary_date'] && this.events[i]['summary_date'] !== 'any day') {
        if(this.events[i]['location'] && this.events[i - 1]['location'])  {
          let aLatLng = new google.maps.LatLng(this.events[i]['place']['lat'], this.events[i]['place']['lng']);
          let bLatLng = new google.maps.LatLng(this.events[i - 1]['place']['lat'], this.events[i - 1]['place']['lng']);

          let distance = google.maps.geometry.spherical.computeDistanceBetween(aLatLng, bLatLng) / 1000;
          this.events[i]['distance'] = distance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});

          let speed = this.itinerary['walking_speed'] * this.events[i]['distance'];
          this.events[i]['walk'] = speed.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0});
        }
      }
    }
  }

  // add event from date
  add(date) {
    this.addDate = date;
    this.addEvent = true;
  }

  cancelAdd() {
    this.addDate = undefined;
    this.addEvent = false;
  }

  // add forms
  addAccommodationForm()  {
    this.addAccommodation = true;
    this.addEvent = false;
  }

  addTransportForm()  {
    this.addTransport = true;
    this.addEvent = false;
  }

  addActivityForm()  {
    this.addActivity = true;
    this.addEvent = false;
  }

  // hide forms
  hideAccommodationForm(hide)  {
    this.addAccommodation = false;
  }

  hideTransportForm(hide)  {
    this.addTransport = false;
  }

  hideActivityForm(hide)  {
    this.addActivity = false;
  }


  // show details of item
  showEventDetails(event)  {
    if(this.chosenEvent === event)  {
      this.hideDetailsInSummary();
    } else  {
      this.showDetailsInSummary = true;

      if(event['approach'] === 'arrival' || event['inOut'] === 'checkout')  {
        for (let i = 0; i < this.events.length; i++) {
          if(this.events[i]['_id'] === event['_id'] && (this.events[i]['approach'] === 'departure' || this.events[i]['inOut'] === 'checkin')) {
            this.events[i]['formatted_note'] = this.events[i]['note'].replace(/\r?\n/g, '<br/> ');
            this.chosenEvent = this.events[i];
            break;
          }
        }
      } else  {
        event['formatted_note'] = event['note'].replace(/\r?\n/g, '<br/> ');
        this.chosenEvent = event;
      }

      if(this.element.nativeElement.offsetParent.clientWidth < 421) {
        this.preventScroll(true);
      }
    }
  }

  hideDetailsInSummary()  {
    this.showDetailsInSummary = false;
    this.chosenEvent = '';
    this.preventScroll(false);
  }


  // others
  preventScroll(value)  {
    if(value) {
      this.renderer.addClass(document.body, 'prevent-scroll');
    } else  {
      this.renderer.removeClass(document.body, 'prevent-scroll');
    }
  }

}
