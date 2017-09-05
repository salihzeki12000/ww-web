import { Component, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs/Rx';

import { User, UserService }                       from '../../user';
import { RelationshipService }                     from '../../relationships';
import { ItineraryService, ItineraryEventService } from '../../itinerary';
import { AuthService }                             from '../../auth';
import { LoadingService }                          from '../../loading';
import { NotificationService }                     from '../../notifications';
import { FlashMessageService }                     from '../../flash-message';

@Component({
  selector: 'ww-main-navigation',
  templateUrl: './main-navigation.component.html',
  styleUrls: ['./main-navigation.component.scss']
})
export class MainNavigationComponent implements OnInit, OnDestroy {
  isLoggedIn = false;

  currentUserSubscription: Subscription;
  currentUser;

  relationshipSubscription: Subscription;
  socialRelationships = [];
  followings = [];
  followers = [];
  pendingFollowers = [];
  requestedFollowings = [];

  notificationSubscription: Subscription;
  notifications = [];

  showItineraryForm = false;
  fav = false;

  // auth
  showSignin = false;
  showSignup = false;
  reload = false;

  // top nav
  authOptions = false;
  bookmarkOptions = false;
  searchOptions = false;
  showItineraries = false;
  showNotifications = false;
  profileOptions = false;

  newNotification = false;

  // side nav
  sideNav = false;
  connectionsSection = true;
  quickLinksSection = true;
  settingsSection = false;

  showUsers = false;
  users: User[] = [];
  filteredUsers;

  notificationsLimit = true;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private renderer: Renderer2,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private itineraryEventService: ItineraryEventService,
    private relationshipService: RelationshipService,
    private itineraryService: ItineraryService,
    private notificationService: NotificationService,
    private flashMessageService: FlashMessageService,
    private loadingService: LoadingService) { }

  ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn();

    this.currentUserSubscription = this.userService.updateCurrentUser.subscribe(
      result => {
        this.currentUser = result;
        this.getFollowings(this.currentUser);
        this.notificationService.getNotifications(this.currentUser['_id']).subscribe(
          data =>{})
      })

    this.relationshipSubscription = this.relationshipService.updateRelationships.subscribe(
      result => {
        this.socialRelationships = Object.keys(result['relationships']).map(key => result['relationships'][key]);;
        this.followers = Object.keys(result['followers']).map(key => result['followers'][key]);;
        this.followings = Object.keys(result['followings']).map(key => result['followings'][key]);;
        this.pendingFollowers = Object.keys(result['pendingFollowers']).map(key => result['pendingFollowers'][key]);;
        this.requestedFollowings = Object.keys(result['requestedFollowings']).map(key => result['requestedFollowings'][key]);;
        this.groupUsers();
      })

    this.notificationSubscription = this.notificationService.updateNotifications.subscribe(
      result => {
        this.notifications = Object.keys(result).map(key => result[key]);
        this.checkNewNotification();
      })

    if(this.isLoggedIn) {
      this.userService.getAllUsers().subscribe(
        result => {
          this.users = result.users;
          this.filteredUsers = this.users;
        })
    }


    if(!this.isLoggedIn)  {
      this.reload = true;
    }
  }

  ngOnDestroy() {
    if(this.currentUserSubscription) this.currentUserSubscription.unsubscribe();
    if(this.relationshipSubscription) this.relationshipSubscription.unsubscribe();
    if(this.notificationSubscription) this.notificationSubscription.unsubscribe();
  }

  getFollowings(currentUser) {
    if(this.isLoggedIn) {
      this.relationshipService.getRelationships(currentUser).subscribe(
        result => {})
    }
  }

  groupUsers()  {
    for (let i = 0; i < this.users.length; i++) {
      this.users[i]['follower_status'] = '';
      this.users[i]['following_status'] = '';

      if(this.socialRelationships.length > 0) {
        for (let j = 0; j < this.socialRelationships.length; j++) {
          let follower_id = this.socialRelationships[j]['user']['_id'];
          let following_id = this.socialRelationships[j]['following']['_id'];

          if(this.users[i]['_id'] === follower_id) {
            this.users[i]['follower_status'] = this.socialRelationships[j]['relative_status'];
          }

          if(this.users[i]['_id'] === following_id) {
            this.users[i]['following_status'] = this.socialRelationships[j]['relative_status'];
          }
        }
      }
    }
  }

  checkNewNotification()  {
    let checkDate = new Date(this.currentUser['check_notification']).getTime();

    for (let i = 0; i < this.notifications.length; i++) {
      let itemDate = new Date(this.notifications[i]['created_at']).getTime();

      if(itemDate > checkDate)  {
        this.newNotification = true;
        i = this.notifications.length;
      }
    }
  }



  // sign up / log in
  getSignin() {
    this.authOptions = false;
    this.showSignin = true;
    this.preventScroll(true);
  }

  getSignup() {
    this.authOptions = false;
    this.showSignup = true;
    this.preventScroll(true);
  }

  hideSignin()  {
    this.showSignin = false;
    this.preventScroll(false);
  }

  hideSignup()  {
    this.showSignup = false;
    this.preventScroll(false);
  }




  // top navigation favourite
  favourite() {
    this.fav = true;
    this.preventScroll(true);
  }

  cancelFav() {
    this.fav = false;
    this.preventScroll(false);
  }

  viewRecommendations() {
    this.bookmarkOptions = false;
    this.router.navigateByUrl('/me/recommendations');
  }

  viewFavMap()  {
    this.bookmarkOptions = false;
    this.router.navigateByUrl('/me/favourite');
  }




  // top navigation itinerary
  newItin() {
    this.showItineraryForm = true;
    this.preventScroll(true);
  }

  routeToItinerary(id) {
    this.showItineraries = false;

    if(this.route.snapshot['_urlSegment'].segments[2]) {
      if(this.route.snapshot['_urlSegment'].segments[2].path !== id)  {
        this.loadingService.setLoader(true, "");
      }
    }
  }




  // top navigation notification/followers
  getNotifications()  {
    this.showNotifications = true;
    this.newNotification = false;

    this.currentUser['check_notification'] = new Date();

    this.userService.editUser(this.currentUser).subscribe(
      result => {})
  }




  // side navigation
  showSideNav()  {
    this.sideNav = !this.sideNav;
    this.preventScroll(this.sideNav);
  }

  exitSideNav()  {
    this.sideNav = false;
    this.preventScroll(false);
  }




  // user search
  getUsers()  {
    this.showUsers = true;
    this.sideNav = false;
    this.preventScroll(true);
  }

  filterSearch(text)  {
    if(!text)   {
      this.filteredUsers = [];
    } else  {
      this.filteredUsers = Object.assign([], this.users).filter(
        user => user.username.toLowerCase().indexOf(text.toLowerCase()) > -1
      )
    }
  }

  follow(user)  {
    let following = {
      user: this.currentUser,
      following: user,
    }

    let message = "You are now following " + user['username'];


    if(user['private']) {
      this.relationshipService.requestFollow(following).subscribe(
        result => { } )

      user['following_status'] = 'requestedFollowing';
    } else  {
      this.relationshipService.createFollow(following).subscribe(
        result => {
          this.flashMessageService.handleFlashMessage(message);
        })

      user['following_status'] = 'following';
    }

  }

  unfollow(user)  {
    this.loadingService.setLoader(true, "Unfollowing user...");

    let relationship;
    let status;

    if(user.following_status === 'following')  {
      for (let i = 0; i < this.followings.length; i++) {
        if(this.followings[i]['following']['_id'] === user["_id"]) {
          relationship = this.followings[i];
          status = "following";
        }
      }
    }

    if(user.following_status === 'requestedFollowing')  {
      for (let i = 0; i < this.requestedFollowings.length; i++) {
        if(this.requestedFollowings[i]['following']['_id'] === user["_id"]) {
          relationship = this.requestedFollowings[i];
          status = "requestedFollowing";
        }
      }
    }

    this.relationshipService.deleteFollow(relationship, status).subscribe(
      result => {
        user.following_status = '';
        this.loadingService.setLoader(false, "");
      })
  }

  cancelShowUsers() {
    this.showUsers = false;
    this.preventScroll(false);
    this.filteredUsers = [];
  }



  // routing to relationships
  routeToFollowers() {
    this.sideNav = false;
    this.router.navigateByUrl('/me/relationships/followers');
  }

  routeToFollowings() {
    this.sideNav = false;
    this.router.navigateByUrl('/me/relationships/following');
  }

  routeToPendingFollowers() {
    this.sideNav = false;
    this.showNotifications = false;
    this.router.navigateByUrl('/me/relationships/follow-request');
  }




  // new itinerary
  hideItineraryForm(hide) {
    this.showItineraryForm = false;
    this.preventScroll(false);
  }




  // route to all notifications
  routeToNotifications()  {
    this.sideNav = false;
    this.showNotifications = false;
    this.router.navigateByUrl('/me/notifications');
  }

  routeToFavs()  {
    this.sideNav = false;
    this.router.navigateByUrl('/me/favourite');
  }




  // profile options
  logout()  {
    this.authService.logout();
    this.sideNav = false;
    this.profileOptions = false;
    this.preventScroll(false);
  }




  // prevent scroll
  preventScroll(value)  {
    if(value) {
      this.renderer.addClass(document.body, 'prevent-scroll');
    } else  {
      this.renderer.removeClass(document.body, 'prevent-scroll');
    }
  }

  routeToHome() {
    if(this.isLoggedIn) {
      this.router.navigateByUrl('/me')
    } else  {
      this.router.navigateByUrl('/')
    }
  }

  routeToUser(id) {
    this.cancelShowUsers();
    if(id === this.currentUser['_id']) {
      this.router.navigateByUrl('/me/profile');
    } else  {
      this.router.navigateByUrl('/wondererwanderer/' + id)
    }
  }
}
