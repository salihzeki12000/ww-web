import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { PlaceService } from '../../places';

@Component({
  selector: 'ww-admin-places',
  templateUrl: './admin-places.component.html',
  styleUrls: ['./admin-places.component.scss']
})
export class AdminPlacesComponent implements OnInit {
  places;

  constructor(
    private router: Router,
    private placeService: PlaceService) { }

  ngOnInit() {
    this.placeService.getPlaces().subscribe(
      result => {
        this.places = result['places'];
        this.sortPlaces();
      }
    )
  }

  sortPlaces()  {
    for (let i = 0; i < this.places.length; i++) {
      if(!this.places[i]['city'])  {
        this.places[i]['city'] = {
          name: ""
        }
      }
    }
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
