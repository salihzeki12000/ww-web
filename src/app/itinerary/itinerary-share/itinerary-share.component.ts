import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Rx';

import { Itinerary }              from '../itinerary';
import { ItineraryService }       from '../itinerary.service';
import { ItineraryEventService }  from '../itinerary-events/itinerary-event.service';
import { ResourceService }        from '../itinerary-resources/resource.service';
import { UserService }            from '../../user';
import { NotificationService }    from '../../notifications';
import { FlashMessageService }    from '../../flash-message';

@Component({
  selector: 'ww-itinerary-share',
  templateUrl: './itinerary-share.component.html',
  styleUrls: ['./itinerary-share.component.scss']
})
export class ItineraryShareComponent implements OnInit, OnDestroy {
  @Input() shareType;
  @Input() itineraries;
  @Output() cancelShare = new EventEmitter();

  itinerarySubscription: Subscription;
  itinerary: Itinerary;

  currentUserSubscription: Subscription;
  currentUser;

  eventSubscription: Subscription;
  events = [];

  resourcesSubscription: Subscription;
  resources = [];

  itemsSelected = false;

  shared = false;
  shareItin = false;
  shareAll = true;
  shareIndex = [];
  shareIndexResource = [];

  showUsers = false;
  users = [];
  filteredResult = [];
  selectedUsers = []
  validAddUser = false;

  selectedItinerary;
  copied = false;

  constructor(
    private userService: UserService,
    private router: Router,
    private itineraryService: ItineraryService,
    private itineraryEventService: ItineraryEventService,
    private resourceService: ResourceService,
    private flashMessageService: FlashMessageService,
    private notificationService: NotificationService) { }

  ngOnInit() {
    this.itinerarySubscription = this.itineraryService.currentItinerary.subscribe(
      result => { this.itinerary = result; })

    this.currentUserSubscription = this.userService.updateCurrentUser.subscribe(
      result => { this.currentUser = result; })

    this.eventSubscription = this.itineraryEventService.updateEvent.subscribe(
      result => { this.filterEvents(result); })

    this.resourcesSubscription = this.resourceService.updateResources.subscribe(
      result => {
        this.resources = Object.keys(result).map(key => result[key]);

        for (let i = 0; i < this.resources.length; i++) {
          this.shareIndexResource.push(true);
        }
      })

    this.userService.getAllUsers().subscribe(
      result => { this.filterUsers(result.users); })

  }

  ngOnDestroy() {
    if(this.itinerarySubscription) this.itinerarySubscription.unsubscribe();
    if(this.eventSubscription) this.eventSubscription.unsubscribe();
    if(this.currentUserSubscription) this.currentUserSubscription.unsubscribe();
    if(this.resourcesSubscription) this.resourcesSubscription.unsubscribe();
  }

  filterEvents(events)  {
    for (let i = 0; i < events.length; i++) {
      this.shareIndex.push(true);

      if(events[i]['type'] === 'transport') {
        events[i]['name'] = events[i]['transport_type'] + " " + events[i]['reference_number'] + " from " + events[i]['dep_city'] + " to " + events[i]['arr_city'];
      }
    }
    this.events = events;
  }

  filterUsers(users)  {
    this.users = users;

    for (let i = 0; i < this.itinerary['members'].length; i++) {
      for (let j = 0; j < this.users.length; j++) {
        if(this.itinerary['members'][i]['_id'] === this.users[j]['_id']) {
          this.users[j]['status'] = 'Member of itinerary';
        }
      }
    }

    for (let i = 0; i < this.itinerary['shares'].length; i++) {
      for (let j = 0; j < this.users.length; j++) {
        if(this.itinerary['shares'][i]['shared_with']['_id'] === this.users[j]['_id']) {
          let sharedBy = this.itinerary['shares'][i]['shared_by']['username'];
          this.users[j]['status'] = 'Shared by ' + sharedBy;
        }
      }
    }
  }

  toggleShareAll()  {
    this.shareAll = !this.shareAll;

    for (let i = 0; i < this.shareIndex.length; i++) {
      this.shareIndex[i] = this.shareAll;
    }

    for (let i = 0; i < this.shareIndexResource.length; i++) {
      this.shareIndexResource[i] = this.shareAll;
    }
  }

