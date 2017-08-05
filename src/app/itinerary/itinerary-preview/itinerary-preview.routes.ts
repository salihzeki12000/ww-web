import { Routes } from "@angular/router";

import { ItineraryComponent } from '../itinerary.component';
import { ITINERARY_ROUTES }   from '../itinerary.routes'

export const PREVIEW_ROUTES: Routes = [
  { path: 'itinerary/:id', component: ItineraryComponent, children: ITINERARY_ROUTES },
]
