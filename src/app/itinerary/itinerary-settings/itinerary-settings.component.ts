import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Rx';

import { ItineraryService }     from '../itinerary.service';
import { Itinerary }            from '../itinerary';
import { UserService }          from '../../user';
import { FlashMessageService }  from '../../flash-message';
import { NotificationService }  from '../../notifications';

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
  creator = false;

  showInfo = false;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private itineraryService: ItineraryService,
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
                                               this.sortAdmin();
                                             })

    this.currentUserSubscription = this.userService.updateCurrentUser.subscribe(
                                        result => {
                                          this.currentUser = result;
                                          this.checkUserStatus();
                                        })
  }

  ngOnDestroy() {
    this.currentUserSubscription.unsubscribe();
    this.currentItinerarySubscription.unsubscribe();
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

  checkUserStatus()  {
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

    if(this.currentUser['id'] === this.currentItinerary['created_by']['_id']) {
      this.creator = true;
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

  }

}
