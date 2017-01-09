import { Component, OnInit, NgZone, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
declare const FB: any;
declare const gapi: any;

import { AuthService } from './auth.service';
import { UserService } from '../user';

@Component({
  selector: 'ww-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit, AfterViewInit {
  private signinForm = false;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private _zone: NgZone,
    private router: Router)  {
      FB.init({
            appId      : '1751163758480192',
            cookie     : false,  // enable cookies to allow the server to access the session
            xfbml      : true,  // parse social plugins on this page
            version    : 'v2.5' // use graph api version 2.5
        });
    }

    // google
    // client id: '93839965709-mmulmhsh4vlqdhqdi9e41ve51julgak1.apps.googleusercontent.com'
    // secret: 'Y_iq4EPLf2QN-67KA6fjbf6-'

  ngOnInit()  {
    FB.getLoginStatus(response => {
      this.statusChangeCallback(response);
    });
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
    });
  }

  getDetails() {
    FB.api('/me?fields=id,name,gender,picture.width(150).height(150),email',
      (result) => {
        if (result && !result.error) {
          // if no email, to open up a modal notice and to sign up or sign in
          result['username'] = result['name'];
          result['displayPic'] = result['picture']['data']['url'];

          this.authService.loginFacebook(result)
              .subscribe(
                data => {
                  this.userService.getCurrentUserDetails()
                      .subscribe( result => {
                        this.router.navigateByUrl('/me');
                      } );
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
      'onsuccess': params => this.loginGoogle(params),
      // 'onfailure': onFailure
    })
  }

  // http://stackoverflow.com/questions/35530483/google-sign-in-for-websites-and-angular-2-using-typescript
  loginGoogle(user) {
    // this._zone.run(() =>  {
      let profile = user.getBasicProfile();
      let email = profile.getEmail();
      let username = profile.getName();
      let displayPic = profile.getImageUrl();

      this.authService.loginGoogle({
        username: username,
        email: email,
        displayPic: displayPic,
      }).subscribe( data => {
        this.userService.getCurrentUserDetails()
            .subscribe( result => {
              this.router.navigateByUrl('/me');
            } );
      });

    // })
  }

  showSigninForm() {
    this.signinForm = true;
  }
}
