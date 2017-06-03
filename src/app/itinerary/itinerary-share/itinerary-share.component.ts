import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
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
export class ItineraryShareComponent implements OnInit {
  @Input() shareType;
  @Input() itineraries;
  @Output() cancelShare = new EventEmitter();

  currentItinerarySubscription: Subscription;
  currentItinerary: Itinerary;

  currentUserSubscription: Subscription;
  currentUser;

  eventSubscription: Subscription;
  events = [];

  updateResourcesSubscription: Subscription;
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
  copying = false;

  constructor(
    private userService: UserService,
    private router: Router,
    private itineraryService: ItineraryService,
    private itineraryEventService: ItineraryEventService,
    private resourceService: ResourceService,
    private flashMessageService: FlashMessageService,
    private notificationService: NotificationService) { }

  ngOnInit() {
    this.currentItinerarySubscription = this.itineraryService.currentItinerary.subscribe(
                                             result => {
                                               this.currentItinerary = result;
                                             })

    this.currentUserSubscription = this.userService.updateCurrentUser.subscribe(
                                        result => {
                                          this.currentUser = result;
                                        })

    this.eventSubscription = this.itineraryEventService.updateEvent.subscribe(
                                  result => {
                                    this.filterEvents(result);
                                  }
                                )

    this.updateResourcesSubscription = this.resourceService.updateResources.subscribe(
                                             result => {
                                               this.resources = Object.keys(result).map(key => result[key]);
                                               for (let i = 0; i < this.resources.length; i++) {
                                                 this.shareIndexResource.push(true);
                                               }

                                             })

    this.userService.getAllUsers().subscribe(
          result => {
            this.filterUsers(result.users);
          })

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

    for (let i = 0; i < this.currentItinerary['members'].length; i++) {
      for (let j = 0; j < this.users.length; j++) {
        if(this.currentItinerary['members'][i]['_id'] === this.users[j]['_id']) {
          this.users[j]['status'] = 'Member of itinerary';
        }
      }
    }

    for (let i = 0; i < this.currentItinerary['shares'].length; i++) {
      for (let j = 0; j < this.users.length; j++) {
        if(this.currentItinerary['shares'][i]['shared_with']['_id'] === this.users[j]['_id']) {
          let sharedBy = this.currentItinerary['shares'][i]['shared_by']['username'];
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
        name: this.currentItinerary['name'] + " - shared by " + this.currentUser['username'],
        date_from: this.currentItinerary['date_from'],
        date_to: this.currentItinerary['date_to'],
        members: [this.selectedUsers[i]['_id']],
        admin: [this.selectedUsers[i]['_id']],
        created_by: this.currentItinerary['created_by'],
      }

      let newShare = {
        shared_by: this.currentUser['id'],
        shared_with: this.selectedUsers[i]['_id'],
        shared_on: new Date()
      }

      this.currentItinerary['shares'].push(newShare);

      this.itineraryService.copyItin(newItinerary).subscribe(
        data => {
          this.shareEvents(data.itinerary, "share");

          this.notificationService.newNotification({
            recipient: this.selectedUsers[i]['_id'],
            originator: this.currentUser['id'],
            message: " has shared with you the itinerary - " + this.currentItinerary['name'],
            link: "/me/itinerary/" + data.itinerary['_id'],
            read: false
          }).subscribe(data => {})
        }
      )
    }
    // this.selectedUsers = [];

    this.itineraryService.editItin(this.currentItinerary, 'edit').subscribe(
      result => {})
  }

  shareEvents(itinerary, type) {
    this.selectedItinerary = itinerary;
    for (let i = 0; i < this.shareIndex.length; i++) {
      if(this.shareIndex[i]) {
        delete this.events[i]['_id'];
        delete this.events[i]['created_at'];
        delete this.events[i]['itinerary'];

        this.events[i]['user']['_Id'] = this.events[i]['user']['_id']

        this.itineraryEventService.copyEvent(this.events[i], itinerary).subscribe(
          result => {})
      }
    }

    for (let i = 0; i < this.shareIndexResource.length; i++) {
      if(this.shareIndexResource[i])  {
        delete this.resources[i]['_id'];
        delete this.resources[i]['created_at'];
        delete this.resources[i]['itinerary'];

        this.resources[i]['user']['_Id'] = this.resources[i]['user']['_id'];
        this.resources[i]['itinerary'] = itinerary;

        this.resourceService.copyResource(this.resources[i]).subscribe(
          result => {})
      }
    }

    this.itemsSelected = false;
    this.filteredResult = [];

    if(type === 'share')  {
      this.confirmShareMessage();
    }

    if(type === 'copy') {
      this.copying = true;
    }
  }

  stay()  {
    this.copying = false;
    this.cancelShare.emit(false);
  }

  redirect()  {
    this.copying = false;
    this.cancelShare.emit(false);

    this.router.navigateByUrl('/me/itinerary/' + this.selectedItinerary['_id']);
  }

  confirmShareMessage() {
    let message = "Itinerary " + this.currentItinerary['name'] + " has been shared"
    this.flashMessageService.handleFlashMessage(message);
    this.cancelShare.emit(false);
  }
}
