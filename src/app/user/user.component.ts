import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs/Rx';

import { UserService }         from './user.service';
import { PostService }         from '../post';
import { LoadingService }      from '../loading';
import { CheckInService }      from '../check-in';
import { RelationshipService } from '../relationships/relationship.service';

@Component({
  selector: 'ww-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit, OnDestroy {
  user;

  currentUser;
  currentUserSubscription: Subscription;

  relationships = [];
  followers = [];
  followings = [];
  relationshipsSubscription: Subscription;

  followStatus = '';// current user following display user?
  relationship;

  checkins = [];
  checkInSubscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private postService: PostService,
    private checkinService: CheckInService,
    private loadingService: LoadingService,
    private relationshipService: RelationshipService,
    private userService: UserService) { }

  ngOnInit() {
    this.userService.getCurrentUser().subscribe( data => {} );

    this.currentUserSubscription = this.userService.updateCurrentUser.subscribe(
      result => {
        this.currentUser = result;
        this.checkFollowStatus();
      }
    )

    this.route.params.forEach((params: Params) => {
      let id = params['id'];

      this.userService.getUser(id).subscribe(
        result => {
          this.user = result.user;
          this.loadingService.setLoader(false, "");
        })

      this.postService.getPosts(id).subscribe(result => {})

      this.checkinService.getCheckins(id).subscribe(result =>{
        this.checkins = result['checkins'];
      })

      this.relationshipService.getUserRelationships(id).subscribe(
        result => {
          this.relationshipsSubscription = this.relationshipService.updateUserRelationships.subscribe(
            result => {
              this.relationships = Object.keys(result['relationships']).map(key => result['relationships'][key])
              this.followers = Object.keys(result['followers']).map(key => result['followers'][key]);
              this.followings = Object.keys(result['followings']).map(key => result['followings'][key]);
              this.checkFollowStatus();
            }
          )
        })
    })
  }

  ngOnDestroy() {
    this.relationshipsSubscription.unsubscribe();
    this.currentUserSubscription.unsubscribe();
  }

  checkFollowStatus() {
    this.followStatus = '';
    if(this.currentUser !== undefined && this.relationships.length > 0)  {
      for (let i = 0; i < this.relationships.length; i++) {
        if(this.relationships[i]['user']['_id'] === this.currentUser['_id'])  {
          this.followStatus = this.relationships[i]['status'];
          this.relationship = this.relationships[i];
        }
      }
    }
  }

  follow()  {
    this.relationshipService.requestFollow({
      user: this.currentUser,
      following: this.user,
    }).subscribe( result => {} )

    this.followStatus = "requested"
  }

  unfollow()  {
    let status;

    if(this.followStatus === "accepted") {
      status = "following";
    } else if(this.followStatus === "requested") {
      status = "requestedFollowing"
    }

    this.relationshipService.deleteFollow(this.relationship, status)
        .subscribe( result => {} )
  }

}
