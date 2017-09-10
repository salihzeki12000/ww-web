import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import 'rxjs/Rx';
import { Observable, ReplaySubject } from 'rxjs';

import { ErrorMessageService } from '../error-message';

@Injectable()
export class AdminService {

  private url = 'https://vast-island-87972.herokuapp.com';

  constructor(
    private http: Http,
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
}
