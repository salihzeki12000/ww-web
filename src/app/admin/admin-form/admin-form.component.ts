import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';

import { AdminService } from '../admin.service';

@Component({
  selector: 'ww-admin-form',
  templateUrl: './admin-form.component.html',
  styleUrls: ['./admin-form.component.scss']
})
export class AdminFormComponent implements OnInit {
  newAdminForm: FormGroup;
  @Output() hideAdminForm = new EventEmitter();

  constructor(
    private adminService: AdminService,
    private formBuilder: FormBuilder) {
      this.newAdminForm = this.formBuilder.group({
        'email': ['', Validators.compose([ Validators.required, this.validEmail ])],
        'role' : ''
      })
    }

  ngOnInit() {
  }

  cancelForm() {
    this.hideAdminForm.emit(false);
  }

  onSubmit()  {
    this.cancelForm();

    this.adminService.addAdmin(this.newAdminForm.value).subscribe(
      result => {
        console.log(result);
      }
    )
  }

  validEmail(control: FormControl): {[s: string]: boolean} {
      if (!control.value.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
          return {invalidEmail: true};
      }
  }

}
