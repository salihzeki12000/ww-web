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
  username;
  userId;
  currentUserSubscription: Subscription;

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

  onSubmit()  {
    let itinerary = this.itineraryService.itin();
    let itineraryId = itinerary['_id'];

    this.resourceService.addResource({
      link: this.resourceForm.value.link,
      description: this.resourceForm.value.description,
      itineraryId: itineraryId,
      user: {
        _Id: this.userId,
        username: this.username,
      },
      created_at: Date.now()
    })
    .subscribe(
      data => {
        this.flashMessageService.handleFlashMessage(data.message);
      },
      error => console.error(error)
    )

    this.resourceForm.reset({
      link: '',
      description: '',
    })
  }

  ngOnInit() {
    this.currentUserSubscription = this.userService.updateCurrentUser
                                       .subscribe(
                                         data => {
                                           this.userId = data['id'];
                                           this.username = data['username'];
                                         }
                                       )
  }

}
