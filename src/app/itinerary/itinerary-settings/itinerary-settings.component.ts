import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
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
import { LoadingService }         from '../../loading';

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
    private loadingService: LoadingService,
    private router: Router) {
      this.editItineraryForm = this.formBuilder.group({
        'name': ['', Validators.required],
        'date_from': ['', Validators.required],
        'date_to': ['', Validators.required]
      })
    }

  ngOnInit() {
    this.currentItinerarySubscription = this.itineraryService.currentItinerary.subscribe(
                                             result => {
                                               this.currentItinerary = result;
                                               this.sortAdmin();
                                             })

    this.currentUserSubscription = this.userService.updateCurrentUser.subscribe(
                                        result => {
                                          this.currentUser = result;
                                          this.checkStatus();
                                          this.patchValue();
                                        })

    this.eventSubscription = this.itineraryEventService.updateEvent.subscribe(
                                  result => {
                                    // this.filterEvents(result);
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

  @HostListener('document:click', ['$event'])
  checkClick(event) {
    if(!event.target.classList.contains("fa-cog")) {
      for (let i = 0; i < this.showOptions.length; i++) {
        this.showOptions[i] = false;
      }
    }
  }

  ngOnDestroy() {
    this.currentUserSubscription.unsubscribe();
    this.currentItinerarySubscription.unsubscribe();
    this.eventSubscription.unsubscribe();
    this.updateResourcesSubscription.unsubscribe();
    this.loadingService.setLoader(true, "");
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

  patchValue()  {
    this.editItineraryForm.patchValue({
      name: this.currentItinerary['name'],
      date_from: this.currentItinerary['date_from'],
      date_to: this.currentItinerary['date_to'],
    })
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

    this.loadingService.setLoader(false, "");
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
      this.currentItinerary[value] = editedDetails[value]
    }

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
  }

}
