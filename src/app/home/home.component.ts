import { Component, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { Title }        from '@angular/platform-browser';
import { Subscription } from 'rxjs/Rx';

import { Router } from '@angular/router';

import { User, UserService } from '../user';
import { Post, PostService } from '../post';
import { LoadingService }    from '../loading';

@Component({
  selector: 'ww-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  user;
  feed = [];

  verifyMsg = false;

  newUser = false;
  tourStart = false;
  tour1 = false;
  tour2 = false;
  tour3 = false;

  currentUserSubscription: Subscription;
  feedSubscription: Subscription;

  showItineraryForm = false;

  constructor(
    private titleService: Title,
    private renderer: Renderer2,
    private userService: UserService,
    private postService: PostService,
    private loadingService: LoadingService,
    private router: Router) { }

  ngOnInit() {
    this.loadingService.setLoader(true, "");
    this.titleService.setTitle("Home");

    this.currentUserSubscription = this.userService.updateCurrentUser.subscribe(
      result => {
        this.user = result;

        if(!this.user['new_user_tour'])  {
          this.newUser = true;
          this.verifyMsg = true;
          this.tourStart = true;
        }
      })

    this.postService.getFeed().subscribe(
      result  => {
        this.feedSubscription = this.postService.updateFeed.subscribe(
          feedResult => {
            this.feed = Object.keys(feedResult).map(key => feedResult[key]);
            this.loadingService.setLoader(false, "");
          })
      })


    this.renderer.removeClass(document.body, 'prevent-scroll');

    // work around for issue where fb login cant load page properly
    // let login = this.authService.loginType;
    //
    // if(login === 'facebook')  {
    //   this.authService.setLogin("fb");
    //   this.reload();
    // }
  }

  // reload()  {
  //   setTimeout(() =>  {
  //     window.location.reload();
  //   },1000)
  // }

  ngOnDestroy() {
    this.user['new_user_tour'] = true;
    this.userService.editUser(this.user).subscribe(result =>{})

    if(this.feedSubscription) this.feedSubscription.unsubscribe();
    if(this.currentUserSubscription) this.currentUserSubscription.unsubscribe();

    this.loadingService.setLoader(true, "");
  }



  // tour related

  skipTour()  {
    this.newUser = false;
  }

  startTour() {
    this.tourStart = false;
    this.tour1 = true;
  }

  tour1Done() {
    this.tour1 = false;
    this.tour2 = true;
  }

  tour2Done() {
    this.tour2 = false;
    this.tour3 = true;
  }

  backToStart() {
    this.tourStart = true;
    this.tour1 = false;
  }

  backTo1() {
    this.tour1 = true;
    this.tour2 = false;
  }

  backTo2() {
    this.tour2 = true;
    this.tour3 = false;
  }




  // itinerary related

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
