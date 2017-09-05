import { Routes } from "@angular/router";

import { UserPostsComponent }            from './user-posts/user-posts.component';
import { UserFollowingsComponent }       from './user-followings/user-followings.component';
import { UserFollowersComponent }        from './user-followers/user-followers.component';
import { UserItinerariesComponent }      from './user-itineraries/user-itineraries.component';
import { UserFavouriteComponent }        from './user-favourite/user-favourite.component';
import { UserItinerarySummaryComponent } from './user-itinerary-summary/user-itinerary-summary.component';

export const USER_ROUTES: Routes = [
  { path: '', component: UserPostsComponent },
  { path: 'followers', component: UserFollowersComponent },
  { path: 'followings', component: UserFollowingsComponent },
  { path: 'itineraries', component: UserItinerariesComponent },
  { path: 'itinerary/:id', component: UserItinerarySummaryComponent },
  { path: 'favourite', component: UserFavouriteComponent },
]
