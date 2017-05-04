import { Component, OnInit, Renderer } from '@angular/core';

import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../auth';

@Component({
  selector: 'ww-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit {
  signinForm: FormGroup;

  showAuth = false;
  showSignin = false;

  constructor(
    private renderer: Renderer,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router) {
      this.signinForm = formBuilder.group({
        'email' : ['', Validators.compose([ Validators.required, this.validEmail ])],
        'password' : ['', Validators.required]
      })
    }

  ngOnInit() {
  }

  onSubmit()  {
    this.authService.signin(this.signinForm.value)
        .subscribe(
          data => {
            this.router.navigateByUrl('/me');
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
    this.renderer.setElementClass(document.body, 'prevent-scroll', true);
  }

  exitAuth()  {
    this.showAuth = false;
    this.renderer.setElementClass(document.body, 'prevent-scroll', false);
  }

  getSignin() {
    this.showSignin = true;
    this.renderer.setElementClass(document.body, 'prevent-scroll', true);
  }

  hideSignin() {
    this.showSignin = false;
    this.renderer.setElementClass(document.body, 'prevent-scroll', false);
  }
}
