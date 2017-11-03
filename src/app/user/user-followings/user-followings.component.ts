import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Rx';
import { Title }        from '@angular/platform-browser';

import { RelationshipService } from '../../relationships/relationship.service';
import { UserService }         from '../user.service';
import { LoadingService }      from '../../loading';

@Component({
  selector: 'ww-user-followings',
  templateUrl: './user-followings.component.html',
  styleUrls: ['./user-followings.component.scss']
})
export class UserFollowingsComponent implements OnInit, OnDestroy {
  followings = [];
  filteredFollowings = [];
  followingsSubscription: Subscription;

  currentUser;
  currentUserSubscription: Subscription;
  userSubscription: Subscription;

  constructor(
    private titleService: Title,
    private userService: UserService,
    private loadingService: LoadingService,
    private relationshipService: RelationshipService) { }

  ngOnInit() {
    this.followingsSubscription = this.relationshipService.updateUserRelationships.subscribe(
      result => {
       this.followings = Object.keys(result['followings']).map(key => result['followings'][key]);

       this.filteredFollowings = this.followings;

       this.loadingService.setLoader(false, "");
      })

    this.userSubscription = this.userService.updateDisplayUser.subscribe(
      result => {
        this.titleService.setTitle(result['username'] + ' | Followings')
      })

    this.currentUserSubscription = this.userService.updateCurrentUser.subscribe(
      result => { this.currentUser = result; })
  }

  ngOnDestroy() {
    if(this.followingsSubscription) this.followingsSubscription.unsubscribe();
    if(this.currentUserSubscription) this.currentUserSubscription.unsubscribe();
  }

  filterSearch(text)  {
    if(!text)   {
      this.filteredFollowings = this.followings;
    } else  {
      this.filteredFollowings = Object.assign([], this.followings).filter(
        following => following.following.username.toLowerCase().indexOf(text.toLowerCase()) > -1
      )
    }
  }

}
