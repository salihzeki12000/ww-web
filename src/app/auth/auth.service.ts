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
  private url = 'https://vast-island-87972.herokuapp.com';
  loginType;

  constructor(
    private http: Http,
    private router: Router,
    private userService: UserService,
    private errorMessageService: ErrorMessageService)  {
      // FB.init({
      //       appId      : '1751163758480192',
      //       cookie     : false,  // enable cookies to allow the server to access the session
      //       xfbml      : true,  // parse social plugins on this page
      //       version    : 'v2.5' // use graph api version 2.5
      //   });
    }

  signup(user: User)  {
    const body = JSON.stringify(user);
    const headers = new Headers({ 'Content-Type': 'application/json' });

    return this.http.post(this.url + '/users/new/', body, { headers: headers })
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

  forget(email)  {
    const body = JSON.stringify(email);
    const headers = new Headers({ 'Content-Type': 'application/json' });

    return this.http.post(this.url + '/users/forget/', body, { headers: headers })
                    .map((response: Response) => response.json())
                    .catch((error: Response) => {
                      this.errorMessageService.handleErrorMessage(error.json());
                      return Observable.throw(error.json())
                    });
  }

  reset(token) {
    return this.http.get(this.url + '/users/reset/' + token)
                    .map((response: Response) => response.json())
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

  verify(verify) {
    const body = JSON.stringify(verify);
    const headers = new Headers({ 'Content-Type': 'application/json' });

    return this.http.patch(this.url + '/users/verify/', body, { headers: headers })
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

  newVerification(user) {
    const body = JSON.stringify(user);
    const headers = new Headers({ 'Content-Type': 'application/json' });

    return this.http.patch( this.url + '/users/new-verify/', body, { headers: headers})
                    .map((response: Response) => response.json())
                    .catch((error: Response) => {
                      this.errorMessageService.handleErrorMessage(error.json());
                      return Observable.throw(error.json())
                    });
  }

  // loginFacebook(user) {
  //   const body = JSON.stringify(user);
  //   const headers = new Headers({ 'Content-Type': 'application/json' });
  //
  //   return this.http.post(this.url + '/users/social-login/', body, { headers: headers })
  //                   .map((response: Response) => {
  //                     this.loginType = 'facebook';
  //                     localStorage.setItem('token', response.json()['token']);
  //  //
  //                     return response.json();
  //                   })
  //                   .catch((error: Response) => {
  //                     this.errorMessageService.handleErrorMessage(error.json());
  //                     return Observable.throw(error.json())
  //                   });
  // }

  loginGoogle(user) {
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

  setLogin(type)  {
    this.loginType = type;
  }

  signoutFacebook()  {
    FB.getLoginStatus(response => {
      if (response.status === 'connected') {
        FB.logout((response) => {
          // Person is now logged out
          localStorage.clear();

          setTimeout(() =>  {
            this.router.navigateByUrl('/');
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
        this.router.navigateByUrl('/');
      },1000)
    });
  }

  logout()  {
    localStorage.clear();
    console.log("logout");
    if(this.loginType === 'facebook' || this.loginType === 'fb')  {
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
