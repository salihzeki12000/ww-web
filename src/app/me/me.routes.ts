import { Routes } from "@angular/router";

import { PostsComponent } from '../post';
import { ProfileComponent } from '../user';
import { ItineraryComponent, ITINERARY_ROUTES } from '../itinerary';

export const HOME_ROUTES: Routes = [
  { path: '', component: PostsComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'itinerary/:id', component: ItineraryComponent, children: ITINERARY_ROUTES }
]
