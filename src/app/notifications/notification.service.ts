import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import 'rxjs/Rx';
import { Observable, ReplaySubject } from 'rxjs';

import { ErrorMessageService } from '../error-message';

@Injectable()
export class NotificationService  {

  updateNotifications = new ReplaySubject();

  private url = 'https://vast-island-87972.herokuapp.com';

  constructor(
    private http: Http,
    private errorMessageService: ErrorMessageService)  {}

  newNotification(notification) {
    const body = JSON.stringify(notification);
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';

    return this.http.post( this.url + "/notification/new" + token, body, { headers: headers })
                    .map((response: Response) =>  {
                      return response.json();
                    })
                    .catch((error: Response) => {
                      this.errorMessageService.handleErrorMessage(error.json());
                      return Observable.throw(error.json())
                    });
  }

  getNotifications(currentUserId)  {
    const currentUser = '?currentUserId=' + currentUserId;

    return this.http.get(this.url + '/notification' + currentUser)
                    .map((response: Response) => {
                      this.timeAgo(response.json().notifications)
                      return response.json();
                    })
                    .catch((error: Response) => {
                      this.errorMessageService.handleErrorMessage(error.json());
                      return Observable.throw(error.json())
                    });
  }

  timeAgo(notifications) {
    for (let i = 0; i < notifications.length; i++) {
      let timePosted = new Date(notifications[i]['created_at']).getTime();
      let timeDiff = (Date.now() - timePosted) / 1000;

      let units = [
        { name: "MINUTE", in_seconds: 60, limit: 3600 },
        { name: "HOUR", in_seconds: 3600, limit: 86400 },
        { name: "DAY", in_seconds: 86400, limit: 604800 }
      ];

      if(timeDiff < 60) {
        notifications[i]['time_ago'] = "LESS THAN A MINUTE AGO"
      } else if(timeDiff > 604800) {
        notifications[i]['time_ago'] = '';
      } else {
        for (let j = 0; j < units.length; j++) {
          if(timeDiff < units[j]['limit'])  {
            let timeAgo =  Math.floor(timeDiff / units[j].in_seconds);
            notifications[i]['time_ago'] = timeAgo + " " + units[j].name + (timeAgo > 1 ? "S" : "") + " AGO";
            j = units.length;
          };
        }
      }
    }
    this.updateNotifications.next(notifications);
  }
}
