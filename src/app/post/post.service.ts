import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import 'rxjs/Rx';
import { Observable, ReplaySubject } from 'rxjs';

import { Post } from './post';

@Injectable()
export class PostService  {
  private posts: Post[] = [];
  private feed: Post[] = [];

  updatePost = new ReplaySubject();
  updateFeed = new ReplaySubject();

  // private url = 'http://localhost:9000';
  private url = 'https://vast-island-87972.herokuapp.com';

  constructor( private http: Http)  {}

  getPosts() {
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';
    return this.http.get( this.url + "/posts/" + token)
                    .map((response: Response) => {
                      this.posts = response.json().posts;
                      this.timeAgo(this.posts);
                      return this.posts;
                    })
                    .catch((error: Response) => Observable.throw(error.json()));
  }

  getFeed() {
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';
    return this.http.get( this.url + "/posts/feed" + token)
                    .map((response: Response) => {
                      this.feed = response.json().feed;
                      this.timeAgoFeed(this.feed);
                      return this.feed;
                    })
                    .catch((error: Response) => Observable.throw(error.json()));
  }

  getPreview(link)  {
    const body = JSON.stringify(link);
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';

    return this.http.post( this.url + "/posts/linkpreview" + token, body, { headers: headers })
                    .map((response: Response) =>  {
                      return response.json();
                    })
  }

  addPost(post: Post) {
    const body = JSON.stringify(post);
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';

    return this.http.post( this.url + "/posts/new/" + token, body, { headers: headers })
                    .map((response: Response) => {
                      this.posts.push(response.json().post);
                      this.timeAgo(this.posts);
                      return response.json();
                    })
                    .catch((error: Response) => Observable.throw(error.json()));
  }

  editPost(post: Post, editedPost: string)  {
    post['content'] = editedPost;
    const body = JSON.stringify(post);
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';

    return this.http.patch( this.url + "/posts/" + post['_id'] + token, body, { headers: headers })
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

  timeAgo(posts) {
    for (let i = 0; i < posts.length; i++) {
      let timePosted = new Date(posts[i]['created_at']).getTime();
      let timeDiff = (Date.now() - timePosted) / 1000;

      let units = [
        { name: "MINUTE", in_seconds: 60, limit: 3600 },
        { name: "HOUR", in_seconds: 3600, limit: 86400 },
        { name: "DAY", in_seconds: 86400, limit: 604800 },
        { name: "WEEK", in_seconds: 604800, limit: 2629743 },
        { name: "MONTH", in_seconds: 2629743, limit: 31556926 },
        { name: "YEAR", in_seconds: 31556926, limit: null }
      ];

      if(timeDiff < 60) {
        posts[i]['time_ago'] = "LESS THAN A MINUTE AGO"
      } else {
        for (let j = 0; j < units.length; j++) {
          if(timeDiff < units[j]['limit'] || !units[j]['limit'])  {
            let timeAgo =  Math.floor(timeDiff / units[j].in_seconds);
            posts[i]['time_ago'] = timeAgo + " " + units[j].name + (timeAgo > 1 ? "S" : "") + " AGO";
            j = units.length;
          };
        }
      }
    }
    this.updatePost.next(posts);
  }

  timeAgoFeed(feed) {
    for (let i = 0; i < feed.length; i++) {
      let timePosted = new Date(feed[i]['created_at']).getTime();
      let timeDiff = (Date.now() - timePosted) / 1000;

      let units = [
        { name: "MINUTE", in_seconds: 60, limit: 3600 },
        { name: "HOUR", in_seconds: 3600, limit: 86400 },
        { name: "DAY", in_seconds: 86400, limit: 604800 },
        { name: "WEEK", in_seconds: 604800, limit: 2629743 },
        { name: "MONTH", in_seconds: 2629743, limit: 31556926 },
        { name: "YEAR", in_seconds: 31556926, limit: null }
      ];

      if(timeDiff < 60) {
        feed[i]['time_ago'] = "LESS THAN A MINUTE AGO"
      } else {
        for (let j = 0; j < units.length; j++) {
          if(timeDiff < units[j]['limit'] || !units[j]['limit'])  {
            let timeAgo =  Math.floor(timeDiff / units[j].in_seconds);
            feed[i]['time_ago'] = timeAgo + " " + units[j].name + (timeAgo > 1 ? "S" : "") + " AGO";
            j = units.length;
          };
        }
      }
    }
    this.updateFeed.next(feed);
  }
}
