import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Title }        from '@angular/platform-browser';

import { AuthService }    from '../auth.service';
import { LoadingService } from '../../loading';

@Component({
  selector: 'ww-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  fpForm: FormGroup;
  resetEmail = false;
  email = '';

  constructor(
    private titleService: Title,
    private authService: AuthService,
    private loadingService: LoadingService,
    private formBuilder: FormBuilder,
    private router: Router) {
    this.fpForm = formBuilder.group({
      'email' : ['', Validators.compose([ Validators.required, this.validEmail ])],
    })
   }

  ngOnInit() {
    this.titleService.setTitle("Forgot password")
    this.loadingService.setLoader(false, "");
  }

  reset() {
    this.loadingService.setLoader(true, "Sending your request");

    this.authService.forget(this.fpForm.value).subscribe(
      data => {
        this.email = this.fpForm.value.email;
        this.resetEmail = true;
        this.loadingService.setLoader(false, "");
      })
  }

  routeToHome() {
    this.resetEmail = false;
    this.router.navigateByUrl('/');

    this.loadingService.setLoader(true, "");
  }

  validEmail(control: FormControl): {[s: string]: boolean} {
      if (!control.value.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
          return {invalidEmail: true};
      }
  }
}
