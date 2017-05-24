import { Component, OnInit, OnDestroy, Input, Renderer, HostListener } from '@angular/core';
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
export class ResourceComponent implements OnInit, OnDestroy {
  @Input() resource: Resource;
  @Input() currentItinerary;
  @Input() totalResources;
  @Input() index;

  currentUserSubscription: Subscription;
  currentUser;
  sameUser;

  showMenu = false;
  editing = false;
  deleteResource = false;

  editResourceForm: FormGroup;

  constructor(
    private renderer: Renderer,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private flashMessageService: FlashMessageService,
    private resourceService: ResourceService) {
      this.editResourceForm = this.formBuilder.group({
        'title': '',
        'content': '',
      })
    }

  ngOnInit() {
    this.currentUserSubscription = this.userService.updateCurrentUser.subscribe(
                                       result => {
                                         this.currentUser = result;
                                         this.checkSameUser();
                                       })
  }

  @HostListener('document:click', ['$event'])
  checkClick(event) {
    if(!event.target.classList.contains("dots-menu")) {
      this.showMenu = false;
    }
  }

  ngOnDestroy() {
    this.currentUserSubscription.unsubscribe();
  }

  checkSameUser() {
    if(this.currentUser['id'] === this.resource['user']['_id']) {
      this.sameUser = true;
    } else  {
      let admin = this.currentItinerary['admin'];
      for (let i = 0; i < admin.length; i++) {
        if(this.currentUser['id'] === admin[i]) {
          this.sameUser = true;
          i = admin.length;
        }
      }
    }
  }

  showMenuOptions() {
    this.showMenu = true;
  }

  // edit section
  edit()  {
    this.editing = true;
    this.renderer.setElementClass(document.body, 'prevent-scroll', true);
  }

  cancelEdit()  {
    this.editing = false;
    this.renderer.setElementClass(document.body, 'prevent-scroll', false);
  }

  saveEdit()  {
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

  // delete section
  delete() {
    this.deleteResource = true;
    this.renderer.setElementClass(document.body, 'prevent-scroll', true);
  }

  cancelDelete()  {
    this.deleteResource = false;
    this.renderer.setElementClass(document.body, 'prevent-scroll', false);
  }

  confirmDelete()  {
    this.resourceService.deleteResource(this.resource)
        .subscribe(
          result => {
            this.flashMessageService.handleFlashMessage(result.message);
          })
    this.deleteResource = false;
    this.renderer.setElementClass(document.body, 'prevent-scroll', false);
  }

}
