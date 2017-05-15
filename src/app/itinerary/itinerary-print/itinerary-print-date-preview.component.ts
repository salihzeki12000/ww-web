import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ItineraryService } from '../itinerary.service';

@Component({
  selector: 'ww-itinerary-print-preview',
  template: `
    <button type="button" class="primaryButton"(click)="back()" style="margin:10px 340px">Back to itinerary</button>
    <div style="width: 800px">
      <ww-itinerary-print-date></ww-itinerary-print-date>
    </div>
  `,
})
export class ItineraryPrintDatePreviewComponent implements OnInit {
  // itineraryId;

  constructor(
    private itineraryService: ItineraryService,
    private router: Router
  ) {}

  ngOnInit()  {
    // setTimeout(() =>  {
    //   window.print();
    // }, 1500)
    //
    // this.itineraryId = this.itineraryService.itineraryId;
  }

  back()  {
    // this.router.navigateByUrl('/me/itinerary/' + this.itineraryId);
  }
}
