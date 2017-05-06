import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs/Rx';
import { Router } from '@angular/router';

import { User } from '../../user';
import { UserService } from '../../user.service';
import { FlashMessageService } from '../../../flash-message';
import { FileuploadService } from '../../../shared';

@Component({
  selector: 'ww-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss']
})
export class ProfileEditComponent implements OnInit {
  currentUser: User;
  currentUserSubscription: Subscription;

  editProfileForm: FormGroup;

  thumbnailImage;
  inputValue = '';

  genders = ['Not specified', 'male', 'female'];
  options = { types: ['(cities)']};

  fileTypeError = false;
  newProfilePic;
  newImageFile;

  city;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private flashMessageService: FlashMessageService,
    private fileuploadService: FileuploadService,
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
                                           this.thumbnailImage = this.currentUser['display_picture']
                                         }
                                       )
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

    this.fileuploadService.uploadFile(this.newImageFile)
        .subscribe(
          result => {
            this.currentUser['display_picture'] = result.secure_url;

            this.userService.editUser(this.currentUser)
                            .subscribe(
                              result => {
                                this.flashMessageService.handleFlashMessage(result.message);
                              }
                            )

            this.inputValue = null;
            this.newProfilePic = '';
            this.newImageFile = '';
            this.thumbnailImage = this.currentUser['display_picture'];
          }
        )
  }

  setCity(data) {
    this.city = {
      name: data['formatted_address'],
      lat: data['geometry'].location.lat(),
      lng: data['geometry'].location.lng(),
    }
  }

  fileUploaded(event) {
    let file = event.target.files[0];
    let type = file['type'].split('/')[0]

    if (type !== 'image') {
      this.fileTypeError = true;
    } else  {
      if(event.target.files[0]) {
        this.newImageFile = event.target.files[0];
        let reader = new FileReader();

        reader.onload = (event) =>  {
          this.newProfilePic = event['target']['result'];
          this.thumbnailImage = event['target']['result'];
        }

        reader.readAsDataURL(event.target.files[0]);
        return;
      }
    }
  }

  keepOriginal()  {
    this.inputValue = null;
    this.newProfilePic = '';
    this.newImageFile = '';
    this.thumbnailImage = this.currentUser['display_picture'];
  }

  exitError() {
    this.fileTypeError = false;
  }
}
