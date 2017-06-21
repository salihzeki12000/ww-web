import { Component, OnInit, Input, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';

import { ItineraryService } from '../../itinerary.service';
import { ItineraryEventService } from '../../itinerary-events/itinerary-event.service';

@Component({
  selector: 'ww-itinerary-summary-item',
  templateUrl: './itinerary-summary-item.component.html',
  styleUrls: ['./itinerary-summary-item.component.scss']
})
export class ItinerarySummaryItemComponent implements OnInit {
  @Input() event;
  @Input() date;
  @Input() index;
  // @Input() currentItinerary;
  @Output() showEventDetails = new EventEmitter();

  editing = false;
  uniqueClass;

  //time picker
  ats = true;
  initHour = "";
  initMinute = "";
  timePicker = false;
  hour = "";
  minute = "";

  constructor(
    private element: ElementRef,
    private itineraryService: ItineraryService,
    private itineraryEventService: ItineraryEventService) { }

  ngOnInit() {
    this.initTime();
    this.uniqueClass = "event-" + this.index;
  }

  @HostListener('document:click', ['$event'])
  checkClick(event) {
    if(!event.target.classList.contains("time-picker-dropdown") &&
      !event.target.classList.contains("time") &&
      !event.target.classList.contains("time-select") &&
      !event.target.classList.contains("selected-time") &&
      !event.target.classList.contains(this.uniqueClass)) {
      this.editing = false;
      this.timePicker = false;
    }
  }

  initTime()  {
    if(this.event['summary_time'] === "anytime") {
      this.hour = 'anytime';
      this.minute = "00";
    } else {
      this.hour = this.event['summary_time'].slice(0,2);
      this.minute = this.event['summary_time'].slice(3,6);
    }

    this.initHour = this.hour;
    this.initMinute = this.minute;
  }

  editTime()  {
    this.editing = true;
    this.timePicker = true;
  }

  // select time
  selectPicker()  {
    this.timePicker = true;
  }

  selectHour(h) {
    this.hour = h;
  }

  selectMinute(m) {
    this.minute = m;
  }

  cancelEdit()  {
    this.editing = false;
    this.timePicker = false;
  }

  showDetails(event)  {
      this.showEventDetails.emit(event);
  }

  saveEdit()  {
    if(this.event.type === 'activity')  {
      if(this.hour === 'anytime')  {
        this.event['time'] = 'anytime';
      } else  {
        this.event['time'] = this.hour + ':' + this.minute;
      }

      this.event['summary_time'] = this.event['time'];
    }

    // if(this.event.type === 'accommodation') {
    //
    //   if(this.event['inOut'] === "checkin") {
    //     if(this.hour === 'anytime')  {
    //       this.event['check_in_time'] = 'anytime';
    //     } else  {
    //       this.event['check_in_time'] = this.hour + ':' + this.minute;
    //     }
    //
    //     this.event['time'] = this.event['check_in_time'];
    //     this.event['summary_time'] = this.event['time'];
    //   }
    //
    //   if(this.event['inOut'] === "checkout") {
    //     if(this.hour === 'anytime')  {
    //       this.event['check_out_time'] = 'anytime';
    //     } else  {
    //       this.event['check_out_time'] = this.hour + ':' + this.minute;
    //     }
    //     this.event['summary_time'] = this.event['check_out_time'];
    //   }
    //
    // }

    this.initHour = this.hour;
    this.initMinute = this.minute;
    this.itineraryEventService.editEvent(this.event).subscribe(
          result => { })

    this.editing = false;
    this.timePicker = false;
  }
}
