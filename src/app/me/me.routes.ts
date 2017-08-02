import { Routes } from "@angular/router";

import { HomeComponent }    from '../home';
import { CheckInComponent } from '../check-in'
import { ProfileComponent, ProfileEditComponent }      from '../user';
import { RelationshipsComponent, RELATIONSHIP_ROUTES } from '../relationships';
import { ItineraryComponent, ItineraryListComponent, ITINERARY_ROUTES, ITINERARY_LIST_ROUTES } from '../itinerary';
import { NotificationsComponent }   from '../notifications';
import { PostDisplayComponent }     from '../post';
import { RecommendationComponent }  from '../recommendations';

export const HOME_ROUTES: Routes = [
  { path: '', component: HomeComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'profile-edit', component: ProfileEditComponent },
  { path: 'relationships', component: RelationshipsComponent, children: RELATIONSHIP_ROUTES },
  { path: 'itinerary', component: ItineraryListComponent, children: ITINERARY_LIST_ROUTES },
  { path: 'itinerary/:id', component: ItineraryComponent, children: ITINERARY_ROUTES },
  { path: 'notifications', component: NotificationsComponent },
  { path: 'post/:id', component: PostDisplayComponent},
  { path: 'check-in', component: CheckInComponent},
  { path: 'recommendation/:id', component: RecommendationComponent },
]
