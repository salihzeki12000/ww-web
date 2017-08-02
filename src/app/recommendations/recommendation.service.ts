import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import 'rxjs/Rx';
import { Observable, ReplaySubject } from 'rxjs';

import { ErrorMessageService } from '../error-message';
import { NotificationService } from '../notifications';

@Injectable()
export class RecommendationService {
  private url = 'https://vast-island-87972.herokuapp.com';

  recommendations = [];
  updateRecommendations = new ReplaySubject();

  constructor(
    private http: Http,
    private notificationService: NotificationService,
    private errorMessageService: ErrorMessageService)  {}


  getRecommendation(id) {
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';

    return this.http.get( this.url + "/recommendation/display/" + id + token)
                    .map((response: Response) => response.json())
                    .catch((error: Response) => {
                      this.errorMessageService.handleErrorMessage(error.json());
                      return Observable.throw(error.json())
                    });
  }

  addRecommendation(recommendation) {
    const body = JSON.stringify(recommendation);
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';

    return this.http.post( this.url + "/recommendation/new/" + token, body, { headers: headers })
                    .map((response: Response) => {
                      let rec = response.json().recommendation['_id']

                      this.notificationService.newNotification({
                        recipient: recommendation.recipient,
                        originator: recommendation.originator,
                        message: " has recommended " + recommendation.place['name'] + ".",
                        link: "/me/recommendation/" + rec,
                        read: false
                      }).subscribe(result => {});

                      return response.json()
                    })
                    .catch((error: Response) => {
                      this.errorMessageService.handleErrorMessage(error.json());
                      return Observable.throw(error.json())
                    });
  }

  updateRecommendation(recommendation)  {
    const body = JSON.stringify(recommendation);
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';

    return this.http.patch( this.url + "/recommendation/" + recommendation['_id'] + token, body, { headers: headers })
                    .map((response: Response) => response.json())
                    .catch((error: Response) => {
                      this.errorMessageService.handleErrorMessage(error.json());
                      return Observable.throw(error.json())
                    });
  }
}
