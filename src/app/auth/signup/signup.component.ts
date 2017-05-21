import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';

import { User, UserService } from '../../user'
import { AuthService }       from '../auth.service';
import { LoadingService }    from '../../loading';

@Component({
  selector: 'ww-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;

  @Output() showSigninForm = new EventEmitter();
  @Output() backAuth = new EventEmitter();

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private loadingService: LoadingService,
    private router: Router) {
    this.signupForm = formBuilder.group({
      'username' : ['', Validators.required],
      'email' : ['', Validators.compose([ Validators.required, this.validEmail ])],
      'password' : ['', Validators.compose([ Validators.required, Validators.minLength(6)])],
      'passwordConfirmation' : ['', Validators.compose([ Validators.required, this.passwordsAreEqual.bind(this) ])],
      'display_picture': 'https://res.cloudinary.com/wwfileupload/image/upload/v1495091346/avatar_neutral_d43pub.png',
    });
  }

  ngOnInit() {
    this.loadingService.setLoader(false, "");
  }

  onSubmit()  {
    this.loadingService.setLoader(true, "get ready to wonder wander");

    this.authService.signup(this.signupForm.value)
        .subscribe(
          data => {
            setTimeout(() =>  {
              this.router.navigateByUrl('/me');
            }, 1000)

          },
          error => console.error(error)
        )
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
          return {otMatch: true};
      }
  }

  backToAuth() {
    this.backAuth.emit()
  }

  getSigninForm() {
    this.showSigninForm.emit()
  }

}
