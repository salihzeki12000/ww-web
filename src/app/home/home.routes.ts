import { Routes } from "@angular/router";

import { ItineraryAllComponent, ItineraryCuratedComponent, ItineraryFollowingComponent, ItinerarySavedComponent }  from '../itinerary';

export const HOME_ROUTES: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: ItineraryAllComponent },
  { path: 'curated', component: ItineraryCuratedComponent },
  { path: 'following', component: ItineraryFollowingComponent },
  { path: 'saved', component: ItinerarySavedComponent },
]
