import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import 'rxjs/Rx';
import { Observable, ReplaySubject } from 'rxjs';

import { ErrorMessageService } from '../error-message';

@Injectable()
export class GoogleCalendarService  {

  public_key = 'AIzaSyAbdivx4G0igYO5yr3vTUJcQF5s8lTdXho';
  url = 'https://www.googleapis.com/calendar/v3/calendars/';

  constructor(
    private http: Http,
    private errorMessageService: ErrorMessageService)  {}

  getData(calendar_id) {
    let url = this.url + 'weiyangwan@gmail.com' + '/events?key=' + this.public_key;

    return this.http.get( url )
                    .map((response: Response) => response.json())
                    .catch((error: Response) => {
                      this.errorMessageService.handleErrorMessage(error.json());
                      return Observable.throw(error.json())
                    });
  }

}
