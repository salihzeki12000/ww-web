import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import 'rxjs/Rx';
import { Observable, ReplaySubject } from 'rxjs';

@Injectable()
export class CommentService  {

  private url = 'https://vast-island-87972.herokuapp.com';

  constructor( private http: Http)  {}

  addComment(comment) {
    const body = JSON.stringify(comment);
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';

    return this.http.post( this.url + "/comments/new/" + token, body, { headers: headers })
                    .map((response: Response) => {
                      return response.json().comment;
                    })
                    .catch((error: Response) => Observable.throw(error.json()));
  }
}
