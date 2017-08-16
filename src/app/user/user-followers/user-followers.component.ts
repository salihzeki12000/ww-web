import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Rx';

import { RelationshipService } from '../../relationships/relationship.service';
import { UserService }         from '../user.service';

@Component({
  selector: 'ww-user-followers',
  templateUrl: './user-followers.component.html',
  styleUrls: ['./user-followers.component.scss']
})
export class UserFollowersComponent implements OnInit, OnDestroy {
  followers = [];
  followersSubscription: Subscription;

  currentUser;
  currentUserSubscription: Subscription;

  constructor(
    private userService: UserService,
    private relationshipService: RelationshipService) { }

  ngOnInit() {
    this.followersSubscription = this.relationshipService.updateUserRelationships.subscribe(
      result => {
       this.followers = Object.keys(result['followers']).map(key => result['followers'][key]);
      })

    this.currentUserSubscription = this.userService.updateCurrentUser.subscribe(
      result => { this.currentUser = result; })
  }

  ngOnDestroy() {
    if(this.followersSubscription) this.followersSubscription.unsubscribe();
    if(this.currentUserSubscription) this.currentUserSubscription.unsubscribe();
  }

}
