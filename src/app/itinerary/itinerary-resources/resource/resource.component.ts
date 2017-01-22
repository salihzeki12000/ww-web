import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs/Rx';

import { Resource }            from '../resource';
import { ResourceService }     from '../resource.service';
import { FlashMessageService } from '../../../flash-message';
import { UserService }         from '../../../user';

@Component({
  selector: 'ww-resource',
  templateUrl: './resource.component.html',
  styleUrls: ['./resource.component.scss']
})
export class ResourceComponent implements OnInit {
  @Input() resource: Resource;
  editing = false;
  deleteResource = false;

  editResourceForm: FormGroup;

  currentUserSubscription: Subscription;
  currentUser;
  sameUser;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private flashMessageService: FlashMessageService,
    private resourceService: ResourceService) {
      this.editResourceForm = this.formBuilder.group({
        'link': '',
        'description': ''
      })
    }

  ngOnInit() {
    this.currentUserSubscription = this.userService.updateCurrentUser
                                       .subscribe(
                                         result => {
                                           this.currentUser = result;
                                           this.checkSameUser();
                                         }
                                       )
  }

  checkSameUser() {
    if(this.currentUser['id'] === this.resource['user']['_id']) {
      this.sameUser = true;
    }
  }

  onEdit()  {
    this.editing = true;
  }

  cancelEditResource()  {
    this.editing = false;
  }

  onUpdateResource()  {
    let editedResource = this.editResourceForm.value;

    for (let value in editedResource) {
      if(editedResource[value] === null)  {
        editedResource[value] = '';
      }
      if(editedResource[value] === '')  {
        this.resource[value] = editedResource[value];
      }
    }

    this.resourceService.editResource(this.resource)
        .subscribe(
          result => {
            this.flashMessageService.handleFlashMessage(result.message);
          })
    this.editing = false;
  }

  confirmDelete() {
    this.deleteResource = true;
  }

  cancelDelete()  {
    this.deleteResource = false;
  }

  onDeleteResource()  {
    this.resourceService.deleteResource(this.resource)
        .subscribe(
          result => {
            this.flashMessageService.handleFlashMessage(result.message);
          })
    this.deleteResource = false;
  }

}
