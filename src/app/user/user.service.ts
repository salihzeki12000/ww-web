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
  updateDisplayUser = new ReplaySubject();

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
                      console.log(error);
                      this.errorMessageService.handleErrorMessage(error.json());
                      return Observable.throw(error.json())
                    });
  }

  getUser(id) {
    const userId = id;
    return this.http.get( this.url + "/users/displayUser/" + userId)
                    .map((response: Response) => {
                      this.updateDisplayUser.next(response.json().user);
                      return response.json();
                    })
                    .catch((error: Response) => {
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
                      console.log(error)
                      this.errorMessageService.handleErrorMessage(error.json());
                      return Observable.throw(error.json())
                    });
  }

  resetPassword(password) {
    const body = JSON.stringify(password);
    const headers = new Headers({ 'Content-Type': 'application/json' });

    return this.http.patch( this.url + '/users/resetPassword', body, {headers: headers})
                    .map((response: Response) => response.json())
                    .catch((error: Response) => {
                      this.errorMessageService.handleErrorMessage(error.json());
                      return Observable.throw(error.json())
                    });
  }

  changePassword(password)  {
    const body = JSON.stringify(password);
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';

    return this.http.patch( this.url + '/users/changePassword' + token, body, { headers: headers})
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

  handleItinChange(itinerary)  {
    let method = itinerary['method'];
    let itineraries = this.currentUser['itineraries'];
    let index = -1;

    if(method === 'add')  {
      itineraries.push(itinerary);
    }

    for (let i = 0; i < itineraries.length; i++) {
      if(itineraries[i]['_id'] === itinerary['_id'])  {
        index = i;
      };
    }

    if(index > -1)  {
      if(method === 'edit') {
        itineraries[index] = itinerary;
      } else if (method === 'delete') {
        itineraries.splice(index, 1);
      }
    }

    this.sortItin(this.currentUser)
  }

  sortItin(currentUser) {
    let itineraries = currentUser.itineraries;
    let today = new Date();
    let completed = [];
    let upcoming = [];
    let undated = [];

    for (let i = 0; i < itineraries.length; i++) {

      if(itineraries[i]['num_days'])  {
        undated.push(itineraries[i])
      } else  {

        let date = new Date(itineraries[i]['date_to']);

        if( date.getTime() < today.getTime()) {
          itineraries[i]['completed'] = true;
          completed.push(itineraries[i]);
        } else if (date.getTime() >= today.getTime()) {
          upcoming.push(itineraries[i]);
        }

      }

    }

    undated.sort((a,b)  =>  {
      if(a['name'] < b['name']) return -1;
      if(a['name'] > b['name']) return 1;
      return 0;
    })

    completed.sort((a,b)  =>  {
      return new Date(b['date_to']).getTime() - new Date(a['date_to']).getTime();
    })

    upcoming.sort((a,b)  =>  {
      return new Date(a['date_to']).getTime() - new Date(b['date_to']).getTime();
    })

    currentUser['itineraries'] = undated.concat(upcoming, completed);

    this.updateCurrentUser.next(currentUser)
  }
}
