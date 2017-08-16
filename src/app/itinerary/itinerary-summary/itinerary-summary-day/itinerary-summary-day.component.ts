import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';

import { ItineraryService } from '../../itinerary.service';

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

  editing = false;
  uniqueClass;

  constructor(
    private element: ElementRef,
    private itineraryService: ItineraryService) { }

  ngOnInit() {
    this.uniqueClass = "daily-note-" + this.index;
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

  updateNote(editedNote: string)  {
    editedNote = editedNote.trim();

    this.dailyNote = editedNote.replace(/\r?\n/g, '<br/> ');
    this.itinerary['daily_note'][this.index]['note'] = editedNote;

    this.itineraryService.editItin(this.itinerary, 'edit').subscribe(
      result => {}
    )

    this.editing = false;
  }
}
