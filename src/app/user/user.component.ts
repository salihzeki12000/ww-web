import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs/Rx';
import { Title }        from '@angular/platform-browser';

import { UserService }         from './user.service';
import { PostService }         from '../post';
import { LoadingService }      from '../loading';
import { FavouriteService }    from '../favourite';
import { RelationshipService } from '../relationships/relationship.service';
import { FlashMessageService } from '../flash-message';

@Component({
  selector: 'ww-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit, OnDestroy {
  user;

  currentUser;
  currentUserSubscription: Subscription;

  itineraries = [];
  relationships = [];
  followers = [];
  followings = [];
  relationshipsSubscription: Subscription;

  followStatus = '';// current user following display user?
  relationship;

  favs = [];

  constructor(
    private titleService: Title,
    private route: ActivatedRoute,
    private router: Router,
    private postService: PostService,
    private favouriteService: FavouriteService,
    private loadingService: LoadingService,
    private flashMessageService: FlashMessageService,
    private relationshipService: RelationshipService,
    private userService: UserService) { }

  ngOnInit() {
    this.itineraries = [];
    this.relationships = [];
    this.followers = [];
    this.followings = [];
    this.favs = [];

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

          let title = this.user['username'] + " | Home"
          this.titleService.setTitle(title);

          this.itineraries = Object.keys(this.user['itineraries']).map(key => this.user['itineraries'][key]);
          this.sortItin();

          this.loadingService.setLoader(false, "");
        })

      this.postService.getPosts(id).subscribe(result => {})

      this.favouriteService.getFavs(id).subscribe(result =>{
        this.filterFav(result['favourites'])
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
    if(this.relationshipsSubscription) this.relationshipsSubscription.unsubscribe();
    if(this.currentUserSubscription) this.currentUserSubscription.unsubscribe();
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

  sortItin()  {
    this.itineraries.sort((a,b)  =>  {
      return new Date(b['date_to']).getTime() - new Date(a['date_to']).getTime();
    })

    for (let i = 0; i < this.itineraries.length; i++) {
      if(this.itineraries[i]['private'])  {
        this.itineraries.splice(i,1);
        i--;
      } else if(this.itineraries[i]['corporate']['status'] && !this.itineraries[i]['corporate']['publish']) {
        this.itineraries.splice(i,1);
        i--;
      }
    }
  }

  filterFav(favs) {
    for (let i = 0; i < favs.length; i++) {
      if(favs[i]['private'])  {
        favs.splice(i,1);
        i--
      };
    }

    this.favs = favs;
  }

  follow()  {
    let following = {
      user: this.currentUser,
      following: this.user
    }

    let message = "You are now following " + this.user['username'];

    if(this.user['private'])  {
      this.relationshipService.requestFollow(following).subscribe(
        result => {} )

      this.followStatus = "requested";
    } else  {
      this.relationshipService.createFollow(following).subscribe(
        result => {
          this.flashMessageService.handleFlashMessage(message);
        } )

      this.followStatus = "accepted";
    }
  }

  unfollow()  {
    this.loadingService.setLoader(true, "Unfollowing user...");

    let status;

    if(this.followStatus === "accepted") {
      status = "following";
    } else if(this.followStatus === "requested") {
      status = "requestedFollowing"
    }

    this.relationshipService.deleteFollow(this.relationship, status).subscribe(
      result => {
        this.followStatus = "";
        this.loadingService.setLoader(false, "");
      })
  }

  routeToProfile()  {
    this.router.navigateByUrl('/wondererwanderer/' + this.user['_id']);
    this.loadingService.setLoader(true, "");
  }


}
