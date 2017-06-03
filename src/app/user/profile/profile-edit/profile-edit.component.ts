import { Component, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs/Rx';
import { Router } from '@angular/router';

import { User }                from '../../user';
import { UserService }         from '../../user.service';
import { FlashMessageService } from '../../../flash-message';
import { FileuploadService }   from '../../../shared';
import { LoadingService }      from '../../../loading';
import { ErrorMessageService } from '../../../error-message';

@Component({
  selector: 'ww-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss']
})
export class ProfileEditComponent implements OnInit, OnDestroy {
  currentUser: User;
  currentUserSubscription: Subscription;

  editProfileForm: FormGroup;
  changePasswordForm: FormGroup;

  thumbnailImage;
  inputValue = '';

  genders = ['Not specified', 'male', 'female'];
  options = { types: ['(cities)'] };

  uploadText = "Change profile picture"
  fileTypeError = false;
  newProfilePic;
  newImageFile = '';

  city;
  changePw = false;

  constructor(
    private formBuilder: FormBuilder,
    private renderer: Renderer2,
    private userService: UserService,
    private flashMessageService: FlashMessageService,
    private errorMessageService: ErrorMessageService,
    private fileuploadService: FileuploadService,
    private loadingService: LoadingService,
    private router: Router) {
      this.editProfileForm = this.formBuilder.group({
        'username': ['', Validators.required],
        'description': '',
        'email' : ['', Validators.compose([ Validators.required, this.validEmail ])],
        'city': '',
        'birth_date': '',
        'gender': '',
      }),
      this.changePasswordForm = this.formBuilder.group({
        'currentPassword': ['', Validators.compose([ Validators.required, Validators.minLength(6)])],
        'newPassword': ['', Validators.compose([ Validators.required, Validators.minLength(6)])],
        'confirmNewPassword': ['', Validators.compose([ Validators.required, this.passwordsAreEqual.bind(this) ])],
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
      this.fileuploadService.uploadFile(this.newImageFile, "profile")
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
    this.loadingService.setLoader(true, "Saving your profile...");
    this.userService.editUser(this.currentUser)
                    .subscribe(
                      result => {
                        this.loadingService.setLoader(false, "");
                        this.flashMessageService.handleFlashMessage(result.message);
                        this.inputValue = null;
                        this.newProfilePic = '';
                        this.newImageFile = '';
                        this.thumbnailImage = this.currentUser['display_picture'];
                      }
                    )
  }

  searching(event) {
    if(!this.city)  {
      this.errorMessageService.handleErrorMessage({
        title: "Error while selecting new city",
        error:  {
          message: "You have pressed the enter key without selecting a city from the dropdown. Please try again."
        }
      })
    }
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

  changePassword()  {
    this.changePw = true;
    this.preventScroll(true);
  }

  cancelChangePassword()  {
    this.changePw = false;
    this.preventScroll(false);
  }

  saveNewPassword() {
    this.loadingService.setLoader(true, "Updating your password...");

    this.userService.changePassword(this.changePasswordForm.value).subscribe(
      result => {
        this.loadingService.setLoader(false, "");
        this.flashMessageService.handleFlashMessage(result.message);
        this.changePw = false;
      }
    )
  }

  validEmail(control: FormControl): {[s: string]: boolean} {
      if (!control.value.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
          return {invalidEmail: true};
      }
  }

  passwordsAreEqual(control: FormControl): {[s: string]: boolean} {
      if (!this.changePasswordForm) {
          return {notMatch: true};
      }
      if (control.value !== this.changePasswordForm.controls['newPassword'].value) {
          return {notMatch: true};
      }
  }

  confirmDelete() {

  }

  preventScroll(value)  {
    if(value) {
      this.renderer.addClass(document.body, 'prevent-scroll');
    } else  {
      this.renderer.removeClass(document.body, 'prevent-scroll');
    }
  }
}
