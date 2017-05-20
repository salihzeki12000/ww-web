import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import 'rxjs/Rx';
import { Observable, ReplaySubject } from 'rxjs';

import { User } from '../user';
import { ErrorMessageService } from '../error-message';

@Injectable()
export class UserService  {
  currentUser: User;

  updateCurrentUser = new ReplaySubject();
  updateAllUsers = new ReplaySubject();

  private url = 'https://vast-island-87972.herokuapp.com';

  constructor(
    private http: Http,
    private errorMessageService: ErrorMessageService)  {}

  getCurrentUser()  {
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';
    const headers = new Headers({ 'Content-Type': 'application/json' });
    return this.http.get(this.url + '/users/currentUser' + token, { headers: headers })
                    .map((response: Response) => {
                      this.currentUser = response.json().user;
                      this.sortItin(this.currentUser);
                      return this.currentUser;
                    })
                    .catch((error: Response) => {
                      console.log(error)
                      this.errorMessageService.handleErrorMessage(error.json());
                      return Observable.throw(error.json())
                    });
  }

  getAllUsers() {
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';
    const headers = new Headers({ 'Content-Type': 'application/json' });
    return this.http.get(this.url + '/users' + token, { headers: headers })
                    .map((response: Response) => response.json())
                    .catch((error: Response) => {
                      this.errorMessageService.handleErrorMessage(error.json());
                      return Observable.throw(error.json())
                    });
  }

  editUser(user: User)  {
    const body = JSON.stringify(user);
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';

    return this.http.patch( this.url + '/users/currentUser' + token, body, { headers: headers})
                    .map((response: Response) => response.json())
                    .catch((error: Response) => {
                      this.errorMessageService.handleErrorMessage(error.json());
                      return Observable.throw(error.json())
                    });
  }

  deleteUser()  {
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';
    return this.http.delete( this.url + '/users/currentUser' + token)
                    .map((response: Response) => response.json())
                    .catch((error: Response) => {
                      this.errorMessageService.handleErrorMessage(error.json());
                      return Observable.throw(error.json())
                    });
  }

  sortItin(user) {
    let currentUser = user;
    let itineraries = currentUser.itineraries;
    let today = new Date();
    let past = [];
    let upcoming = [];

    for (let i = 0; i < itineraries.length; i++) {
      let date = new Date(itineraries[i]['date_to']);

      if( date.getTime() < today.getTime()) {
        itineraries[i]['past'] = true;
        past.push(itineraries[i]);
      } else if (date.getTime() >= today.getTime()) {
        upcoming.push(itineraries[i]);
      }
    }

    past.sort((a,b)  =>  {
      return new Date(b['date_to']).getTime() - new Date(a['date_to']).getTime();
    })

    upcoming.sort((a,b)  =>  {
      return new Date(a['date_to']).getTime() - new Date(b['date_to']).getTime();
    })

    currentUser['itineraries'] = upcoming.concat(past);

    this.updateCurrentUser.next(currentUser)
  }
}
