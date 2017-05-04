import { Component, OnInit, OnDestroy, Renderer } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Rx';

import { User, UserService, RelationshipService } from '../../user';
import { ItineraryService, ItineraryEventService } from '../../itinerary';
import { AuthService } from '../../auth';

@Component({
  selector: 'ww-side-navigation',
  templateUrl: './side-navigation.component.html',
  styleUrls: ['./side-navigation.component.scss']
})
export class SideNavigationComponent implements OnInit, OnDestroy {
  currentUser: User;
  currentUserSubscription: Subscription;
  relationshipSubscription: Subscription;

  showItineraryForm = false;
  itinerariesSubscription: Subscription;

  users: User[] = [];
  showUsers = false;

  socialRelationships = [];

  followings = [];
  followers = [];
  pendingFollowers = [];
  requestedFollowings = [];

  connectionsSection = true;
  itinerariesSection = true;
  settingsSection = false;
  showMenu = false;

  showItineraries = false;
  searchOptions = false;
  filteredResult;
  showFollowerRequests = false;
  showNotification = false;
  profileOptions = false;

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
    this.currentUserSubscription = this.userService.updateCurrentUser
                                       .subscribe(
                                         result => {
                                           this.currentUser = result;
                                           this.getFollowings(this.currentUser);
                                         }
                                       )

    this.itinerariesSubscription = this.itineraryService.updateItineraries
                                       .subscribe(
                                         result => {
                                           this.handleItinChange(result)
                                         })

    this.relationshipSubscription = this.relationshipService.updateRelationships
                                     .subscribe(
                                       result => {
                                         this.socialRelationships = Object.keys(result['relationships']).map(key => result['relationships'][key]);;
                                         this.followers = Object.keys(result['followers']).map(key => result['followers'][key]);;
                                         this.followings = Object.keys(result['followings']).map(key => result['followings'][key]);;
                                         this.pendingFollowers = Object.keys(result['pendingFollowers']).map(key => result['pendingFollowers'][key]);;
                                         this.requestedFollowings = Object.keys(result['requestedFollowings']).map(key => result['requestedFollowings'][key]);;
                                         this.groupUsers();
                                       }
                                     )

    this.userService.getAllUsers()
        .subscribe(
          result => {
            this.users = result;
          }
        )
  }

  ngOnDestroy() {
    this.currentUserSubscription.unsubscribe();
    this.itinerariesSubscription.unsubscribe();
    this.relationshipSubscription.unsubscribe();
  }

  getFollowings(currentUser) {
    this.relationshipService.getRelationships(currentUser)
        .subscribe(
          result => {}
        )
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

  getUsers()  {
    this.showUsers = true;
    this.showMenu = false;
    this.renderer.setElementClass(document.body, 'prevent-scroll', true);
  }

  cancelShowUsers() {
    this.showUsers = false;
    this.renderer.setElementClass(document.body, 'prevent-scroll', false);
    this.filteredResult = [];
  }

  handleItinChange(result)  {
    let method = result['method'];
    let userItineraries = this.currentUser['itineraries'];

    if(method === 'add')  {
      userItineraries.push({
        _id: result['_id'],
        name: result['name'],
        dateFrom: result['dateFrom'],
        dateTo: result['dateTo']
      });
    } else if (method === 'edit') {
      for (let i = 0; i < userItineraries.length; i++) {
        if(userItineraries[i]['_id'] === result['_id'])  {
          userItineraries[i]['name'] = result['name'],
          userItineraries[i]['dateFrom'] = result['dateFrom'],
          userItineraries[i]['dateTo'] = result['dateTo']
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

  createItinerary() {
    this.showItineraryForm = true;
    this.showMenu = false;
  }

  hideItineraryForm(hide) {
    this.showItineraryForm = false;
    this.renderer.setElementClass(document.body, 'prevent-scroll', false);
  }

  logout()  {
    this.authService.logout();
    this.showMenu = false;
    this.profileOptions = false;
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

  showSideMenu()  {
    this.showMenu = !this.showMenu;
    this.togglePreventScroll(this.showMenu);
  }

  togglePreventScroll(value)  {
    this.renderer.setElementClass(document.body, 'prevent-scroll', value);
  }

  exitMenu()  {
    this.showMenu = false;
    this.renderer.setElementClass(document.body, 'prevent-scroll', false);
  }

  // top navigation
  showSearchOptions() {
    this.searchOptions = true;
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

  exitSearch()  {
    this.filteredResult = [];
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

  hideFollowerRequestsList() {
    this.showFollowerRequests = false;
  }

  showNotificationsList() {
    this.showNotification = true;
  }

  hideNotificationList()  {
    this.showNotification = false;
  }

  showProfileOptions()  {
    this.profileOptions = true;
  }

  hideProfileOptions()  {
    this.profileOptions = false;
  }

  routeToFollowers() {
    this.showMenu = false;
    this.router.navigateByUrl('/me/relationships/followers');
  }

  routeToFollowings() {
    this.showMenu = false;
    this.router.navigateByUrl('/me/relationships/following');
  }

  routeToPendingFollowers() {
    this.showMenu = false;
    this.router.navigateByUrl('/me/relationships/follow-request');
  }

  routeToNotifications()  {
    this.showNotification = false;
    this.router.navigateByUrl('/me/notifications');
  }
}
