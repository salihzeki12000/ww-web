import { Component, OnInit, OnDestroy, Renderer2, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder }    from '@angular/forms';

import { DaterangePickerComponent } from 'ng2-daterangepicker';
import { Subscription } from 'rxjs/Rx';
import { Router }       from '@angular/router';
import { Title }        from '@angular/platform-browser';

import { User }                from '../../user';
import { UserService }         from '../../user.service';
import { FlashMessageService } from '../../../flash-message';
import { FileuploadService }   from '../../../shared';
import { LoadingService }      from '../../../loading';
import { ErrorMessageService } from '../../../error-message';
import { CityService }         from '../../../cities';
import { CountryService }      from '../../../countries';

@Component({
  selector: 'ww-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss'],
})
export class ProfileEditComponent implements OnInit, OnDestroy {
  @ViewChild(DaterangePickerComponent)
  private picker: DaterangePickerComponent;

  // navigation
  profile = true;
  private = false;
  default = false;
  others = false;
  viewNav = false;

  user;
  userSubscription: Subscription;

  editProfileForm: FormGroup;
  changePasswordForm: FormGroup;

  inputValue = '';

  genders = ['Not specified', 'male', 'female'];
  options = { types: ['(cities)'] };

  birthDate;
  displayDate;

  birthDatePicker = {
    locale: { format: 'YYYY-MM-DD' },
    singleDatePicker: true,
    showDropdowns: true,
  }

  // image upload
  fileTypeError = false;
  newProfilePic;
  newImageFile = '';

  city;
  defaultCity;
  cities;
  placeIds;
  countries;
  countriesName;

  changePw = false;

  favPrivacy = false;
  itinPrivacy = false;
  itinView = false;

  deactivate = false;

  constructor(
    private titleService: Title,
    private formBuilder: FormBuilder,
    private renderer: Renderer2,
    private userService: UserService,
    private flashMessageService: FlashMessageService,
    private errorMessageService: ErrorMessageService,
    private fileuploadService: FileuploadService,
    private loadingService: LoadingService,
    private countryService: CountryService,
    private cityService: CityService,
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
    this.titleService.setTitle("Profile Edit");

    this.userSubscription = this.userService.updateCurrentUser.subscribe(
     result =>  {
       this.user = result;
       this.patchValue();

       if(this.user['birth_date'] === undefined || this.user['birth_date'] === "")  {
         this.birthDate = new Date();
         this.displayDate = "";
       } else {
         this.birthDate = this.user['birth_date'].slice(0,10);
         this.displayDate = this.user['birth_date'].slice(0,10)
       }

       this.loadingService.setLoader(false, "");
     })

     this.cityService.getCities().subscribe(
       result => {
         this.cities = result['cities'];
         this.getPlaceId();
       })

     this.countryService.getCountries().subscribe(
       result => {
         this.countries = result['countries'];
         this.getCountriesName();
       })

    this.preventScroll(false);
  }

  ngOnDestroy() {
    if(this.userSubscription) this.userSubscription.unsubscribe();

    this.loadingService.setLoader(true, "");
  }

  patchValue()  {
    this.editProfileForm.patchValue({
      username: this.user['username'],
      description: this.user['description'],
      email: this.user['email'],
      city: this.user['city'],
      birth_date: this.user['birth_date'],
      gender: this.user['gender'],
    })

    if(this.user['city'])  {
      this.defaultCity = this.user['city']['name'] + ", " + this.user['city']['country']['name'];
    } else  {
      this.defaultCity = '';
    }

    this.favPrivacy = this.user['settings']['favourite_privacy'];
    this.itinPrivacy = this.user['settings']['itinerary_privacy'];
    this.itinView = this.user['settings']['itinerary_viewonly'];
  }


  getCountriesName()  {
    this.countriesName = [];

    for(let i = 0; i < this.countries.length; i++) {
      this.countriesName.push(this.countries[i]['name']);
    }
  }

  // settings navigation
  navigate(section) {
    this.profile = false;
    this.private = false;
    this.default = false;
    this.others = false;
    this.viewNav = false;

    if(section === 'profile') this.profile = true;
    if(section === 'default') this.default = true;
    if(section === 'others') this.others = true;

    if(section === 'private') {
      this.private = true;

      if(!this.user['corporate'])  {
        this.updateDateRange();
      }
    }
  }

