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

  sortNameA()  {
    this.places.sort((a,b)  =>  {
      if(a['name'] < b['name']) return -1;
      if(a['name'] > b['name']) return 1;
      return 0;
    })
  }

  sortNameD()  {
    this.places.sort((a,b)  =>  {
      if(a['name'] < b['name']) return 1;
      if(a['name'] > b['name']) return -1;
      return 0;
    })
  }

  sortCityA()  {
    this.places.sort((a,b)  =>  {
      if(a['city']['name'] < b['city']['name']) return -1;
      if(a['city']['name'] > b['city']['name']) return 1;
      return 0;
    })
  }

  sortCityD()  {
    this.places.sort((a,b)  =>  {
      if(a['city']['name'] < b['city']['name']) return 1;
      if(a['city']['name'] > b['city']['name']) return -1;
      return 0;
    })
  }

  sortCountryA()  {
    this.places.sort((a,b)  =>  {
      if(a['country']['name'] < b['country']['name']) return -1;
      if(a['country']['name'] > b['country']['name']) return 1;
      return 0;
    })
  }

  sortCountryD()  {
    this.places.sort((a,b)  =>  {
      if(a['country']['name'] < b['country']['name']) return 1;
      if(a['country']['name'] > b['country']['name']) return -1;
      return 0;
    })
  }

  routeToPlace(place) {
    this.router.navigateByUrl('admin/place/' + place["_id"]);
  }

}
