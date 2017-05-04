import { Component, OnInit, Output, EventEmitter, Renderer } from '@angular/core';
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
export class ItineraryComponent implements OnInit {
  itinerary: Itinerary;
  editing = false;
  deleteItinerary = false;

  currentUser: User;
  currentUserSubscription: Subscription;

  users: User[] = [];
  showUsers = false;
  newMembers = [];
  validAddUser = false;
  showCurrentMembers = false;

  showAddNew = false;
  addAccommodation = false;
  addTransport = false;
  addActivity = false;
  addResource = false;

  showMenu = false;

  constructor(
    private renderer: Renderer,
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
      this.itineraryService.getItin(id)
      .subscribe(
        result => {
          this.itinerary = result.itinerary;
          this.itineraryEventService.getEvents(id)
              .subscribe( eventResult => {} )

          this.resourceService.getResources(id)
              .subscribe( resourceResult => {} )

          this.userService.getAllUsers()
              .subscribe(
                userResult => {
                  this.filterUsers(userResult);
                }
              )
        }
      );
    })

    this.currentUserSubscription = this.userService.updateCurrentUser
                                       .subscribe(
                                         result => {
                                           this.currentUser = result;
                                         }
                                       )
  }

  filterUsers(users)  {
    this.users = users;
    for (let i = 0; i < users.length; i++) {
      for (let j = 0; j < this.itinerary['members'].length; j++) {
        if(users[i]['_id'] === this.itinerary['members'][j]['_id']) {
          this.users.splice(i,1);
        }
      }
    }
  }

  getUsers()  {
    this.showUsers = true;
    this.showAddNew = false;
    this.showCurrentMembers = false;
    this.renderer.setElementClass(document.body, 'prevent-scroll', true);
  }

  cancelShowUsers() {
    this.showUsers = false;
    this.renderer.setElementClass(document.body, 'prevent-scroll', false);
  }

  toggleAdd(user) {
    let index = this.newMembers.indexOf(user);
    if(index > -1 ) {
      this.newMembers.splice(index, 1);
    }

    if(index < 0 )  {
      this.newMembers.push(user);
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

    this.itineraryService.editItin(this.itinerary)
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
          }
        )
    this.showUsers = false;
    this.renderer.setElementClass(document.body, 'prevent-scroll', false);
  }

  showMembers() {
    this.showCurrentMembers = !this.showCurrentMembers;
    this.showAddNew = false;
    this.togglePreventScroll(this.showCurrentMembers);
  }

  hideMembers() {
    this.showCurrentMembers = false;
    this.renderer.setElementClass(document.body, 'prevent-scroll', false);
  }

  togglePreventScroll(value)  {
    this.renderer.setElementClass(document.body, 'prevent-scroll', value);
  }

  showAddNewOptions() {
    this.showAddNew = true;
    this.showCurrentMembers = false;
    this.renderer.setElementClass(document.body, 'prevent-scroll', true);
  }

  newAccommodation()  {
    this.showAddNew = false;
    this.addAccommodation = true;
    this.addTransport = false;
    this.addActivity = false;
    this.addResource = false;
    this.renderer.setElementClass(document.body, 'prevent-scroll', true);
  }

  newTransport()  {
    this.showAddNew = false;
    this.addAccommodation = false;
    this.addTransport = true;
    this.addActivity = false;
    this.addResource = false;
    this.renderer.setElementClass(document.body, 'prevent-scroll', true);
  }

  newActivity()  {
    this.showAddNew = false;
    this.addAccommodation = false;
    this.addTransport = false;
    this.addActivity = true;
    this.addResource = false;
    this.renderer.setElementClass(document.body, 'prevent-scroll', true);
  }

  newResource()  {
    this.showAddNew = false;
    this.addAccommodation = false;
    this.addTransport = false;
    this.addActivity = false;
    this.addResource = true;
    this.renderer.setElementClass(document.body, 'prevent-scroll', true);
  }

  hideAccommodationForm(hide)  {
    this.addAccommodation = false;
    this.renderer.setElementClass(document.body, 'prevent-scroll', false);
  }

  hideTransportForm(hide)  {
    this.addTransport = false;
    this.renderer.setElementClass(document.body, 'prevent-scroll', false);
  }

  hideActivityForm(hide)  {
    this.addActivity = false;
    this.renderer.setElementClass(document.body, 'prevent-scroll', false);
  }

  hideResourceForm(hide)  {
    this.addResource = false;
    this.renderer.setElementClass(document.body, 'prevent-scroll', false);
  }

  activateTab() {
    this.showAddNew = false;
    this.showCurrentMembers = false;
    this.showUsers = false;
    this.renderer.setElementClass(document.body, 'prevent-scroll', false);
  }

  showMenuOptions() {
    this.showMenu = true;
  }

}
