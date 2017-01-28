import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import 'rxjs/Rx';
import { Observable, ReplaySubject } from 'rxjs';

import { User } from '../user';

@Injectable()
export class UserService  {
  currentUser: User;
  updateCurrentUser = new ReplaySubject();

  // private url = 'http://localhost:9000';
  private url = 'https://vast-island-87972.herokuapp.com';

  constructor( private http: Http)  {}

  getCurrentUserDetails()  {
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';
    const headers = new Headers({ 'Content-Type': 'application/json' });
    return this.http.get(this.url + '/users/currentUser' + token, { headers: headers })
                    .map((response: Response) => {
                      this.currentUser = response.json().user;
                      this.updateCurrentUser.next(this.currentUser);
                      return this.currentUser;
                    })
                    .catch((error: Response) => Observable.throw(error.json()));
  }

  getAllUsers() {
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';
    const headers = new Headers({ 'Content-Type': 'application/json' });
    return this.http.get(this.url + '/users' + token, { headers: headers })
                    .map((response: Response) => {
                       return response.json();
                    })
                    .catch((error: Response) => Observable.throw(error.json()));
  }

  editUser(user: User)  {
    const body = JSON.stringify(user);
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';

    return this.http.patch( this.url + '/users/currentUser' + token, body, { headers: headers})
                    .map((response: Response) => response.json())
                    .catch((error: Response) => Observable.throw(error.json()));
  }

  deleteUser()  {
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';
    return this.http.delete( this.url + '/users/currentUser' + token)
                    .map((response: Response) => response.json())
                    .catch((error: Response) => Observable.throw(error.json()));
  }
}
