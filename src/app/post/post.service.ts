import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import 'rxjs/Rx';
import { Observable } from 'rxjs';

import { Post } from './post';

@Injectable()
export class PostService  {
  private posts: Post[] = [];

  private url = 'http://localhost:9000';
  // private url = 'https://vast-island-87972.herokuapp.com';

  constructor( private http: Http)  {}

  getPosts() {
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';
    return this.http.get( this.url + "/posts" + token)
                    .map((response: Response) => {
                      this.posts = response.json().posts;
                      console.log(this.posts);
                      return this.posts;
                    })
                    .catch((error: Response) => Observable.throw(error.json()));
  }

  addPost(post: Post) {
    const body = JSON.stringify(post);
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';

    return this.http.post( this.url + "/posts/new" + token, body, { headers: headers })
                    .map((response: Response) => {
                      this.posts.push(response.json().post);
                      return response.json();
                    })
                    .catch((error: Response) => Observable.throw(error.json()));
  }

  editPost(post: Post, editedPost: string)  {
    post['content'] = editedPost;
    const body = JSON.stringify(post);
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';

    return this.http.patch( this.url + "/posts/" + post['_id']+ token, body, { headers: headers })
                    .map((response: Response) => response.json())
                    .catch((error: Response) => Observable.throw(error.json()));
  }

  deletePost(post: Post)  {
    this.posts.splice(this.posts.indexOf(post), 1);
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';

    return this.http.delete( this.url + "/posts/" + post['_id'] + token)
                    .map((response: Response) => response.json())
                    .catch((error: Response) => Observable.throw(error.json()));
  }
}
