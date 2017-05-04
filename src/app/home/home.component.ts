import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Rx';

import { Router } from '@angular/router';

import { User, UserService } from '../user';
import { Post, PostService } from '../post';
@Component({
  selector: 'ww-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  user: User;
  feed: Post[] = [];

  feedSubscription: Subscription;

  constructor(
    private userService: UserService,
    private postService: PostService,
    private router: Router) { }

  ngOnInit() {
    this.userService.getCurrentUserDetails()
        .subscribe(
          result => {
            this.user = result;
          }
        )

    this.postService.getFeed()
        .subscribe(
          result  => {
            this.feedSubscription = this.postService.updateFeed
                                        .subscribe(
                                          feedResult => {
                                            this.feed = Object.keys(feedResult).map(key => feedResult[key]);
                                          }
                                        )
          }
        )
  }

  routeToItin(id) {
    this.router.navigateByUrl('/me/itinerary/' + id);
  }

}
