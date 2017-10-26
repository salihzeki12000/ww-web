import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';

import { User, UserService } from '../../user'
import { AuthService }       from '../auth.service';
import { LoadingService }    from '../../loading';
import { ItineraryService }  from '../../itinerary';

@Component({
  selector: 'ww-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;
  avatar = 'https://res.cloudinary.com/wwfileupload/image/upload/v1495091346/avatar_neutral_d43pub.png';

  @Input() reroute;
  @Input() reload;
  @Input() itinerary;
  @Output() hideSignup = new EventEmitter();

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private itineraryService: ItineraryService,
    private loadingService: LoadingService,
    private router: Router) {
    this.signupForm = formBuilder.group({
      'username' : ['', Validators.required],
      'email' : ['', Validators.compose([ Validators.required, this.validEmail ])],
      'password' : ['', Validators.compose([ Validators.required, Validators.minLength(6)])],
      'confirmPassword' : ['', Validators.compose([ Validators.required, this.passwordsAreEqual.bind(this) ])],
      'display_picture': { url: this.avatar },
    });
  }

  ngOnInit() {
    this.loadingService.setLoader(false, "");
  }

  onSubmit()  {
    this.loadingService.setLoader(true, "get ready to wonder wander");

    this.authService.signup(this.signupForm.value).subscribe(
      data => {
        // this.userService.getCurrentUser().subscribe(
        //   data => {});

        if(this.itinerary)  {
          let user = {_id: data.userId};
          this.addToItin(user);
        } else if(this.reload) {
          window.location.reload();
        } else {
          setTimeout(() =>  {
            this.router.navigateByUrl(this.reroute);
          }, 1000)
        }
      },
      error => console.error(error)
    )
  }

  addToItin(user) {
    let members = [];

    for (let i = 0; i < this.itinerary['members'].length; i++) {
      members.push(this.itinerary['members'][i]['_id']);
    }

    let index = members.indexOf(user['_id']);

    if(index === -1)  {
      this.itinerary['members'].push(user);

      this.itineraryService.updateItinUser(this.itinerary).subscribe(
        data => {
          setTimeout(() =>  {
            this.router.navigateByUrl(this.reroute);
          }, 1000)
        })
    } else  {
      this.router.navigateByUrl(this.reroute);
      window.location.reload();
    }
  }

  copyUsername(value)  {
    this.signupForm.patchValue({
      username: value.split('@')[0]
    })
  }

  validEmail(control: FormControl): {[s: string]: boolean} {
      if (!control.value.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
          return {invalidEmail: true};
      }
  }

  passwordsAreEqual(control: FormControl): {[s: string]: boolean} {
      if (!this.signupForm) {
          return {notMatch: true};
      }
      if (control.value !== this.signupForm.controls['password'].value) {
          return {notMatch: true};
      }
  }

  cancelAuth()  {
    this.hideSignup.emit(false);
  }

}
