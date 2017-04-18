import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';

import { Itinerary }             from './itinerary';
import { ItineraryService }      from './itinerary.service';
import { ItineraryEventService } from './itinerary-events/itinerary-event.service';
import { FlashMessageService }   from '../flash-message';
import { User, UserService }     from '../user';
import { ResourceService }       from './itinerary-resources/resource.service';

@Component({
  selector: 'ww-itinerary',
  templateUrl: './itinerary.component.html',
  styleUrls: ['./itinerary.component.scss']
})
export class ItineraryComponent implements OnInit {
  itinerary: Itinerary;
  basicDetailsForm: FormGroup;
  editing = false;
  deleteItinerary = false;

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
    private itineraryService: ItineraryService,
    private itineraryEventService: ItineraryEventService,
    private resourceService: ResourceService,
    private flashMessageService: FlashMessageService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder) {
      this.basicDetailsForm = this.formBuilder.group({
        'name': '',
        'dateFrom': '',
        'dateTo': ''
      })
    }

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
                userResult => { this.filterUsers(userResult.users);}
              )
        }
      );
    })
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

  editDetails() {
    this.editing = true;
  }
  cancelEdit()  {
    this.editing = false;
  }

  saveDetails() {
    let editedDetails = this.basicDetailsForm.value;

    for (let value in editedDetails)  {
      if(editedDetails[value] === null)  {
        editedDetails[value] = '';
      }
      if(editedDetails[value] !== '') {
        this.itinerary[value] = editedDetails[value];
      }
    }

    this.editing = false;

    this.basicDetailsForm.reset({
      'name': '',
      'dateFrom': '',
      'dateTo': ''
    })

    this.itineraryService.editItin(this.itinerary)
        .subscribe(
          data => {
            this.flashMessageService.handleFlashMessage(data.message);
          }
        )
  }

  confirmDelete() {
    this.deleteItinerary = true;
    this.editing = false;
  }

  cancelDelete()  {
    this.deleteItinerary = false;
  }

  onDeleteItinerary()  {
    this.itineraryService.deleteItin(this.itinerary)
        .subscribe(
          data => {
            this.router.navigateByUrl('/me');
            this.flashMessageService.handleFlashMessage(data.message);
        })
    this.deleteItinerary = false;
  }

  getUsers()  {
    this.showUsers = true;
    this.showAddNew = false;
    this.showCurrentMembers = false;
  }

  cancelShowUsers() {
    this.showUsers = false;
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
            console.log(data);
          }
        )
    this.showUsers = false;
  }

  showMembers() {
    this.showCurrentMembers = !this.showCurrentMembers;
    this.showAddNew = false;
  }

  showAddNewOptions() {
    this.showAddNew = true;
    this.showCurrentMembers = false;
  }

  newAccommodation()  {
    this.showAddNew = false;
    this.addAccommodation = true;
  }

  newTransport()  {
    this.showAddNew = false;
    this.addTransport = true;
  }

  newActivity()  {
    this.showAddNew = false;
    this.addActivity = true;
  }

  newResource()  {
    this.showAddNew = false;
    this.addResource = true;
  }

  hideAccommodationForm(hide)  {
    this.addAccommodation = false;
  }

  hideTransportForm(hide)  {
    this.addTransport = false;
  }

  hideActivityForm(hide)  {
    this.addActivity = false;
  }

  hideResourceForm(hide)  {
    this.addResource = false;
  }

  activateTab() {
    this.showAddNew = false;
    this.showCurrentMembers = false;
    this.showUsers = false;
  }

  showMenuOptions() {
    this.showMenu = true;
  }

}
