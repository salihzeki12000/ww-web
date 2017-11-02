import { Routes } from "@angular/router";

import { HomeComponent, HOME_ROUTES }    from '../home';
import { FavouriteComponent } from '../favourite'
import { NotificationsComponent }   from '../notifications';
import { PostDisplayComponent }     from '../post';
import { ProfileComponent, ProfileEditComponent }      from '../user';
import { RelationshipsComponent, RELATIONSHIP_ROUTES } from '../relationships';
import { RecommendationDisplayComponent, RecommendationsComponent }  from '../recommendations';
import { ItineraryComponent, ItineraryListComponent, ITINERARY_ROUTES, ITINERARY_LIST_ROUTES } from '../itinerary';

export const ME_ROUTES: Routes = [
  { path: '', component: HomeComponent, children: HOME_ROUTES },
  // { path: 'profile', component: ProfileComponent },
  { path: 'profile-edit', component: ProfileEditComponent },
  { path: 'relationships', component: RelationshipsComponent, children: RELATIONSHIP_ROUTES },
  { path: 'itinerary', component: ItineraryListComponent, children: ITINERARY_LIST_ROUTES },
  { path: 'itinerary/:id', component: ItineraryComponent, children: ITINERARY_ROUTES },
  { path: 'notifications', component: NotificationsComponent },
  // { path: 'post/:id', component: PostDisplayComponent},
  { path: 'favourite', component: FavouriteComponent},
  // { path: 'recommendations', component: RecommendationsComponent },
  // { path: 'recommendation/:id', component: RecommendationDisplayComponent },
]
