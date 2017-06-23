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

@Component({
  selector: 'ww-main-navigation',
  templateUrl: './main-navigation.component.html',
  styleUrls: ['./main-navigation.component.scss']
})
export class MainNavigationComponent implements OnInit, OnDestroy {
  currentUserSubscription: Subscription;
  currentUser: User;

  relationshipSubscription: Subscription;
  socialRelationships = [];
  followings = [];
  followers = [];
  pendingFollowers = [];
  requestedFollowings = [];

  notificationSubscription: Subscription;
  notifications = [];

  showItineraryForm = false;
  checkin = false;

  // top nav
  searchOptions = false;
  showItineraries = false;
  showFollowerRequests = false;
  showNotifications = false;
  profileOptions = false;

  newFollower = false;
  newNotification = false;

  // side nav
  sideNav = false;
  connectionsSection = true;
  notificationsSection = true;
  settingsSection = false;

  showUsers = false;
  users: User[] = [];
  filteredResult;

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
    private loadingService: LoadingService) { }

  ngOnInit() {
    this.currentUserSubscription = this.userService.updateCurrentUser.subscribe(
      result => {
        this.currentUser = result;
        this.getFollowings(this.currentUser);
      })

    this.relationshipSubscription = this.relationshipService.updateRelationships.subscribe(
      result => {
        this.socialRelationships = Object.keys(result['relationships']).map(key => result['relationships'][key]);;
        this.followers = Object.keys(result['followers']).map(key => result['followers'][key]);;
        this.followings = Object.keys(result['followings']).map(key => result['followings'][key]);;
        this.pendingFollowers = Object.keys(result['pendingFollowers']).map(key => result['pendingFollowers'][key]);;
        this.requestedFollowings = Object.keys(result['requestedFollowings']).map(key => result['requestedFollowings'][key]);;
        this.groupUsers();
        this.checkNewFollower();
      })

    this.notificationSubscription = this.notificationService.updateNotifications.subscribe(
      result => {
        this.notifications = Object.keys(result).map(key => result[key]);
        this.checkNewNotification();
      })

    this.userService.getAllUsers().subscribe(
          result => {
            this.users = result.users;
          })

  }

  ngOnDestroy() {
    this.currentUserSubscription.unsubscribe();
    this.relationshipSubscription.unsubscribe();
    this.notificationSubscription.unsubscribe();
  }

  getFollowings(currentUser) {
    this.relationshipService.getRelationships(currentUser).subscribe(
          result => {})
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

  checkNewFollower()  {
    let today = new Date()
    for (let i = 0; i < this.pendingFollowers.length; i++) {
      if(this.pendingFollowers[i]['created_at'] > today)  {
        this.newFollower = true;
        i = this.pendingFollowers.length;
      }
    }
  }

  checkNewNotification()  {
    let today = new Date()
    for (let i = 0; i < this.notifications.length; i++) {
      if(this.notifications[i]['created_at'] > today)  {
        this.newNotification = true;
        i = this.notifications.length;
      }
    }
  }

  // top navigation check in
  checkIn() {
    this.checkin = true;
    this.preventScroll(true);
  }

  cancelCheckin() {
    this.checkin = false;
    this.preventScroll(false);
  }

  // top navigation itinerary
  newItin() {
    this.showItineraryForm = true;
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
    this.currentUser['check_notification'] = new Date();

    this.userService.editUser(this.currentUser).subscribe(
      result => {})
  }

  getFollowers()  {
    this.showFollowerRequests = true;

    this.currentUser['check_follower'] = new Date();
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
      this.filteredResult = [];
    } else  {
      this.filteredResult = Object.assign([], this.users).filter(
        user => user.username.toLowerCase().indexOf(text.toLowerCase()) > -1
      )
    }
  }

  follow(user)  {
    this.relationshipService.requestFollow({
      user: this.currentUser,
      following: user,
    }).subscribe( result => {} )
  }

  unfollow(user)  {
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

    this.relationshipService.deleteFollow(relationship, status)
        .subscribe( result => {} )
  }

  cancelShowUsers() {
    this.showUsers = false;
    this.preventScroll(false);
    this.filteredResult = [];
  }

  // follower requests
  acceptRequest(following) {
    following['status'] = 'accepted';
    following['responded'] = true;
    following['request_accepted'] = true;

    this.relationshipService.acceptFollow(following)
        .subscribe( result => {} )
  }

  ignoreRequest(following) {
    following['responded'] = true;
    following['request_ignored'] = true;

    this.relationshipService.deleteFollow(following, "pendingFollower")
        .subscribe( result => {} )
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

  routeToUser(id) {
    this.cancelShowUsers();
    if(id === this.currentUser['_id']) {
      this.router.navigateByUrl('/me/profile');
    } else  {
      this.router.navigateByUrl('/wondererwanderer/' + id)
    }
  }
}
