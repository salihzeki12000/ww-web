import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';

import { ItineraryService } from '../../itinerary.service';

@Component({
  selector: 'ww-itinerary-summary-item',
  templateUrl: './itinerary-summary-item.component.html',
  styleUrls: ['./itinerary-summary-item.component.scss']
})
export class ItinerarySummaryItemComponent implements OnInit, AfterViewInit {
  @Input() date;
  @Input() index;
  @Input() events;
  @Input() currentItinerary;
  @Output() showEventDetails = new EventEmitter();
  @Output() sectionPosition = new EventEmitter();

  dailyNote;
  editing = false;
  uniqueClass;

  constructor(
    private element: ElementRef,
    private itineraryService: ItineraryService) { }

  ngOnInit() {
    this.dailyNote = this.currentItinerary['daily_note'][this.index]['note'].replace(/\r?\n/g, '<br/> ');

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
    this.currentItinerary['daily_note'][this.index]['note'] = editedNote;

    this.itineraryService.editItin(this.currentItinerary, 'edit').subscribe(
      result => {}
    )

    this.editing = false;
  }
}
