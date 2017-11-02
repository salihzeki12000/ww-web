import { Component, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { Title }        from '@angular/platform-browser';
import { Subscription } from 'rxjs/Rx';

import { Router } from '@angular/router';

import { User, UserService }    from '../user';
import { LoadingService }       from '../loading';
import { RelationshipService }  from '../relationships';
import { FavouriteService }     from '../favourite';

@Component({
  selector: 'ww-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  user;

  relationshipSubscription: Subscription;
  followings = [];
  followers = [];

  favSubscription: Subscription;
  favs = [];

  verifyMsg = false;

  newUser = false;
  tourStart = false;

  tourHome = false; //home page
  tour1 = false;
  tour2 = false;
  tour3 = false;
  tour4 = false;
  index = 0;

  tourNav = false;

  currentUserSubscription: Subscription;
  feedSubscription: Subscription;

  showItineraryForm = false;

  constructor(
    private titleService: Title,
    private renderer: Renderer2,
    private userService: UserService,
    private relationshipService: RelationshipService,
    private loadingService: LoadingService,
    private favouriteService: FavouriteService,
    private router: Router) { }

  ngOnInit() {
    this.loadingService.setLoader(true, "");
    this.titleService.setTitle("Home");

    this.currentUserSubscription = this.userService.updateCurrentUser.subscribe(
      result => {
        this.user = result;

        this.favouriteService.getFavs(this.user['_id']).subscribe(result =>{})


        if(!this.user['new_user_tour'])  {
          this.newUser = true;
          this.verifyMsg = true;
          this.tourStart = true;
          this.preventScroll(true);
        } else  {
          this.preventScroll(false);
        }
      })

    this.relationshipSubscription = this.relationshipService.updateRelationships.subscribe(
      result => {
        this.followers = Object.keys(result['followers']).map(key => result['followers'][key]);
        this.followings = Object.keys(result['followings']).map(key => result['followings'][key]);
      })

    this.favSubscription = this.favouriteService.updateFavs.subscribe(
      result => {
        this.favs = Object.keys(result).map(key => result[key]);
      })

    this.loadingService.setLoader(false, "");

  }


  ngOnDestroy() {
    if(!this.user['new_user_tour']) {
      this.updateUser();
    }

    if(this.currentUserSubscription) this.currentUserSubscription.unsubscribe();

    this.loadingService.setLoader(true, "");
  }


  // tour related

  updateUser()  {
    this.user['new_user_tour'] = true;
    this.userService.editUser(this.user).subscribe(result =>{})
  }

  skipTour()  {
    this.newUser = false;
    this.updateUser();
  }

  startTour() {
    this.tourStart = false;

    this.tourHome = true;
    this.tour1 = true;
    this.index = 1;
  }

  next()  {
    this.index += 1;

    if(this.index === 2) {
      this.tour2 = true;
    } else if(this.index === 3)  {
      this.tour3 = true;
    } else if(this.index === 4) {
      this.tour4 = true;
    } else if(this.index === 5) {
      this.tourHome = false;
      this.tour1 = false;
      this.tour2 = false;
      this.tour3 = false;
      this.tour4 = false;

      this.tourNav = true;
    }
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

  routeToPreview(id) {
    this.router.navigateByUrl('/preview/itinerary/' + id);
  }


  // others
  preventScroll(value)  {
    if(value) {
      this.renderer.addClass(document.body, 'prevent-scroll');
    } else  {
      this.renderer.removeClass(document.body, 'prevent-scroll');
    }
  }
}
