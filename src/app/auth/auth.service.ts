import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Router } from '@angular/router';
declare const FB: any;
declare const gapi: any;

import 'rxjs/Rx';
import { Observable } from 'rxjs';

import { UserService } from '../user/user.service';
import { User }        from '../user/user';

@Injectable()
export class AuthService  {
  private url = 'http://localhost:9000';
  // private url = 'https://vast-island-87972.herokuapp.com';

  loginType;

  constructor(
    private http: Http,
    private router: Router,
    private userService: UserService)  {
      FB.init({
            appId      : '1751163758480192',
            cookie     : false,  // enable cookies to allow the server to access the session
            xfbml      : true,  // parse social plugins on this page
            version    : 'v2.5' // use graph api version 2.5
        });
    }

  signup(user: User)  {
    const body = JSON.stringify(user);
    const headers = new Headers({ 'Content-Type': 'application/json' });

    return this.http.post(this.url + '/users/new', body, { headers: headers })
                    .map((response: Response) => {
                      this.loginType = 'local';
                      localStorage.setItem('token', response.json()['token']);
                      return response.json();
                    })
                    .catch((error: Response) => Observable.throw(error.json()));
  }

  signin(user: User)  {
    const body = JSON.stringify(user);
    const headers = new Headers({ 'Content-Type': 'application/json' });

    return this.http.post(this.url + '/users/signin', body, { headers: headers })
                    .map((response: Response) => {
                      this.loginType = 'local';
                      localStorage.setItem('token', response.json()['token']);
                      return response.json();
                    })
                    .catch((error: Response) => Observable.throw(error.json()));
  }

  loginFacebook(user) {
    const body = JSON.stringify(user);
    const headers = new Headers({ 'Content-Type': 'application/json', 'Accept': 'application/json' });

    return this.http.post(this.url + '/users/social-login', body, { headers: headers })
                    .map((response: Response) => {
                      this.loginType = 'facebook';
                      console.log("facebook sign in")
                      localStorage.setItem('token', response.json()['token']);
                      return response.json();
                    })
                    // .catch((error: Response) => Observable.throw(error.json()));
  }

  loginGoogle(user) {
    const body = JSON.stringify(user);
    const headers = new Headers({ 'Content-Type': 'application/json', 'Accept': 'application/json' });

    return this.http.post(this.url + '/users/social-login', body, { headers: headers })
                    .map((response: Response) => {
                      this.loginType = 'google';
                      console.log("google sign in")
                      localStorage.setItem('token', response.json()['token']);
                      return response.json();
                    })
                    // .catch((error: Response) => Observable.throw(error.json()));
  }

  signoutFacebook()  {
    FB.getLoginStatus(response => {
      if (response.status === 'connected') {
        FB.logout((response) => {
          // Person is now logged out
          this.router.navigateByUrl('/signin');
          console.log("logout of facebook");
        })
      }
    });
  }

  signoutGoogle() {
    let auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(() => {
      this.router.navigateByUrl('/signin');
      console.log('google user sign out');
    });
  }

  logout()  {
    console.log(this.loginType);
    if(this.loginType === 'facebook')  {
      this.signoutFacebook();
    } else if(this.loginType === 'google')  {
      this.signoutGoogle();
    } else  {
      this.router.navigateByUrl('/signin');
    }

    localStorage.clear();
  }

  isLoggedIn()  {
    return localStorage.getItem('token') !== null;
  }
}
