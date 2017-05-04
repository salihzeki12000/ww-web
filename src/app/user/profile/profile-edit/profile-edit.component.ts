import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs/Rx';
import { Router } from '@angular/router';

import { User } from '../../user';
import { UserService } from '../../user.service';
import { FlashMessageService } from '../../../flash-message';

@Component({
  selector: 'ww-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss']
})
export class ProfileEditComponent implements OnInit {
  currentUser: User;
  currentUserSubscription: Subscription;

  editProfileForm: FormGroup;
  profileEdit = false;

  genders = ['Not specified', 'male', 'female'];
  options = {
    types: ['(cities)'],
  };

  city;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private flashMessageService: FlashMessageService,
    private router: Router) {
      this.editProfileForm = this.formBuilder.group({
        'username': '',
        'description': '',
        'email': '',
        'city': '',
        'birth_date': '',
        'gender': '',
      })
    }

  ngOnInit() {
    this.currentUserSubscription = this.userService.updateCurrentUser
                                       .subscribe(
                                         result =>  {
                                           this.currentUser = result;
                                         }
                                       )

  }

  editProfile() {
    this.profileEdit = true;
  }

  cancelEdit()  {
    this.profileEdit = false;
  }

  saveProfile() {
    let editedProfile = this.editProfileForm.value;

    for (let value in editedProfile)  {
      if(editedProfile[value] === null) {
        editedProfile[value] = '';
      }
      if(editedProfile[value] !== '') {
        this.currentUser[value] = editedProfile[value]
      }
    }

    if(this.city) {
      this.currentUser['city'] = this.city;
    }

    this.userService.editUser(this.currentUser)
                    .subscribe(
                      result => {
                        this.flashMessageService.handleFlashMessage(result.message);
                      }
                    )

    this.profileEdit = false;
  }

  setCity(data) {
    this.city = {
      name: data['formatted_address'],
      lat: data['geometry'].location.lat(),
      lng: data['geometry'].location.lng(),
    }
  }

  fileUploaded(event) {
    console.log(event);
    console.log(event.target.files)
  }

  upload()  {
    
  }
}
