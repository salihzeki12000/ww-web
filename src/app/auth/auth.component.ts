import { Component, OnInit, NgZone, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
declare const FB: any;
declare const gapi: any;

import { AuthService }    from './auth.service';
import { UserService }    from '../user';
import { LoadingService } from '../loading';

@Component({
  selector: 'ww-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit, AfterViewInit {
  signinHome = true;
  signinForm = false;
  signupForm = false;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private loadingService: LoadingService,
    private _zone: NgZone,
    private router: Router)  {
      FB.init({
            appId      : '1751057965157438', //1751057965157438 - 1751163758480192
            cookie     : false,  // enable cookies to allow the server to access the session
            xfbml      : true,  // parse social plugins on this page
            version    : 'v2.5' // use graph api version 2.5
        });
    }

  ngOnInit()  {
    this.loadingService.setLoader(false, "");
    // FB.getLoginStatus(response => {
    //   this.statusChangeCallback(response);
    // });
  }

  statusChangeCallback(res) {
    // https://developers.facebook.com/docs/facebook-login/web
    if (res.status === 'connected') {
      this.getDetails()
    }
  };

  loginFacebook() {
    FB.login((response) =>  {
      this.getDetails();
    }, {scope: 'email,user_location' });
  }

  getDetails() {
    FB.api('/me?fields=id,name,gender,picture.width(150).height(150),email',
      (result) => {
        if (result && !result.error) {
          console.log(result)
          // if no email, to open up a modal notice and to sign up or sign in
          result['username'] = result['name'];
          result['display_picture'] = result['picture']['data']['url'];

          console.log(result);
          this.authService.loginFacebook(result)
              .subscribe(
                data => {
                  this.loadingService.setLoader(true, "get ready to wonder wander");

                  setTimeout(() =>  {
                    this.router.navigateByUrl('/me');
                  }, 1000)
                }
              )
        } else {
          console.log(result.error);
        }
      });
  }

  // https://developers.google.com/identity/sign-in/web/sign-in
  ngAfterViewInit() {
    gapi.signin2.render('google-login', {
      'longtitle': true,
      'width': 300,
      'height': 30,
      'theme': 'dark',
      // 'onsuccess': params => this.loginGoogle(params),
      // 'onfailure': onFailure
    })
  }

  // http://stackoverflow.com/questions/35530483/google-sign-in-for-websites-and-angular-2-using-typescript
  loginGoogle(user) {
    let profile = user.getBasicProfile();
    let email = profile.getEmail();
    let username = profile.getName();
    let display_picture = profile.getImageUrl();
    console.log("log in google")
    this.authService.loginGoogle({
      username: username,
      email: email,
      display_picture: display_picture,
    }).subscribe( data => {
      console.log("log in google ok")
      this.loadingService.setLoader(true, "get ready to wonder wander");

      setTimeout(() =>  {
        this.router.navigateByUrl('/me');
      }, 1000)
    });
  }

  showSigninForm() {
    this.signinForm = true;
    this.signinHome = false;
    this.signupForm = false;
  }

  showSignupForm()  {
    this.signupForm = true;
    this.signinForm = false;
    this.signinHome = false;
  }

  showAuth()  {
    this.signinHome = true;
    this.signupForm = false;
    this.signinForm = false;
  }
}
