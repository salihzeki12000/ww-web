import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs/Rx';

import { ItineraryService } from '../../itinerary.service';
import { ResourceService } from '../resource.service';
import { FlashMessageService } from '../../../flash-message';
import { UserService } from '../../../user';

@Component({
  selector: 'ww-resource-input',
  templateUrl: './resource-input.component.html',
  styleUrls: ['./resource-input.component.scss']
})
export class ResourceInputComponent implements OnInit {
  resourceForm: FormGroup;
  currentUserSubscription: Subscription;

  currentUser;
  itineraryId;

  constructor(
    private formBuilder: FormBuilder,
    private resourceService: ResourceService,
    private userService: UserService,
    private flashMessageService: FlashMessageService,
    private itineraryService: ItineraryService) {
      this.resourceForm = formBuilder.group({
        link: ['', Validators.required],
        description: '',
      })
  }

  ngOnInit() {
    this.currentUserSubscription = this.userService.updateCurrentUser
                                       .subscribe(
                                         result => {
                                           this.currentUser = result;
                                         }
                                       )
    this.itineraryId = this.itineraryService.itineraryId;
  }

  onSubmit()  {
    this.resourceService.addResource({
      link: this.resourceForm.value.link,
      description: this.resourceForm.value.description,
      itineraryId: this.itineraryId,
      user: {
        _Id: this.currentUser['id'],
        username: this.currentUser['username'],
      },
      created_at: Date.now()
    })
    .subscribe(
      result => {
        this.flashMessageService.handleFlashMessage(result.message);
      }
    )

    this.resourceForm.reset({
      link: '',
      description: '',
    })
  }



}
