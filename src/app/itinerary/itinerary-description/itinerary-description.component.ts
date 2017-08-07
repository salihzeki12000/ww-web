import { Component, OnInit } from '@angular/core';

import { LoadingService }        from '../../loading';

@Component({
  selector: 'ww-itinerary-description',
  templateUrl: './itinerary-description.component.html',
  styleUrls: ['./itinerary-description.component.scss']
})
export class ItineraryDescriptionComponent implements OnInit {

  constructor(
    private loadingService: LoadingService,
  ) { }

  ngOnInit() {
    this.loadingService.setLoader(false, "");
  }

}
