import { Routes } from "@angular/router";

import { ItineraryAllComponent }      from './itinerary-all/itinerary-all.component';
import { ItineraryCompletedComponent }     from './itinerary-completed/itinerary-completed.component';
import { ItineraryUpcomingComponent } from './itinerary-upcoming/itinerary-upcoming.component';

export const ITINERARY_LIST_ROUTES: Routes = [
  { path: '', redirectTo: 'all', pathMatch: 'full' },
  { path: 'all', component: ItineraryAllComponent },
  { path: 'completed', component: ItineraryCompletedComponent },
  { path: 'upcoming', component: ItineraryUpcomingComponent },
]
