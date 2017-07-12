import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

import { Itinerary } from '../../itinerary';
import { Resource } from '../../itinerary-resources/resource';

@Component({
  selector: 'ww-itinerary-print-category',
  templateUrl: './itinerary-print-category.component.html',
  styleUrls: ['./itinerary-print-category.component.scss']
})
export class ItineraryPrintCategoryComponent implements OnInit {
  @Input() itinerary;
  @Input() resources;
  @Input() transports = [];
  @Input() accommodations = [];
  @Input() activities = [];

  constructor(private router: Router) { }

  ngOnInit() {
  }

  save() {
    this.router.navigateByUrl('/print-category');
  }

}
