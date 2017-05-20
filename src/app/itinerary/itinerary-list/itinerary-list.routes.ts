import { Routes } from "@angular/router";

import { ItineraryAllComponent }      from './itinerary-all/itinerary-all.component';
import { ItineraryPastComponent }     from './itinerary-past/itinerary-past.component';
import { ItineraryUpcomingComponent } from './itinerary-upcoming/itinerary-upcoming.component';

export const ITINERARY_LIST_ROUTES: Routes = [
  { path: '', redirectTo: 'all', pathMatch: 'full' },
  { path: 'all', component: ItineraryAllComponent },
  { path: 'past', component: ItineraryPastComponent },
  { path: 'upcoming', component: ItineraryUpcomingComponent },
]
