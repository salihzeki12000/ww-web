import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';

import { User, UserService } from '../../user';
import { AuthService } from '../auth.service';

@Component({
  selector: 'ww-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit {
  signinForm: FormGroup;
  //emits to auth.component.html
  @Output() hideSigninForm = new EventEmitter();
  userId;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private router: Router) {
    this.signinForm = formBuilder.group({
      'email' : ['', Validators.compose([ Validators.required, this.validEmail ])],
      'password' : ['', Validators.required]
    })
  }

  onSubmit()  {
    this.authService.signin(this.signinForm.value)
        .subscribe(
          data => {
            console.log(data);
            this.userService.getCurrentUserDetails()
                .subscribe( data => {
                  this.router.navigateByUrl('/me');
                });
          },
          error => console.error(error)
        )
  }

  validEmail(control: FormControl): {[s: string]: boolean} {
      if (!control.value.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
          return {invalidEmail: true};
      }
  }

  showSigninForm() {
    this.hideSigninForm.emit()
  }

  ngOnInit() {
  }

}
