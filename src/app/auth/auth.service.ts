import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Router } from '@angular/router';
declare const FB: any;
declare const gapi: any;

import 'rxjs/Rx';
import { Observable, ReplaySubject } from 'rxjs';

import { UserService } from '../user/user.service';
import { User }        from '../user/user';

import { ErrorMessageService } from '../error-message';

@Injectable()
export class AuthService  {
  // private url = 'http://localhost:9000';
  private url = 'https://vast-island-87972.herokuapp.com';
  loginType;
  newUser = false;
  updateNewUser = new ReplaySubject();

  constructor(
    private http: Http,
    private router: Router,
    private userService: UserService,
    private errorMessageService: ErrorMessageService)  {
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

    return this.http.post(this.url + '/users/new/', body, { headers: headers })
                    .map((response: Response) => {
                      this.loginType = 'local';
                      localStorage.setItem('token', response.json()['token']);
                      // this.newUser = true;
                      this.updateNewUser.next(response.json());
                      return response.json();
                    })
                    .catch((error: Response) => {
                      this.errorMessageService.handleErrorMessage(error.json());
                      return Observable.throw(error.json())
                    });
  }

  signin(user: User)  {
    const body = JSON.stringify(user);
    const headers = new Headers({ 'Content-Type': 'application/json' });

    return this.http.post(this.url + '/users/signin/', body, { headers: headers })
                    .map((response: Response) => {
                      this.loginType = 'local';
                      localStorage.setItem('token', response.json()['token']);
                      return response.json();
                    })
                    .catch((error: Response) => {
                      this.errorMessageService.handleErrorMessage(error.json());
                      return Observable.throw(error.json())
                    });
  }

  loginFacebook(user) {
    const body = JSON.stringify(user);
    const headers = new Headers({ 'Content-Type': 'application/json' });

    return this.http.post(this.url + '/users/social-login/', body, { headers: headers })
                    .map((response: Response) => {
                      this.loginType = 'facebook';
                      localStorage.setItem('token', response.json()['token']);
                      return response.json();
                    })
                    .catch((error: Response) => {
                      this.errorMessageService.handleErrorMessage(error.json());
                      return Observable.throw(error.json())
                    });
  }

  loginGoogle(user) {
    console.log(user);
    const body = JSON.stringify(user);
    const headers = new Headers({ 'Content-Type': 'application/json' });

    return this.http.post(this.url + '/users/social-login/', body, { headers: headers })
                    .map((response: Response) => {
                      this.loginType = 'google';
                      localStorage.setItem('token', response.json()['token']);
                      return response.json();
                    })
                    .catch((error: Response) => {
                      this.errorMessageService.handleErrorMessage(error.json());
                      return Observable.throw(error.json())
                    });
  }

  signoutFacebook()  {
    FB.getLoginStatus(response => {
      if (response.status === 'connected') {
        FB.logout((response) => {
          // Person is now logged out
          localStorage.clear();

          setTimeout(() =>  {
            this.router.navigateByUrl('/signin');
          },1000)
        })
      }
    });
  }

  signoutGoogle() {
    let auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(() => {
      localStorage.clear();

      setTimeout(() =>  {
        this.router.navigateByUrl('/signin');
      },1000)
    });
  }

  logout()  {
    localStorage.clear();
    console.log("logout");
    if(this.loginType === 'facebook')  {
      this.signoutFacebook();
    } else if(this.loginType === 'google')  {
      this.signoutGoogle();
    } else  {
      this.router.navigateByUrl('/');
    }

  }

  isLoggedIn()  {
    return localStorage.getItem('token') !== null;
  }
}
