import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import 'rxjs/Rx';
import { Observable, ReplaySubject } from 'rxjs';

import { ErrorMessageService } from '../error-message';

@Injectable()
export class PlaceService {
  private url = 'https://vast-island-87972.herokuapp.com';

  constructor(
    private http: Http,
    private errorMessageService: ErrorMessageService)  {}

  addPlace(place) {
    const body = JSON.stringify(place);
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';

    return this.http.post( this.url + "/place/new/" + token, body, { headers: headers })
                    .map((response: Response) => response.json())
                    .catch((error: Response) => {
                      this.errorMessageService.handleErrorMessage(error.json());
                      return Observable.throw(error.json())
                    });
    }
}
