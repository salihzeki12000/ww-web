import { Component, OnInit, OnDestroy, Renderer2, ElementRef, HostListener } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';

import { Subscription } from 'rxjs/Rx';
import { Title }        from '@angular/platform-browser';
import { Router }       from '@angular/router';

import { User }                from '../../user';
import { UserService }         from '../../user.service';
import { RelationshipService } from '../../../relationships/relationship.service';
import { FlashMessageService } from '../../../flash-message';
import { Post, PostService }   from '../../../post';
import { LoadingService }      from '../../../loading';
import { FavouriteService }      from '../../../favourite';

@Component({
  selector: 'ww-profile-details',
  templateUrl: './profile-details.component.html',
  styleUrls: ['./profile-details.component.scss']
})
export class ProfileDetailsComponent implements OnInit, OnDestroy {
  currentUser;
  currentUserSubscription: Subscription;

  posts = [];
  postsSubscription: Subscription;

  relationshipSubscription: Subscription;
  followings = [];
  followers = [];

  favs = [];
  favSubscription: Subscription;

  showItineraryForm = false;
  fixed = false;

  constructor(
    private titleService: Title,
    private element: ElementRef,
    private renderer: Renderer2,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private postService: PostService,
    private favouriteService: FavouriteService,
    private relationshipService: RelationshipService,
    private flashMessageService: FlashMessageService,
    private loadingService: LoadingService,
    private router: Router) {}

  ngOnInit() {
    this.titleService.setTitle("Profile");

    this.currentUserSubscription = this.userService.updateCurrentUser.subscribe(
     result => {
       this.currentUser = result;
       this.getPosts(this.currentUser['_id']);
       this.favouriteService.getFavs(this.currentUser['_id']).subscribe(result =>{})
     })

    this.relationshipSubscription = this.relationshipService.updateRelationships.subscribe(
     result => {
       this.followers = Object.keys(result['followers']).map(key => result['followers'][key]);
       this.followings = Object.keys(result['followings']).map(key => result['followings'][key]);
     })

    this.favSubscription = this.favouriteService.updateFavs.subscribe(
      result => {
        this.favs = Object.keys(result).map(key => result[key]);
        this.loadingService.setLoader(false, "");
      })

    this.renderer.removeClass(document.body, 'prevent-scroll');
  }

  @HostListener('window:scroll', ['$event'])
  checkScroll(event) {
    let offset = this.element.nativeElement.offsetParent.scrollTop;
    if(offset > 165)  {
      this.fixed = true;
    } else  {
      this.fixed = false;
    }
  }

  ngOnDestroy() {
    if(this.relationshipSubscription) this.relationshipSubscription.unsubscribe();
    if(this.postsSubscription) this.postsSubscription.unsubscribe();
    if(this.currentUserSubscription) this.currentUserSubscription.unsubscribe();
    if(this.favSubscription) this.favSubscription.unsubscribe();

    this.loadingService.setLoader(true, "");
  }

  getPosts(userId)  {
    this.postService.getPosts(userId).subscribe(
      result => {
        this.postsSubscription = this.postService.updatePost.subscribe(
          result =>  {
            this.posts = Object.keys(result).map(key => result[key]);
          })
      })
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
    this.renderer.addClass(document.body, 'prevent-scroll');
  }

  hideItineraryForm(hide) {
    this.showItineraryForm = false;
    this.renderer.removeClass(document.body, 'prevent-scroll');
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
