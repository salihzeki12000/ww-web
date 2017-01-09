import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from "rxjs/Rx";

import { Itinerary } from './itinerary';
import { ItineraryService } from './itinerary.service';

Injectable()
export class ItineraryResolver implements Resolve<Itinerary> {

  constructor(private itineraryService: ItineraryService) {}

  resolve(route: ActivatedRouteSnapshot) {
    console.log(route);
    return this.itineraryService.getItin(route.params['id']);
  }
}
