import { Component, OnInit, OnDestroy, Renderer2 } from '@angular/core';

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
  showSignup = false;

  constructor(
    private renderer: Renderer2,
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
            this.loadingService.setLoader(true, "get ready to wonder wander");

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

  seeSlideShow()  {

  }

  getSignin() {
    this.showSignin = true;
    this.preventScroll(true);
  }

  getSignup() {
    this.showSignup = true;
    this.preventScroll(true);
  }

  hideSignin(event)  {
    this.showSignin = false;
    this.preventScroll(false);
  }

  hideSignup(event)  {
    this.showSignup = false;
    this.preventScroll(false);
  }

  preventScroll(value)  {
    if(value) {
      this.renderer.addClass(document.body, 'prevent-scroll');
    } else  {
      this.renderer.removeClass(document.body, 'prevent-scroll');
    }
  }
}
