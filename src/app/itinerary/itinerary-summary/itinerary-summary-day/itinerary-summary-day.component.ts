import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';

declare var google:any;

import { ItineraryService } from '../../itinerary.service';
import { FlashMessageService } from '../../../flash-message';

@Component({
  selector: 'ww-itinerary-summary-day',
  templateUrl: './itinerary-summary-day.component.html',
  styleUrls: ['./itinerary-summary-day.component.scss']
})
export class ItinerarySummaryDayComponent implements OnInit {
  @Input() date;
  @Input() index;
  @Input() events;
  @Input() itinerary;
  @Input() dailyNote;
  @Output() showEventDetails = new EventEmitter();
  @Output() sectionPosition = new EventEmitter();
  @Output() addNewEvent = new EventEmitter();

  editing = false;
  uniqueClass;

  constructor(
    private element: ElementRef,
    private flashMessageService: FlashMessageService,
    private itineraryService: ItineraryService) { }

  ngOnInit() {
    this.uniqueClass = "daily-note-" + this.index;
    this.checkMeal();
    // this.getDistance();
  }

  ngAfterViewInit() {
    setTimeout(() =>  {
      this.sectionPosition.emit({ date: this.date, position: this.element.nativeElement.offsetTop })
    }, 1500)
  }


  @HostListener('document:click', ['$event'])
  checkClick(event) {
    if(!event.target.classList.contains(this.uniqueClass)) {
      this.editing = false;
    }
  }


  showDetails(event)  {
      this.showEventDetails.emit(event);
  }

  checkMeal() {
    for (let i = 0; i < this.events.length; i++) {
      if(this.events[i]['type'] === 'activity')  {

        for (let j = 0; j < this.events[i]['meals'].length; j++) {
          if(this.events[i]['meals'][j]['checked']) {
            this.events[i]['meal'] = true;
            break;
          };
        }
      }
    }
  }

  // getDistance() {
  //   for (let i = 1; i < this.events.length - 1; i++) {
  //     if(this.events[i]['summary_date'] === this.events[i - 1]['summary_date']) {
  //       if(this.events[i]['location'] && this.events[i - 1]['location'])  {
  //         let aLatLng = new google.maps.LatLng(this.events[i]['place']['lat'], this.events[i]['place']['lng']);
  //         let bLatLng = new google.maps.LatLng(this.events[i - 1]['place']['lat'], this.events[i - 1]['place']['lng']);
  //
  //         let distance = google.maps.geometry.spherical.computeDistanceBetween(aLatLng, bLatLng) / 1000;
  //         this.events[i]['distance'] = distance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})
  //       }
  //     }
  //   }
  // }


  updateNote(editedNote: string)  {
    editedNote = editedNote.trim();

    this.dailyNote = editedNote.replace(/\r?\n/g, '<br/> ');
    this.itinerary['daily_note'][this.index]['note'] = editedNote;

    this.itineraryService.editItin(this.itinerary, 'edit').subscribe(
      result => {
        this.flashMessageService.handleFlashMessage("Note updated");
      })

    this.editing = false;
  }


  addNew(date)  {
    this.addNewEvent.emit(date);
  }
}