  toggleShare(index)  {
    this.shareIndex[index] = !this.shareIndex[index]
  }

  toggleShareResource(index)  {
    this.shareIndexResource[index] = !this.shareIndexResource[index]
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

  toggleAdd(user) {
    let index = this.selectedUsers.indexOf(user);

    if(index > -1 ) {
      this.selectedUsers.splice(index, 1);
      this.users.push(user);
      this.filteredResult.push(user);
    }

    if(index < 0 )  {
      this.selectedUsers.push(user);
      this.users.splice(this.users.indexOf(user), 1);
      this.filteredResult.splice(this.filteredResult.indexOf(user),1)
    }

    if(this.selectedUsers.length > 0) {
      this.validAddUser = true;
    }

    if(this.selectedUsers.length < 1) {
      this.validAddUser = false;
    }
  }

  cancel()  {
    this.cancelShare.emit(false);
    this.itemsSelected = false;
    this.selectedUsers = [];
    this.filteredResult = [];
    this.users.push.apply(this.users, this.selectedUsers);
  }

  shareItinerary()  {
    this.shareItin = false;

    for (let i = 0; i < this.selectedUsers.length; i++) {
      let newItinerary = {
        name: this.itinerary['name'] + " - shared by " + this.currentUser['username'],
        date_from: this.itinerary['date_from'],
        date_to: this.itinerary['date_to'],
        daily_note: this.itinerary['daily_note'],
        private: this.selectedUsers[i]['privacy']['itinerary'],
        members: [this.selectedUsers[i]['_id']],
        admin: [this.selectedUsers[i]['_id']],
        created_by: this.itinerary['created_by'],
        shared_by: this.currentUser['_id']
      }

      let newShare = {
        shared_by: this.currentUser['_id'],
        shared_with: this.selectedUsers[i]['_id'],
        shared_on: new Date()
      }

      this.itinerary['shares'].push(newShare);

      this.itineraryService.copyItin(newItinerary).subscribe(
        result => {
          this.shareEvents(result.itinerary);

          this.notificationService.newNotification({
            recipient: this.selectedUsers[i]['_id'],
            originator: this.currentUser['_id'],
            message: " has shared with you the itinerary - " + this.itinerary['name'],
            link: "/me/itinerary/" + result.itinerary['_id'],
            read: false
          }).subscribe(data => {})
        }
      )
    }
    // this.selectedUsers = [];

    this.itineraryService.editItin(this.itinerary, 'edit').subscribe(
      result => {})
  }

  shareEvents(itinerary) {
    this.selectedItinerary = itinerary;
    for (let i = 0; i < this.shareIndex.length; i++) {
      if(this.shareIndex[i]) {
        delete this.events[i]['_id'];
        delete this.events[i]['created_at'];
        delete this.events[i]['itinerary'];

        // this.events[i]['user']['_Id'] = this.events[i]['user']['_id']

        this.itineraryEventService.copyEvent(this.events[i], itinerary).subscribe(
          result => {})
      }
    }

    for (let i = 0; i < this.shareIndexResource.length; i++) {
      if(this.shareIndexResource[i])  {
        delete this.resources[i]['_id'];
        delete this.resources[i]['created_at'];
        delete this.resources[i]['itinerary'];

        // this.resources[i]['user']['_Id'] = this.resources[i]['user']['_id'];
        this.resources[i]['itinerary'] = itinerary;

        this.resourceService.copyResource(this.resources[i]).subscribe(
          result => {})
      }
    }

    this.itemsSelected = false;
    this.filteredResult = [];

    if(this.shareType === 'Share')  {
      this.confirmShareMessage();
    }

    if(this.shareType === 'Copy') {
      this.copied = true;
    }
  }

  stay()  {
    this.copied = false;
    this.cancelShare.emit(false);
  }

  redirect()  {
    this.copied = false;
    this.cancelShare.emit(false);

    this.router.navigateByUrl('/me/itinerary/' + this.selectedItinerary['_id']);
  }

  confirmShareMessage() {
    let message = "Itinerary " + this.itinerary['name'] + " has been shared";
    
    this.flashMessageService.handleFlashMessage(message);
    this.cancelShare.emit(false);
  }
}
