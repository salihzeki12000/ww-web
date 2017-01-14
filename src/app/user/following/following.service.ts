import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import 'rxjs/Rx';
import { Observable, ReplaySubject } from 'rxjs';

import { NotificationService } from '../../notifications';

@Injectable()
export class FollowingService  {

  private url = 'https://vast-island-87972.herokuapp.com';

  constructor(
    private http: Http,
    private notificationService: NotificationService,
  )  {}

  getRelationships()  {
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';
    const headers = new Headers({ 'Content-Type': 'application/json' });
    return this.http.get(this.url + '/following' + token, { headers: headers })
                    .map((response: Response) => {
                      return response.json();
                    })
                    .catch((error: Response) => Observable.throw(error.json()));
  }

  requestFollow(following) {
    const body = JSON.stringify(following);
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';
    const headers = new Headers({ 'Content-Type': 'application/json' });
    return this.http.post(this.url + '/following/new' + token, body, { headers: headers })
                    .map((response: Response) => {
                      let following = response.json().following;
                      console.log(following);
                      this.notificationService.newNotification({
                        recipient: following.following,
                        originator: following.user,
                        message: 'has requested to follow you.',
                        read: false
                      }).subscribe( data => {});
                      return following;
                    })
                    .catch((error: Response) => Observable.throw(error.json()));
  }
}
