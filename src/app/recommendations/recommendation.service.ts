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

  getRecommendations(id)  {
    const currentUser = '?currentUserId=' + id;

    return this.http.get(this.url + '/recommendation' + currentUser)
                    .map((response: Response) => {
                      this.recommendations = response.json().recommendations
                      this.timeAgo(this.recommendations)
                      return response.json();
                    })
                    .catch((error: Response) => {
                      this.errorMessageService.handleErrorMessage(error.json());
                      return Observable.throw(error.json())
                    });
  }

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
                    .map((response: Response) => {
                      let index = this.recommendations.indexOf(recommendation);
                      this.recommendations[index] = recommendation;

                      this.updateRecommendations.next(this.recommendations);

                      return response.json()
                    })
                    .catch((error: Response) => {
                      this.errorMessageService.handleErrorMessage(error.json());
                      return Observable.throw(error.json())
                    });
  }

  deleteRecommendation(recommendation)  {
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';

    return this.http.delete( this.url + "/recommendation/" + recommendation['_id'] + token)
                    .map((response: Response) => {
                      this.recommendations.splice(this.recommendations.indexOf(recommendation), 1);
                      this.updateRecommendations.next(this.recommendations);

                      return response.json()
                    })
                    .catch((error: Response) => {
                      this.errorMessageService.handleErrorMessage(error.json());
                      return Observable.throw(error.json())
                    });
  }

  timeAgo(recommendations) {
    for (let i = 0; i < recommendations.length; i++) {
      let timePosted = new Date(recommendations[i]['created_at']).getTime();
      let timeDiff = (Date.now() - timePosted) / 1000;

      let units = [
        { name: "minute", in_seconds: 60, limit: 3600 },
        { name: "hour", in_seconds: 3600, limit: 86400 },
        { name: "day", in_seconds: 86400, limit: 604800 }
      ];

      if(timeDiff < 60) {
        recommendations[i]['time_ago'] = "Less than a minute ago"
      } else if(timeDiff > 604800) {
        recommendations[i]['time_ago'] = '';
      } else {
        for (let j = 0; j < units.length; j++) {
          if(timeDiff < units[j]['limit'])  {
            let timeAgo =  Math.floor(timeDiff / units[j].in_seconds);
            recommendations[i]['time_ago'] = timeAgo + " " + units[j].name + (timeAgo > 1 ? "s" : "") + " ago";
            j = units.length;
          };
        }
      }
    }
    this.updateRecommendations.next(recommendations);
  }
}
