import { Component, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
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
  newItinerary = true;
  curated = false;
  follow = false;


  currentUserSubscription: Subscription;
  feedSubscription: Subscription;

  showItineraryForm = false;

  descriptionForm: FormGroup;
  addDescription = false;

  constructor(
    private titleService: Title,
    private renderer: Renderer2,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private relationshipService: RelationshipService,
    private loadingService: LoadingService,
    private favouriteService: FavouriteService,
    private router: Router) {
      this.descriptionForm = this.formBuilder.group({
        'description': ''
      })
    }

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

  end()  {
    this.newUser = false;
    this.preventScroll(false);
    this.updateUser();
  }

  getCurated()  {
    this.newItinerary = false;
    this.curated = true;
  }

  getFollow() {
    this.curated = false;
    this.follow = true;
  }

  // add description

  getDescription()  {
    this.addDescription = true;
    this.preventScroll(true);
  }

  cancelDescription() {
    this.addDescription = false;
    this.descriptionForm.reset();
    this.preventScroll(false);
  }

  saveDescription(text) {
    this.user['description'] = this.descriptionForm.value.description;

    this.userService.editUser(this.user).subscribe(
      result =>{})

    this.cancelDescription();
  }

  // itinerary related

  createItinerary() {
    this.showItineraryForm = true;
    this.preventScroll(true);
  }

  hideItineraryForm(hide) {
    this.showItineraryForm = false;
    this.preventScroll(false);
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
