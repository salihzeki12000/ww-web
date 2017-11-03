import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Rx';
import { Title }        from '@angular/platform-browser';

import { RelationshipService } from '../../relationships/relationship.service';
import { UserService }         from '../user.service';
import { LoadingService }      from '../../loading';

@Component({
  selector: 'ww-user-followers',
  templateUrl: './user-followers.component.html',
  styleUrls: ['./user-followers.component.scss']
})
export class UserFollowersComponent implements OnInit, OnDestroy {
  followers = [];
  filteredFollowers = [];
  followersSubscription: Subscription;

  currentUser;
  currentUserSubscription: Subscription;
  userSubscription: Subscription;

  constructor(
    private titleService: Title,
    private userService: UserService,
    private loadingService: LoadingService,
    private relationshipService: RelationshipService) { }

  ngOnInit() {
    this.followersSubscription = this.relationshipService.updateUserRelationships.subscribe(
      result => {
       this.followers = Object.keys(result['followers']).map(key => result['followers'][key]);

       this.filteredFollowers = this.followers;
       this.loadingService.setLoader(false, "");
      })

    this.userSubscription = this.userService.updateDisplayUser.subscribe(
      result => {
        this.titleService.setTitle(result['username'] + ' | Followers')
      })

    this.currentUserSubscription = this.userService.updateCurrentUser.subscribe(
      result => { this.currentUser = result; })
  }

  ngOnDestroy() {
    if(this.followersSubscription) this.followersSubscription.unsubscribe();
    if(this.currentUserSubscription) this.currentUserSubscription.unsubscribe();
  }

  filterSearch(text)  {
    if(!text)   {
      this.filteredFollowers = this.followers;
    } else  {
      this.filteredFollowers = Object.assign([], this.followers).filter(
        follower => follower.user.username.toLowerCase().indexOf(text.toLowerCase()) > -1
      )
    }
  }

}
