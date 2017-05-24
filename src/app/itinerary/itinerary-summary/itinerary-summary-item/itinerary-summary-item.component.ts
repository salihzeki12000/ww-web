import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';

@Component({
  selector: 'ww-itinerary-summary-item',
  templateUrl: './itinerary-summary-item.component.html',
  styleUrls: ['./itinerary-summary-item.component.scss']
})
export class ItinerarySummaryItemComponent implements OnInit, AfterViewInit {
  @Input() date;
  @Input() index;
  @Input() events;
  @Output() showEventDetails = new EventEmitter();
  @Output() sectionPosition = new EventEmitter();

  constructor(private element: ElementRef) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    setTimeout(() =>  {
      this.sectionPosition.emit({ date: this.date, position: this.element.nativeElement.offsetTop })
    }, 1500)
  }

  showDetails(event)  {
      this.showEventDetails.emit(event);
  }
}
