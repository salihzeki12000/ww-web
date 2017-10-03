import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Router } from '@angular/router';
import 'rxjs/Rx';
import { Observable, ReplaySubject } from 'rxjs';

import { ErrorMessageService } from '../error-message';

@Injectable()
export class AdminService {

  updateCurrentAdmin = new ReplaySubject();

  private url = 'https://vast-island-87972.herokuapp.com';

  constructor(
    private http: Http,
    private router: Router,
    private errorMessageService: ErrorMessageService)  {}


  addAdmin(admin)  {
    const body = JSON.stringify(admin);
    const headers = new Headers({ 'Content-Type': 'application/json' });

    return this.http.post(this.url + '/admin/new/', body, { headers: headers })
                    .map((response: Response) => response.json())
                    .catch((error: Response) => {
                      this.errorMessageService.handleErrorMessage(error.json());
                      return Observable.throw(error.json())
                    });
  }

  setPassword(admin) {
    const body = JSON.stringify(admin);
    const headers = new Headers({ 'Content-Type': 'application/json' });

    return this.http.patch( this.url + '/admin/setPassword', body, { headers: headers})
                    .map((response: Response) => response.json())
                    .catch((error: Response) => {
                      this.errorMessageService.handleErrorMessage(error.json());
                      return Observable.throw(error.json())
                    });
  }

  signin(admin)  {
    const body = JSON.stringify(admin);
    const headers = new Headers({ 'Content-Type': 'application/json' });

    return this.http.post(this.url + '/admin/signin/', body, { headers: headers })
                    .map((response: Response) => {
                      localStorage.setItem('token', response.json()['token']);
                      return response.json();
                    })
                    .catch((error: Response) => {
                      this.errorMessageService.handleErrorMessage(error.json());
                      return Observable.throw(error.json())
                    });
  }

  getAdmin(adminId)  {
    return this.http.get( this.url + "/admin/display/" + adminId)
                    .map((response: Response) => response.json())
                    .catch((error: Response) => {
                      this.errorMessageService.handleErrorMessage(error.json());
                      return Observable.throw(error.json())
                    });
  }

  getCurrentAdmin() {
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';
    const headers = new Headers({ 'Content-Type': 'application/json' });

    return this.http.get(this.url + '/admin/currentAdmin' + token, { headers: headers })
                    .map((response: Response) => {
                      this.updateCurrentAdmin.next(response.json().admin);
                      return response.json();
                    })
                    .catch((error: Response) => {
                      console.log(error);
                      this.errorMessageService.handleErrorMessage(error.json());
                      return Observable.throw(error.json())
                    });
  }

  logout()  {
    localStorage.clear();
    this.router.navigateByUrl('/');

    console.log("admin logout");
  }

  isLoggedIn()  {
    return localStorage.getItem('token') !== null;
  }
}
