import { Component, OnInit, OnChanges, AfterViewInit, Input, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';

import { ItineraryService } from '../../itinerary.service';
import { FlashMessageService } from '../../../flash-message';

@Component({
  selector: 'ww-itinerary-summary-compressed',
  templateUrl: './itinerary-summary-compressed.component.html',
  styleUrls: ['./itinerary-summary-compressed.component.scss']
})
export class ItinerarySummaryCompressedComponent implements OnInit, OnChanges {
  @Input() date;
  @Input() index;
  @Input() events;
  @Input() itinerary;
  @Input() dailyNote;
  @Input() accomRange;

  @Output() showEventDetails = new EventEmitter();
  @Output() sectionPosition = new EventEmitter();
  @Output() addNewEvent = new EventEmitter();

  editing = false;
  accommodations = [""];
  
  constructor(
    private element: ElementRef,
    private flashMessageService: FlashMessageService,
    private itineraryService: ItineraryService) { }

  ngOnInit() {
    this.checkMeal();
    this.checkAccommodations();
  }

  ngOnChanges() {
    this.checkAccommodations();
  }

  ngAfterViewInit() {
    setTimeout(() =>  {
      this.sectionPosition.emit({ date: this.date, position: this.element.nativeElement.offsetTop })
    }, 1500)
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

  checkAccommodations() {
    for (let i = 0; i < this.accomRange.length; i++) {
      if(this.accomRange[i]['date'] === this.date)  {
        this.accommodations = this.accomRange[i]['accom'];
      }
    }
  }

  updateNote(editedNote: string)  {
    editedNote = editedNote.trim();

    this.dailyNote = editedNote.replace(/\r?\n/g, '<br/> ');
    this.itinerary['daily_note'][this.index]['note'] = editedNote;

    this.itineraryService.updateItinUser(this.itinerary).subscribe(
      result => {
        this.flashMessageService.handleFlashMessage("Note updated");
      })

    this.editing = false;
  }

  addNew(date)  {
    this.addNewEvent.emit(date);
  }
}
