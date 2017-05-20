import { Component, OnInit, OnDestroy, Renderer } from '@angular/core';

import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService }    from '../auth';
import { LoadingService } from '../loading';

@Component({
  selector: 'ww-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit, OnDestroy {
  signinForm: FormGroup;

  showAuth = false;
  showSignin = false;

  constructor(
    private renderer: Renderer,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private loadingService: LoadingService,
    private router: Router) {
      this.signinForm = formBuilder.group({
        'email' : ['', Validators.compose([ Validators.required, this.validEmail ])],
        'password' : ['', Validators.required]
      })
    }

  ngOnInit() {
    this.loadingService.setLoader(false, "");
  }

  ngOnDestroy() {
  }

  onSubmit()  {
    this.authService.signin(this.signinForm.value)
        .subscribe(
          data => {
            this.loadingService.setLoader(true, "Signing in...");

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

  getAuth() {
    this.showAuth = true;
  }

  exitAuth()  {
    this.showAuth = false;
  }

  getSignin() {
    this.showSignin = true;
  }

  hideSignin() {
    this.showSignin = false;
  }
}