  updateDateRange() {
    setTimeout(() =>  {
      this.picker.datePicker.setStartDate(this.birthDate);
      this.picker.datePicker.setEndDate(this.birthDate);
    },500)
  }



  // change profile pic

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
        }

        reader.readAsDataURL(event.target.files[0]);
        return;
      }
    }
  }

  saveProfilePic()  {
    this.fileuploadService.uploadProfile(this.newImageFile).subscribe(
      result => {
        this.user['display_picture'] = {
          url: result.secure_url,
          public_id: result.public_id
        }
        this.updateProfile();
    })
  }

  cancelChangePicture()  {
    this.inputValue = null;
    this.newProfilePic = '';
    this.newImageFile = '';
  }



  // set city of residence
  getPlaceId()  {
    this.placeIds = [];

    for (let i = 0; i < this.cities.length; i++) {
      this.placeIds.push(this.cities[i]['place_id']);
    }
  }

  searching(event) {
    this.city = undefined;
    this.defaultCity = event;

    setTimeout(() =>  {
      if(!this.city)  {
        this.errorMessageService.handleErrorMessage({
          title: "Error while selecting new city",
          error:  {
            message: "You have pressed the enter key without selecting a city from the dropdown. You need to select a result from the dropdown. Please try again."
          }
        })
      }
    }, 1500)
  }

  setCity(data) {
    let index = this.placeIds.indexOf(data['place_id']);

    if(index > -1)  {
      setTimeout(() =>  {
        this.city = this.cities[index];
        this.defaultCity = this.city['name'] + ", " + this.city['country']['name'];
      }, 500)
    } else  {
      let city = {
        name: data['formatted_address'],
        lat: data['geometry'].location.lat(),
        lng: data['geometry'].location.lng(),
        place_id: data['place_id']
      }

      this.city = city;

      for (let i = 0; i < data['address_components'].length; i++) {
        if(data['address_components'][i]['types'][0] === 'country')  {
          let country = data['address_components'][i]['long_name'];

          setTimeout(() =>  {
            city['name'] = this.defaultCity.split(country)[0];
            this.checkCountry(city, country);
          }, 1000)

        }
      }
    }
  }

  checkCountry(city, country) {
    let index = this.countriesName.indexOf(country);

    if(index > -1)  {
      city['country'] = this.countries[index];
      this.addCity(city);
    } else  {
      this.countryService.addCountry(country).subscribe(
        result => {
          city['country'] = result['country'];
          this.addCity(city);
        })
    }
  }

  addCity(city) {
    this.cityService.addCity(city).subscribe(
      result => {
        this.city = result['city'];
      }
    )
  }



  // update birth date

  selectedDate(value) {
    let date = value.start._d;
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    this.birthDate = year + "-" + month + "-" + day;
    this.displayDate = this.birthDate;

    this.editProfileForm.patchValue({
      birth_date: this.birthDate,
    })
  }



  // change password

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




  // deactivate account
  confirmDeactivate() {
    this.deactivate = true;
    this.preventScroll(true);
  }

  cancelDeactivate() {
    this.deactivate = false;
    this.preventScroll(false);
  }

  deactivateAccount() {
    this.deactivate = false;
  }




  // save / undo profile

  undo()  {
    this.patchValue();
  }

  saveProfile() {
    let editedProfile = this.editProfileForm.value;

    for (let value in editedProfile)  {
      this.user[value] = editedProfile[value];
    }

    this.user['settings']['itinerary_privacy'] = this.itinPrivacy;
    this.user['settings']['favourite_privacy'] = this.favPrivacy;
    this.user['settings']['itinerary_viewonly'] = this.itinView;

    if(this.city) {
      this.user['city'] = this.city;
    }

    this.updateProfile();
  }

  updateProfile() {
    this.loadingService.setLoader(true, "Saving your profile...");
    this.userService.editUser(this.user).subscribe(
      result => {
        this.loadingService.setLoader(false, "");
        this.flashMessageService.handleFlashMessage(result.message);

        this.cancelChangePicture();
      })
  }



  // others

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

  preventScroll(value)  {
    if(value) {
      this.renderer.addClass(document.body, 'prevent-scroll');
    } else  {
      this.renderer.removeClass(document.body, 'prevent-scroll');
    }
  }
}
