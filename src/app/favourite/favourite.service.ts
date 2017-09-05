import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import 'rxjs/Rx';
import { Observable, ReplaySubject } from 'rxjs';

import { ErrorMessageService } from '../error-message';

@Injectable()
export class FavouriteService {
  private url = 'https://vast-island-87972.herokuapp.com';

  favourites = [];
  updateFavs = new ReplaySubject();

  constructor(
    private http: Http,
    private errorMessageService: ErrorMessageService)  {}

  getFavs(userId) {
    return this.http.get( this.url + "/favourite/displayUser/" + userId)
                    .map((response: Response) => {
                      this.favourites = response.json().favourites;
                      this.updateFavs.next(this.favourites)
                      return response.json()
                    })
                    .catch((error: Response) => {
                      console.log(error)
                      this.errorMessageService.handleErrorMessage(error.json());
                      return Observable.throw(error.json())
                    });
  }

  addFav(fav) {
    const body = JSON.stringify(fav);
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';

    return this.http.post( this.url + "/favourite/new/" + token, body, { headers: headers })
                    .map((response: Response) => {
                      this.favourites.unshift(response.json().favourite);
                      this.updateFavs.next(this.favourites)
                      return response.json()
                    })
                    .catch((error: Response) => {
                      this.errorMessageService.handleErrorMessage(error.json());
                      return Observable.throw(error.json())
                    });
  }

  deleteFav(fav)  {
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';

    return this.http.delete( this.url + "/favourite/" + fav['_id'] + token)
                    .map((response: Response) => {
                      this.favourites.splice(this.favourites.indexOf(fav), 1);
                      this.updateFavs.next(this.favourites)

                      return response.json()
                    })
                    .catch((error: Response) => {
                      this.errorMessageService.handleErrorMessage(error.json());
                      return Observable.throw(error.json())
                    });
  }

}
