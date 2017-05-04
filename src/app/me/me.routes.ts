import { Routes } from "@angular/router";

import { HomeComponent } from '../home';
import { ProfileComponent, ProfileEditComponent, RelationshipsComponent, RELATIONSHIP_ROUTES } from '../user';
import { ItineraryComponent, ITINERARY_ROUTES } from '../itinerary';
import { NotificationsComponent } from '../notifications';

export const HOME_ROUTES: Routes = [
  { path: '', component: HomeComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'profile-edit', component: ProfileEditComponent },
  { path: 'relationships', component: RelationshipsComponent, children: RELATIONSHIP_ROUTES },
  { path: 'itinerary/:id', component: ItineraryComponent, children: ITINERARY_ROUTES },
  { path: 'notifications', component: NotificationsComponent }
]
