import { Component, OnInit, Input, Renderer } from '@angular/core';
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
  sameUser = true;
  showMenu = false;

  constructor(
    private renderer: Renderer,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private flashMessageService: FlashMessageService,
    private resourceService: ResourceService) {
      this.editResourceForm = this.formBuilder.group({
        'title': '',
        'content': '',
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
    // if(this.currentUser['id'] === this.resource['user']['_id']) {
    //   this.sameUser = true;
    // }
  }

  onEdit()  {
    this.editing = true;
    this.renderer.setElementClass(document.body, 'prevent-scroll', true);
  }

  cancelEditResource()  {
    this.editing = false;
    this.renderer.setElementClass(document.body, 'prevent-scroll', false);
  }

  onUpdateResource()  {
    let editedResource = this.editResourceForm.value;
    console.log(editedResource);
    for (let value in editedResource) {
      if(editedResource[value] === null)  {
        editedResource[value] = '';
      }
      if(editedResource[value] !== '')  {
        this.resource[value] = editedResource[value];
      }
    }

    this.resourceService.editResource(this.resource)
        .subscribe(
          result => {
            this.flashMessageService.handleFlashMessage(result.message);
          })
    this.editing = false;
    this.renderer.setElementClass(document.body, 'prevent-scroll', false);
  }

  confirmDelete() {
    this.deleteResource = true;
    this.renderer.setElementClass(document.body, 'prevent-scroll', true);
  }

  cancelDelete()  {
    this.deleteResource = false;
    this.renderer.setElementClass(document.body, 'prevent-scroll', false);
  }

  onDeleteResource()  {
    this.resourceService.deleteResource(this.resource)
        .subscribe(
          result => {
            this.flashMessageService.handleFlashMessage(result.message);
          })
    this.deleteResource = false;
    this.renderer.setElementClass(document.body, 'prevent-scroll', false);
  }

  showMenuOptions() {
    this.showMenu = true;
  }
}
