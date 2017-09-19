import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import 'rxjs/Rx';
import { Observable, ReplaySubject } from 'rxjs';

import { ErrorMessageService } from '../error-message';

@Injectable()
export class CountryService {
  private url = 'https://vast-island-87972.herokuapp.com';

  constructor(
    private http: Http,
    private errorMessageService: ErrorMessageService)  {}

  getCountries() {
    return this.http.get( this.url + "/country")
                    .map((response: Response) => response.json())
                    .catch((error: Response) => {
                      this.errorMessageService.handleErrorMessage(error.json());
                      return Observable.throw(error.json())
                    });
  }

  // getPlace(id) {
  //   return this.http.get( this.url + "/place/" + id)
  //                   .map((response: Response) => response.json())
  //                   .catch((error: Response) => {
  //                     this.errorMessageService.handleErrorMessage(error.json());
  //                     return Observable.throw(error.json())
  //                   });
  // }

  addCountry(country) {
    const body = JSON.stringify(country);
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';

    return this.http.post( this.url + "/country/new/" + token, body, { headers: headers })
                    .map((response: Response) => response.json())
                    .catch((error: Response) => {
                      this.errorMessageService.handleErrorMessage(error.json());
                      return Observable.throw(error.json())
                    });
  }


    editCountry(country)  {
      const body = JSON.stringify(country);
      const headers = new Headers({ 'Content-Type': 'application/json' });
      const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';

      return this.http.patch( this.url + "/country/" + country['_id'] + token, body, { headers: headers })
                      .map((response: Response) => response.json())
                      .catch((error: Response) => {
                        this.errorMessageService.handleErrorMessage(error.json());
                        return Observable.throw(error.json())
                      });
    }
}
