import { Component, OnInit, OnDestroy, Renderer } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Rx';

import { User, UserService, RelationshipService }  from '../../user';
import { ItineraryService, ItineraryEventService } from '../../itinerary';
import { AuthService }                             from '../../auth';

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

  itinerariesSubscription: Subscription;
  showItineraryForm = false;

  // top nav
  searchOptions = false;
  showItineraries = false;
  showFollowerRequests = false;
  showNotifications = false;
  profileOptions = false;

  // side nav
  sideNav = false;
  connectionsSection = true;
  itinerariesSection = true;
  settingsSection = false;

  showUsers = false;
  users: User[] = [];
  filteredResult;

  notificationsLimit = true;

  constructor(
    private router: Router,
    private renderer: Renderer,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private itineraryEventService: ItineraryEventService,
    private relationshipService: RelationshipService,
    private itineraryService: ItineraryService ) { }

  ngOnInit() {
    this.currentUserSubscription = this.userService.updateCurrentUser.subscribe(
                                         result => {
                                           this.currentUser = result;
                                           this.getFollowings(this.currentUser);
                                         })

    this.itinerariesSubscription = this.itineraryService.updateItineraries.subscribe(
                                         result => { this.handleItinChange(result) })

    this.relationshipSubscription = this.relationshipService.updateRelationships.subscribe(
                                       result => {
                                         this.socialRelationships = Object.keys(result['relationships']).map(key => result['relationships'][key]);;
                                         this.followers = Object.keys(result['followers']).map(key => result['followers'][key]);;
                                         this.followings = Object.keys(result['followings']).map(key => result['followings'][key]);;
                                         this.pendingFollowers = Object.keys(result['pendingFollowers']).map(key => result['pendingFollowers'][key]);;
                                         this.requestedFollowings = Object.keys(result['requestedFollowings']).map(key => result['requestedFollowings'][key]);;
                                         this.groupUsers();
                                       }
                                     )

    this.userService.getAllUsers().subscribe(
          result => {
            this.users = result.users;
          })
  }

  ngOnDestroy() {
    this.currentUserSubscription.unsubscribe();
    this.itinerariesSubscription.unsubscribe();
    this.relationshipSubscription.unsubscribe();
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

  // amend user.itineraries upon change
  handleItinChange(result)  {
    let method = result['method'];
    let userItineraries = this.currentUser['itineraries'];

    if(method === 'add')  {
      userItineraries.push({
        _id: result['_id'],
        name: result['name'],
        date_from: result['date_from'],
        date_to: result['date_to']
      });
    } else if (method === 'edit') {
      for (let i = 0; i < userItineraries.length; i++) {
        if(userItineraries[i]['_id'] === result['_id'])  {
          userItineraries[i]['name'] = result['name'],
          userItineraries[i]['date_from'] = result['date_from'],
          userItineraries[i]['date_to'] = result['date_to']
        }
      }
    } else if (method === 'delete') {
      for (let i = 0; i < userItineraries.length; i++) {
        if(userItineraries[i]['_id'] === result['_id'])  {
          let indexOfItin = userItineraries.indexOf(userItineraries[i]);
          userItineraries.splice(indexOfItin, 1);
        }
      }
    }
  }

  // top navigation
  showSearchOptions() {
    this.searchOptions = true;
  }

  showItineraryList() {
    this.showItineraries = true;
  }

  hideItineraryList() {
    this.showItineraries = false;
  }

  showFollowerRequestsList() {
    this.showFollowerRequests = true;
  }

  showNotificationsList() {
    this.showNotifications = true;
  }

  hideNotificationsList()  {
    this.showNotifications = false;
  }

  showProfileOptions()  {
    this.profileOptions = true;
  }

  hideProfileOptions()  {
    this.profileOptions = false;
  }

  // side navigation
  showSideNav()  {
    this.sideNav = !this.sideNav;
    this.togglePreventScroll(this.sideNav);
  }

  exitSideNav()  {
    this.sideNav = false;
    this.renderer.setElementClass(document.body, 'prevent-scroll', false);
  }

  toggleConnectionsSection() {
    this.connectionsSection = !this.connectionsSection;
  }

  toggleItinerariesSection() {
    this.itinerariesSection = !this.itinerariesSection;
  }

  toggleSettingsSection() {
    this.settingsSection = !this.settingsSection;
  }


  // user search
  getUsers()  {
    this.showUsers = true;
    this.sideNav = false;
    this.renderer.setElementClass(document.body, 'prevent-scroll', true);
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
    this.renderer.setElementClass(document.body, 'prevent-scroll', false);
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
  newItinerary() {
    this.showItineraryForm = true;
    this.sideNav = false;
  }

  hideItineraryForm(hide) {
    this.showItineraryForm = false;
    this.renderer.setElementClass(document.body, 'prevent-scroll', false);
  }

  // route to all notifications
  routeToNotifications()  {
    this.showNotifications = false;
    this.router.navigateByUrl('/me/notifications');
  }

  // profile options
  logout()  {
    this.authService.logout();
    this.sideNav = false;
    this.profileOptions = false;
    this.renderer.setElementClass(document.body, 'prevent-scroll', false);
  }

  // prevent scroll
  togglePreventScroll(value)  {
    this.renderer.setElementClass(document.body, 'prevent-scroll', value);
  }
}
