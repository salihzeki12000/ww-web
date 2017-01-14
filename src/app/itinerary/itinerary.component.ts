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
  members = [];
  validAddUser = false;

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
              .subscribe(
                result => {}
              )

          this.resourceService.getResources(id)
              .subscribe(
                result => {}
              )
        }
      );
    })



    this.userService.getAllUsers()
        .subscribe(
          result => {
            this.users = result.users;
          }
        )
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
  }

  cancelShowUsers() {
    this.showUsers = false;
  }

  toggleAdd(user) {
    let index = this.members.indexOf(user);
    if(index > -1 ) {
      this.members.splice(index, 1);
    }

    if(index < 0 )  {
      this.members.push(user);
    }

    if(this.members.length > 0) {
      this.validAddUser = true;
    }

    if(this.members.length < 1) {
      this.validAddUser = false;
    }
  }

  addMembers()  {
    for (let i = 0; i < this.members.length; i++) {
      this.itinerary['members'].push(this.members[i]);
    }
    this.itineraryService.editItin(this.itinerary)
        .subscribe(
          data => {
            console.log(data);
          }
        )
    this.showUsers = false;
  }

}
