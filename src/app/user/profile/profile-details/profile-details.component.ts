import { Component, OnInit, Renderer } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs/Rx';

import { Router } from '@angular/router';

import { User }                from '../../user';
import { UserService }         from '../../user.service';
import { RelationshipService } from '../../relationships/relationship.service';
import { FlashMessageService } from '../../../flash-message';
import { Post, PostService }   from '../../../post';

@Component({
  selector: 'ww-profile-details',
  templateUrl: './profile-details.component.html',
  styleUrls: ['./profile-details.component.scss']
})
export class ProfileDetailsComponent implements OnInit {
  user: User;

  posts: Post[] = [];
  postsSubscription: Subscription;

  relationshipSubscription: Subscription;
  followings = [];
  followers = [];

  showItineraryForm = false;

  constructor(
    private renderer: Renderer,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private postService: PostService,
    private relationshipService: RelationshipService,
    private flashMessageService: FlashMessageService,
    private router: Router) {}

  ngOnInit() {
    this.userService.getCurrentUserDetails()
        .subscribe(
          data => {
            this.user = data;
          }
        )

    this.postService.getPosts()
        .subscribe(
          result => {
            this.postsSubscription = this.postService.updatePost
                                         .subscribe(
                                           result =>  {
                                             this.posts = Object.keys(result).map(key => result[key]);
                                           }
                                         )
          }
        )

    this.relationshipSubscription = this.relationshipService.updateRelationships
                                     .subscribe(
                                       result => {
                                         this.followers = Object.keys(result['followers']).map(key => result['followers'][key]);;
                                         this.followings = Object.keys(result['followings']).map(key => result['followings'][key]);;
                                       }
                                     )

  }

  onDelete()  {
    // this.userService.deleteUser()
    //     .subscribe(
    //       data => {
    //         console.log(data);
    //         this.router.navigateByUrl('/');
    //     });
  }

  createItinerary() {
    this.showItineraryForm = true;
    this.renderer.setElementClass(document.body, 'prevent-scroll', true);
  }

  hideItineraryForm(hide) {
    this.showItineraryForm = false;
    this.renderer.setElementClass(document.body, 'prevent-scroll', false);
  }

  routeToItin(id) {
    this.router.navigateByUrl('/me/itinerary/' + id);
  }

  viewProfile()  {
    this.router.navigateByUrl('/me/profile-edit');
  }

  routeToFollowers() {
    this.router.navigateByUrl('/me/relationships/followers');
  }

  routeToFollowings() {
    this.router.navigateByUrl('/me/relationships/following');
  }

}
