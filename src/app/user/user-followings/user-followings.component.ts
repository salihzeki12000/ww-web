import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Rx';

import { RelationshipService } from '../../relationships/relationship.service';
import { UserService }         from '../user.service';

@Component({
  selector: 'ww-user-followings',
  templateUrl: './user-followings.component.html',
  styleUrls: ['./user-followings.component.scss']
})
export class UserFollowingsComponent implements OnInit, OnDestroy {
  followings = [];
  followingsSubscription: Subscription;

  currentUser;
  currentUserSubscription: Subscription;

  constructor(
    private router: Router,
    private userService: UserService,
    private relationshipService: RelationshipService) { }

  ngOnInit() {
    this.followingsSubscription = this.relationshipService.updateUserRelationships.subscribe(
      result => {
       this.followings = Object.keys(result['followings']).map(key => result['followings'][key]);
      }
    )

    this.currentUserSubscription = this.userService.updateCurrentUser.subscribe(
      result => {
        this.currentUser = result;
      }
    )
  }

  ngOnDestroy() {
    this.followingsSubscription.unsubscribe();
  }

  routeToUser(id) {
    if(id === this.currentUser['_id']) {
      this.router.navigateByUrl('/me/profile');
    } else  {
      this.router.navigateByUrl('/wondererwanderer/' + id)
    }
  }

}
