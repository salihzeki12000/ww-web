import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { PlaceService } from './place.service';

@Component({
  selector: 'ww-places',
  templateUrl: './places.component.html',
  styleUrls: ['./places.component.scss']
})
export class PlacesComponent implements OnInit {
  places;

  constructor(
    private router: Router,
    private placeService: PlaceService) { }

  ngOnInit() {
    this.placeService.getPlaces().subscribe(
      result => { this.places = result['places'] }
    )
  }

  routeToPlace(place) {
    this.router.navigateByUrl('admin/place/' + place["_id"]);
  }

}
