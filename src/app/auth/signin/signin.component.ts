import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';

import { User, UserService } from '../../user';
import { AuthService }       from '../auth.service';
import { LoadingService }    from '../../loading';

@Component({
  selector: 'ww-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit {
  @Output() hideSignin = new EventEmitter();

  signinForm: FormGroup;

  userId;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private loadingService: LoadingService,
    private router: Router) {
    this.signinForm = formBuilder.group({
      'email' : ['', Validators.compose([ Validators.required, this.validEmail ])],
      'password' : ['', Validators.compose([ Validators.required, Validators.minLength(6)])]
    })
  }

  ngOnInit() {
    this.loadingService.setLoader(false, "");
  }

  onSubmit()  {
    this.loadingService.setLoader(true, "get ready to wonder wander");

    this.authService.signin(this.signinForm.value)
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

  cancelAuth()  {
    this.hideSignin.emit()
  }

}
