import { Routes } from "@angular/router";

import { ItineraryAllComponent }       from './itinerary-all/itinerary-all.component';
import { ItineraryCuratedComponent }   from './itinerary-curated/itinerary-curated.component';
import { ItinerarySavedComponent }     from './itinerary-saved/itinerary-saved.component';
import { ItineraryFollowingComponent } from './itinerary-following/itinerary-following.component';

export const ITINERARY_LIST_ROUTES: Routes = [
  { path: '', redirectTo: 'all', pathMatch: 'full' },
  { path: 'all', component: ItineraryAllComponent },
  { path: 'curated', component: ItineraryCuratedComponent },
  { path: 'saved', component: ItinerarySavedComponent },
  { path: 'following', component: ItineraryFollowingComponent },
]
