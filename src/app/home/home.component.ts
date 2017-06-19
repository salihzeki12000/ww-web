import { Component, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { Subscription } from 'rxjs/Rx';

import { Router } from '@angular/router';

import { AuthService }       from '../auth';
import { User, UserService } from '../user';
import { Post, PostService } from '../post';
import { LoadingService }    from '../loading';

@Component({
  selector: 'ww-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  user: User;
  feed: Post[] = [];
  newUser = false;

  currentUserSubscription: Subscription;
  feedSubscription: Subscription;

  showItineraryForm = false;

  constructor(
    private renderer: Renderer2,
    private authService: AuthService,
    private userService: UserService,
    private postService: PostService,
    private loadingService: LoadingService,
    private router: Router) { }

  ngOnInit() {
    let win = (window as any);
    if(win.location.search !== '?loaded' ) {
        win.location.search = '?loaded';
        win.location.reload();
    }
    
    this.currentUserSubscription = this.userService.updateCurrentUser
                                       .subscribe(
                                         result => {
                                           this.user = result;
                                           console.log(this.user);
                                         }
                                       )

    this.postService.getFeed()
        .subscribe(
          result  => {
            this.feedSubscription = this.postService.updateFeed
                                        .subscribe(
                                          feedResult => {
                                            this.feed = Object.keys(feedResult).map(key => feedResult[key]);
                                          })
          })

    this.newUser = this.authService.newUser;
    setTimeout(() =>  {
      this.loadingService.setLoader(false, "");
    }, 500)
    console.log("home set false")
    this.renderer.removeClass(document.body, 'prevent-scroll');
  }

  ngOnDestroy() {
    this.feedSubscription.unsubscribe();
    this.currentUserSubscription.unsubscribe();
    this.loadingService.setLoader(true, "");
  }

  createItinerary() {
    this.showItineraryForm = true;
    this.renderer.addClass(document.body, 'prevent-scroll');
  }

  hideItineraryForm(hide) {
    this.showItineraryForm = false;
    this.renderer.removeClass(document.body, 'prevent-scroll');
  }

  routeToItin(id) {
    this.router.navigateByUrl('/me/itinerary/' + id);
  }

}
