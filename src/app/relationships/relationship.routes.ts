import { Routes } from "@angular/router";

import { FollowingsComponent }          from './followings/followings.component';
import { FollowersComponent }           from './followers/followers.component';
import { RequestedFollowingsComponent } from './requested-followings/requested-followings.component';
import { PendingFollowersComponent }    from './pending-followers/pending-followers.component';

export const RELATIONSHIP_ROUTES: Routes = [
  { path: '', redirectTo: 'followers', pathMatch: 'full' },
  { path: 'followers', component: FollowersComponent },
  { path: 'following', component: FollowingsComponent },
  { path: 'following-request', component: RequestedFollowingsComponent },
  { path: 'follow-request', component: PendingFollowersComponent },
]
