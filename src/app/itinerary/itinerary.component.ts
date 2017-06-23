import { Component, OnInit, OnDestroy, Output, EventEmitter, Renderer2, ElementRef } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs/Rx';

import { Itinerary }             from './itinerary';
import { ItineraryService }      from './itinerary.service';
import { ItineraryEventService } from './itinerary-events/itinerary-event.service';
import { FlashMessageService }   from '../flash-message';
import { User, UserService }     from '../user';
import { ResourceService }       from './itinerary-resources/resource.service';
import { NotificationService }   from '../notifications';

@Component({
  selector: 'ww-itinerary',
  templateUrl: './itinerary.component.html',
  styleUrls: ['./itinerary.component.scss']
})
export class ItineraryComponent implements OnInit, OnDestroy {
  currentItinerarySubscription: Subscription;
  itinerary: Itinerary;

  currentUserSubscription: Subscription;
  currentUser: User;

  showUsersSearchModal = false;
  users: User[] = [];
  filteredResult;
  newMembers = [];
  validAddUser = false;

  showCurrentMembers = false;

  showAddNew = false;
  addAccommodation = false;
  addTransport = false;
  addActivity = false;
  addResource = false;

  constructor(
    private element: ElementRef,
    private renderer: Renderer2,
    private itineraryService: ItineraryService,
    private itineraryEventService: ItineraryEventService,
    private resourceService: ResourceService,
    private flashMessageService: FlashMessageService,
    private notificationService: NotificationService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router) {}

  ngOnInit() {
    this.route.params.forEach((params: Params) => {
      let id = params['id'];

      this.itineraryService.getItin(id).subscribe(
        result => {
          this.currentItinerarySubscription = this.itineraryService.currentItinerary.subscribe(
                                             result =>  {
                                               this.itinerary = result;
                                               this.getAllUsers();
                                             })

          this.itineraryEventService.getEvents(id).subscribe(
               eventResult => {})

          this.resourceService.getResources(id).subscribe(
               resourceResult => {})
        }
      )
    })

    this.currentUserSubscription = this.userService.updateCurrentUser.subscribe(
                                         result => { this.currentUser = result; })
  }

  ngOnDestroy() {
    this.currentItinerarySubscription.unsubscribe();
    this.currentUserSubscription.unsubscribe();
  }

  getAllUsers() {
    this.userService.getAllUsers()
        .subscribe(
          userResult => {
            this.filterUsers(userResult.users);
          }
        )
  }

  filterUsers(users)  {
    this.users = users;

    for (let i = 0; i < this.itinerary['members'].length; i++) {
      for (let j = 0; j < this.users.length; j++) {
        if(this.itinerary['members'][i]['_id'] === this.users[j]['_id']) {
          this.users.splice(j,1);
          j--
        }
      }
    }
  }

  // show add members modal
  getUsers()  {
    this.showUsersSearchModal = true;
    this.showAddNew = false;
    this.showCurrentMembers = false;
    this.preventScroll(true);
  }

  // add members modal
  filterSearch(text)  {
    if(!text)   {
      this.filteredResult = [];
    } else  {
      this.filteredResult = Object.assign([], this.users).filter(
        user => user.username.toLowerCase().indexOf(text.toLowerCase()) > -1
      )
    }
  }

  cancelShowUsers() {
    this.showUsersSearchModal = false;
    this.preventScroll(false);
    this.filteredResult = [];
    this.users.push.apply(this.users, this.newMembers);

    this.newMembers = [];
  }

  toggleAdd(user) {
    let index = this.newMembers.indexOf(user);
    if(index > -1 ) {
      this.newMembers.splice(index, 1);
      this.users.push(user);
      this.filteredResult.push(user);
    }

    if(index < 0 )  {
      this.newMembers.push(user);
      this.users.splice(this.users.indexOf(user), 1);
      this.filteredResult.splice(this.filteredResult.indexOf(user),1)
    }

    if(this.newMembers.length > 0) {
      this.validAddUser = true;
    }

    if(this.newMembers.length < 1) {
      this.validAddUser = false;
    }
  }

  addMembers()  {
    for (let i = 0; i < this.newMembers.length; i++) {
      this.itinerary['members'].push(this.newMembers[i]);
    }

    this.itineraryService.editItin(this.itinerary, 'edit')
        .subscribe(
          data => {
            for (let i = 0; i < this.newMembers.length; i++) {
              this.notificationService.newNotification({
                recipient: this.newMembers[i],
                originator: this.currentUser,
                message: " has included you to the itinerary" + this.itinerary['name'],
                link: "/me/itinerary/" + this.itinerary['_id'],
                read: false
              })
            }
          })

    this.showUsersSearchModal = false;
    this.preventScroll(false);
    this.newMembers = [];
    this.filteredResult = [];
  }

  // show and hide current members in small screen
  showMembers() {
    this.showCurrentMembers = !this.showCurrentMembers;
    this.showAddNew = false;
    this.preventScroll(this.showCurrentMembers);
  }

  hideMembers() {
    this.showCurrentMembers = false;
    this.preventScroll(false);
  }

  // itinerary nav tabs to access forms
  showAddNewOptions() {
    this.showAddNew = true;
    this.showCurrentMembers = false;
    this.preventScroll(true);
  }

  cancelAddNewOptions() {
    this.showAddNew = false;
    this.preventScroll(false);
  }

  newAccommodation()  {
    this.showAddNew = false;
    this.addAccommodation = true;
    this.addTransport = false;
    this.addActivity = false;
    this.addResource = false;
    this.preventScroll(true);
  }

  newTransport()  {
    this.showAddNew = false;
    this.addAccommodation = false;
    this.addTransport = true;
    this.addActivity = false;
    this.addResource = false;
    this.preventScroll(true);
  }

  newActivity()  {
    this.showAddNew = false;
    this.addAccommodation = false;
    this.addTransport = false;
    this.addActivity = true;
    this.addResource = false;
    this.preventScroll(true);
  }

  newResource()  {
    this.showAddNew = false;
    this.addAccommodation = false;
    this.addTransport = false;
    this.addActivity = false;
    this.addResource = true;
    this.preventScroll(true);
  }

  hideAccommodationForm(hide)  {
    this.addAccommodation = false;
    this.preventScroll(false);
  }

  hideTransportForm(hide)  {
    this.addTransport = false;
    this.preventScroll(false);
  }

  hideActivityForm(hide)  {
    this.addActivity = false;
    this.preventScroll(false);
  }

  hideResourceForm(hide)  {
    this.addResource = false;
    this.preventScroll(false);
  }

  // to close any open modal when navigate to child routes
  activateTab() {
    this.showAddNew = false;
    this.showCurrentMembers = false;
    this.showUsersSearchModal = false;
    this.preventScroll(false);
  }

  // others
  preventScroll(value)  {
    if(value) {
      this.renderer.addClass(document.body, 'prevent-scroll');
    } else  {
      this.renderer.removeClass(document.body, 'prevent-scroll');
    }
  }

  scrollLeft()  {
    this.element.nativeElement.firstElementChild.children[4].firstElementChild.firstElementChild.scrollLeft -= 100;
  }

  scrollRight() {
    this.element.nativeElement.firstElementChild.children[4].firstElementChild.firstElementChild.scrollLeft += 100;
  }

  routeToUser(id) {
    if(id === this.currentUser['_id']) {
      this.router.navigateByUrl('/me/profile');
    } else  {
      this.router.navigateByUrl('/wondererwanderer/' + id)
    }
  }

}
