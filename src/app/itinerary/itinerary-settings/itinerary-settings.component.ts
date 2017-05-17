import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Rx';

import { Itinerary }              from '../itinerary';
import { ItineraryService }       from '../itinerary.service';
import { ItineraryEventService }  from '../itinerary-events/itinerary-event.service';
import { ResourceService }        from '../itinerary-resources/resource.service';
import { UserService }            from '../../user';
import { FlashMessageService }    from '../../flash-message';
import { NotificationService }    from '../../notifications';

@Component({
  selector: 'ww-itinerary-settings',
  templateUrl: './itinerary-settings.component.html',
  styleUrls: ['./itinerary-settings.component.scss']
})
export class ItinerarySettingsComponent implements OnInit, OnDestroy {
  editItineraryForm: FormGroup;
  showOptions = [];
  deleteItinerary = false;
  leaveItinerary = false;

  currentItinerarySubscription: Subscription;
  currentItinerary: Itinerary;

  currentUserSubscription: Subscription;
  currentUser;
  currentUserAdmin;
  masterAdmin = false;

  showInfo = false;

  // share itinerary
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

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private itineraryService: ItineraryService,
    private itineraryEventService: ItineraryEventService,
    private resourceService: ResourceService,
    private flashMessageService: FlashMessageService,
    private notificationService: NotificationService,
    private router: Router) {
      this.editItineraryForm = this.formBuilder.group({
        'name': '',
        'date_from': '',
        'date_to': ''
      })
    }

  ngOnInit() {
    this.currentItinerarySubscription = this.itineraryService.currentItinerary.subscribe(
                                             result => {
                                               this.currentItinerary = result;
                                               console.log(this.currentItinerary)
                                               this.sortAdmin();
                                             })

    this.currentUserSubscription = this.userService.updateCurrentUser.subscribe(
                                        result => {
                                          this.currentUser = result;
                                          this.checkStatus();
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

  ngOnDestroy() {
    this.currentUserSubscription.unsubscribe();
    this.currentItinerarySubscription.unsubscribe();
    this.eventSubscription.unsubscribe();
    this.updateResourcesSubscription.unsubscribe();
  }

  sortAdmin() {
    for (let i = 0; i < this.currentItinerary['members'].length; i++) {
      this.showOptions.push(false);

      for (let j = 0; j < this.currentItinerary['admin'].length; j++) {
        if(this.currentItinerary['members'][i]['_id'] === this.currentItinerary['admin'][j])  {
          this.currentItinerary['members'][i]['admin'] = true;
        }
      }
    }
  }

  checkStatus()  {
    for (let i = 0; i < this.currentItinerary['admin'].length; i++) {
      if(this.currentItinerary['admin'][i] === this.currentUser['id']) {
        this.currentUserAdmin = true;
      }
    }

    for (let i = 0; i < this.currentItinerary['members'].length; i++) {
      if(this.currentItinerary['members'][i]['_id'] === this.currentUser['id'])  {
        this.currentItinerary['members'][i]['hide_option'] = true;
      }

      if(this.currentItinerary['members'][i]['_id'] === this.currentItinerary['created_by']['_id']) {
        this.currentItinerary['members'][i]['hide_option'] = true;
      }
    }

    if(this.currentUser['id'] === this.currentItinerary['members'][0]['_id']) {
      this.masterAdmin = true;
    }

    if(this.currentItinerary['shares'].length !== 0) {
      this.shared = true;
    }
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
          this.users.splice(j,1);
          j--
        }
      }
    }
  }

  // display dropdown option for each member
  showMemberOption(i)  {
    this.showOptions[i] = true;
  }

  makeAdmin(member, i) {
    member['admin'] = true;
    this.showOptions[i] = false;

    this.currentItinerary['admin'].push(member['_id'])

    this.itineraryService.editItin(this.currentItinerary, 'edit')
        .subscribe(data => {})
  }

  showAdminInfo() {
    this.showInfo = true;
  }

  hideAdminInfo() {
    this.showInfo = false;
  }

  removeAdmin(member, i) {
    member['admin'] = false;
    this.showOptions[i] = false;

    this.currentItinerary['admin'].splice(this.currentItinerary['admin'].indexOf(member['id']), 1);

    this.itineraryService.editItin(this.currentItinerary, 'edit').subscribe(
         data => {})
  }

  removeFromItin(member, i) {
    this.showOptions[i] = false;

    this.currentItinerary['members'].splice(i, 1)

    if(member['admin']) {
      this.currentItinerary['admin'].splice(this.currentItinerary['admin'].indexOf(member['id']), 1);
    }

    this.itineraryService.editItin(this.currentItinerary, 'edit').subscribe(
         data => {})
  }

  // edit section
  saveEdit() {
    let editedDetails = this.editItineraryForm.value;

    for (let value in editedDetails)  {
      if(editedDetails[value] === null)  {
        editedDetails[value] = '';
      }
      if(editedDetails[value] !== '') {
        this.currentItinerary[value] = editedDetails[value];
      }
    }

    this.editItineraryForm.reset({
      'name': '',
      'date_from': '',
      'date_to': ''
    })

    this.itineraryService.editItin(this.currentItinerary, 'edit').subscribe(
          data => {
            this.flashMessageService.handleFlashMessage(data.message);
          })
  }

  // delete section
  delete() {
    this.deleteItinerary = true;
  }

  cancelDelete()  {
    this.deleteItinerary = false;
  }

  confirmDelete()  {
    this.itineraryService.deleteItin(this.currentItinerary)
        .subscribe(
          data => {
            this.router.navigateByUrl('/me');
            this.flashMessageService.handleFlashMessage(data.message);
        })
    this.deleteItinerary = false;
  }


  leave() {
    this.leaveItinerary = true;
  }

  cancelLeave() {
    this.leaveItinerary = false;
  }

  confirmLeave()  {
    let members = this.currentItinerary['members'];
    let admin = this.currentItinerary['admin'];

    for (let i = 0; i < members.length; i++) {
      if(members[i]['_id'] === this.currentUser['id']) {
        if(members[i]['admin'])  {
          for (let j = 0; j < admin.length; j++) {
            if(admin[j] === this.currentUser['id']) {
              admin.splice(j,1);
              members.splice(i,1);
            } else  {
              members.splice(i,1)
            }
          }
        }
      }
    }

    this.itineraryService.editItin(this.currentItinerary, 'delete').subscribe(
        data => {
          for (let i = 0; i < this.currentItinerary['members'].length; i++) {
            this.notificationService.newNotification({
              recipient: this.currentItinerary['members'][i]['_id'],
              originator: this.currentUser['id'],
              message: " has left the itinerary - " + this.currentItinerary['name'],
              link: "/me/itinerary/" + this.currentItinerary['_id'],
              read: false
            }).subscribe(data => {})
          }
          this.router.navigateByUrl('/me');
        })
  }

  // share section
  share() {
    this.shareItin = true;
  }

  cancelShare() {
    this.shareItin = false;
    this.itemsSelected = false;
    this.selectedUsers = [];
    this.filteredResult = [];
    this.users.push.apply(this.users, this.selectedUsers);
  }

  toggleShareAll()  {
    this.shareAll = !this.shareAll;
    for (let i = 0; i < this.shareIndex.length; i++) {
      this.shareIndex[i] = this.shareAll;
    }
  }

  toggleShare(index)  {
    this.shareIndex[index] = !this.shareIndex[index]
  }

  toggleShareResource(index)  {
    this.shareIndexResource[index] = !this.shareIndexResource[index]
  }

  selectUsers() {
    this.itemsSelected = true;
  }

  selectItems() {
    this.itemsSelected = false;
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
          this.shareEvents(data.itinerary);
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

    this.itineraryService.editItin(this.currentItinerary, 'edit').subscribe(
      result => {})
  }

  shareEvents(itinerary) {
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
    this.selectedUsers = [];
    this.filteredResult = [];
  }

}
