import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';

import { Resource } from '../resource';
import { ResourceService } from '../resource.service';
// import { FlashMessageService } from '../../../../flash-message';

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

  constructor(
    private formBuilder: FormBuilder,
    // private flashMessageService: FlashMessageService,
    private resourceService: ResourceService) {
      this.editResourceForm = this.formBuilder.group({
        'link': '',
        'description': ''
      })
    }

  ngOnInit() {
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
          data => {
            // this.flashMessageService.handleFlashMessage(data.message);
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
          data => {
            // this.flashMessageService.handleFlashMessage(data.message);
          })
    this.deleteResource = false;
  }

}
