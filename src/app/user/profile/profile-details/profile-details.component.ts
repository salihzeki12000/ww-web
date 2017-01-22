import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';

import { User } from '../../user';
import { UserService } from '../../user.service';
import { FlashMessageService } from '../../../flash-message';

@Component({
  selector: 'ww-profile-details',
  templateUrl: './profile-details.component.html',
  styleUrls: ['./profile-details.component.scss']
})
export class ProfileDetailsComponent implements OnInit {
  user: User;
  profileUpdateForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private flashMessageService: FlashMessageService,
    private router: Router) {
      this.profileUpdateForm = this.formBuilder.group({
        'username': '',
        'email': '',
        'description': '',
      })
    }

  ngOnInit() {
    this.userService.getCurrentUserDetails()
        .subscribe(
          data => {
            this.user = data;
        },
          error => console.error(error)
      );
  }

  onDelete()  {
    // this.userService.deleteUser()
    //     .subscribe(
    //       data => {
    //         console.log(data);
    //         this.router.navigateByUrl('/');
    //     });
  }

  onSubmit()  {
    let editedProfile = this.profileUpdateForm.value;

    for (let value in editedProfile)  {
      if(editedProfile[value] === null) {
        editedProfile[value] = '';
      }
      if(editedProfile[value] !== '') {
        this.user[value] = editedProfile[value]
      }
    }

    this.userService.editUser(this.user)
        .subscribe(
          result => {
            this.flashMessageService.handleFlashMessage(result.message);
            this.router.navigateByUrl('/me')
          }
        )
  }

}
