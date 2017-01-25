import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import 'rxjs/Rx';
import { Observable, ReplaySubject } from 'rxjs';

@Injectable()
export class NotificationService  {

  private url = 'https://vast-island-87972.herokuapp.com';

  constructor( private http: Http)  {}

  newNotification(notification) {
    const body = JSON.stringify(notification);
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';

    return this.http.post( this.url + "/notification/new" + token, body, { headers: headers })
                    .map((response: Response) =>  {
                      return response.json();
                    })
                    .catch((error: Response) => Observable.throw(error.json()));
  }

  getNotifications(currentUserId)  {
    const currentUser = '?currentUserId=' + currentUserId;

    return this.http.get(this.url + '/notification' + currentUser)
                    .map((response: Response) => {
                      return response.json();
                    })
                    .catch((error: Response) => Observable.throw(error.json()));
  }
}
