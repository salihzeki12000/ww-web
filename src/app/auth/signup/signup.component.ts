import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';

import { User, UserService } from '../../user'
import { AuthService }  from '../auth.service';

@Component({
  selector: 'ww-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private router: Router) {
    this.signupForm = formBuilder.group({
      'username' : ['', Validators.required],
      'email' : ['', Validators.compose([ Validators.required, this.validEmail ])],
      'password' : ['', Validators.required],
      'passwordConfirmation' : ['', Validators.compose([ Validators.required, this.passwordsAreEqual.bind(this) ])],
    });
  }

  onSubmit()  {
    this.authService.signup(this.signupForm.value)
        .subscribe(
          data => {
            console.log(data);
            this.userService.getCurrentUserDetails()
                .subscribe( data => {
                  this.router.navigateByUrl('/me');
                } );
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
          return {passwordsNotMatch: true};
      }
      if (control.value !== this.signupForm.controls['password'].value) {
          return {passwordsNotMatch: true};
      }
  }

  ngOnInit() {
  }

}
