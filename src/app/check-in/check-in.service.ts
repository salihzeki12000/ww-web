import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import 'rxjs/Rx';
import { Observable, ReplaySubject } from 'rxjs';

import { ErrorMessageService } from '../error-message';

@Injectable()
export class CheckInService {
  private url = 'https://vast-island-87972.herokuapp.com';

  checkins = [];
  updateCheckIns = new ReplaySubject();

  constructor(
    private http: Http,
    private errorMessageService: ErrorMessageService)  {}

  getCheckins(userId) {
    return this.http.get( this.url + "/checkin/displayUser/" + userId)
                    .map((response: Response) => {
                      this.checkins = response.json().checkins;
                      this.updateCheckIns.next(this.checkins)
                      return response.json()
                    })
                    .catch((error: Response) => {
                      console.log(error)
                      this.errorMessageService.handleErrorMessage(error.json());
                      return Observable.throw(error.json())
                    });
  }

  addCheckin(checkin) {
    console.log(checkin)
    const body = JSON.stringify(checkin);
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';

    return this.http.post( this.url + "/checkin/new/" + token, body, { headers: headers })
                    .map((response: Response) => {
                      this.checkins.push(checkin);
                      this.updateCheckIns.next(this.checkins)
                      return response.json()
                    })
                    .catch((error: Response) => {
                      this.errorMessageService.handleErrorMessage(error.json());
                      return Observable.throw(error.json())
                    });
  }
}
