import { Component, OnInit, OnDestroy } from '@angular/core';
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
    private userService: UserService,
    private relationshipService: RelationshipService) { }

  ngOnInit() {
    this.followingsSubscription = this.relationshipService.updateUserRelationships.subscribe(
      result => {
       this.followings = Object.keys(result['followings']).map(key => result['followings'][key]);
      })

    this.currentUserSubscription = this.userService.updateCurrentUser.subscribe(
      result => { this.currentUser = result; })
  }

  ngOnDestroy() {
    if(this.followingsSubscription) this.followingsSubscription.unsubscribe();
    if(this.currentUserSubscription) this.currentUserSubscription.unsubscribe();
  }

}
