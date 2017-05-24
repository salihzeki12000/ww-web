import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs/Rx';
import { Router } from '@angular/router';

import { User }                from '../../user';
import { UserService }         from '../../user.service';
import { FlashMessageService } from '../../../flash-message';
import { FileuploadService }   from '../../../shared';
import { LoadingService }      from '../../../loading';

@Component({
  selector: 'ww-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss']
})
export class ProfileEditComponent implements OnInit, OnDestroy {
  currentUser: User;
  currentUserSubscription: Subscription;

  editProfileForm: FormGroup;

  thumbnailImage;
  inputValue = '';

  genders = ['Not specified', 'male', 'female'];
  options = { types: ['(cities)']};

  uploadText = "Change profile picture"
  fileTypeError = false;
  newProfilePic;
  newImageFile = '';

  city;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private flashMessageService: FlashMessageService,
    private fileuploadService: FileuploadService,
    private loadingService: LoadingService,
    private router: Router) {
      this.editProfileForm = this.formBuilder.group({
        'username': ['', Validators.required],
        'description': '',
        // 'email': ['', Validators.required],
        'email' : ['', Validators.compose([ Validators.required, this.validEmail ])],
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
                                           this.thumbnailImage = this.currentUser['display_picture'];
                                           this.patchValue(this.currentUser);
                                         }
                                       )

    this.loadingService.setLoader(false, "");
  }

  ngOnDestroy() {
    this.currentUserSubscription.unsubscribe();
    this.loadingService.setLoader(true, "");
  }

  patchValue(user)  {
    this.editProfileForm.patchValue({
      username: user['username'],
      description: user['description'],
      email: user['email'],
      city: user['city'],
      birth_date: user['birth_date'],
      gender: user['gender'],
    })
  }

  saveProfile() {
    let editedProfile = this.editProfileForm.value;

    for (let value in editedProfile)  {
      this.currentUser[value] = editedProfile[value];
    }

    if(this.city) {
      this.currentUser['city'] = this.city;
    }

    if(this.newImageFile !== '')  {
      this.fileuploadService.uploadFile(this.newImageFile)
          .subscribe(
            result => {
              this.currentUser['display_picture'] = result.secure_url;
              this.updateProfile();
          })
    } else  {
      this.updateProfile();
    }
  }

  updateProfile() {
    this.userService.editUser(this.currentUser)
                    .subscribe(
                      result => {
                        this.flashMessageService.handleFlashMessage(result.message);
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
          this.uploadText = "Upload another picture"
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
    this.uploadText = "Change profile picture"
    this.thumbnailImage = this.currentUser['display_picture'];
  }

  validEmail(control: FormControl): {[s: string]: boolean} {
      if (!control.value.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
          return {invalidEmail: true};
      }
  }

  exitError() {
    this.fileTypeError = false;
  }
}
