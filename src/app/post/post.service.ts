import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import 'rxjs/Rx';
import { Observable, ReplaySubject } from 'rxjs';

import { Post } from './post';

import { ErrorMessageService } from '../error-message';

@Injectable()
export class PostService  {
  private posts: Post[] = [];
  private feed: Post[] = [];

  updatePost = new ReplaySubject();
  updateFeed = new ReplaySubject();

  // private url = 'http://localhost:9000';
  private url = 'https://vast-island-87972.herokuapp.com';

  constructor(
    private http: Http,
    private errorMessageService: ErrorMessageService)  {}

  getPosts() {
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';
    return this.http.get( this.url + "/posts/" + token)
                    .map((response: Response) => {
                      this.posts = response.json().posts;
                      this.timeAgo(this.posts);
                      return this.posts;
                    })
                    .catch((error: Response) => {
                      this.errorMessageService.handleErrorMessage(error.json());
                      return Observable.throw(error.json())
                    });
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
                    .map((response: Response) => response.json())
                    .catch((error: Response) => {
                      this.errorMessageService.handleErrorMessage(error.json());
                      return Observable.throw(error.json())
                    });
  }

  addPost(post: Post) {
    const body = JSON.stringify(post);
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';

    return this.http.post( this.url + "/posts/new/" + token, body, { headers: headers })
                    .map((response: Response) => {
                      this.posts.unshift(response.json().post);
                      this.feed.unshift(response.json().post);
                      this.timeAgo(this.posts);
                      this.timeAgoFeed(this.feed);
                      return response.json();
                    })
                    .catch((error: Response) => {
                      this.errorMessageService.handleErrorMessage(error.json());
                      return Observable.throw(error.json())
                    });
  }

  editPost(post: Post)  {
    const body = JSON.stringify(post);
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';

    return this.http.patch( this.url + "/posts/" + post['_id'] + token, body, { headers: headers })
                    .map((response: Response) => {
                      let index = this.posts.indexOf(post);
                      this.posts[index] = post;
                      this.updatePost.next(this.posts);

                      let feedIndex = this.feed.indexOf(post);
                      this.feed[index] = post;
                      this.updateFeed.next(this.feed);

                      return response.json()
                    })
                    .catch((error: Response) => {
                      this.errorMessageService.handleErrorMessage(error.json());
                      return Observable.throw(error.json())
                    });
  }

  deletePost(post: Post)  {
    console.log(post);
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';

    return this.http.delete( this.url + "/posts/" + post['_id'] + token)
                    .map((response: Response) => {
                      this.posts.splice(this.posts.indexOf(post), 1);
                      this.feed.splice(this.feed.indexOf(post), 1);
                      this.updatePost.next(this.posts);
                      this.updateFeed.next(this.feed);
                      return response.json()
                    })
                    .catch((error: Response) => {
                      console.log(error.json());
                      // this.errorMessageService.handleErrorMessage(error.json());
                      return Observable.throw(error.json())
                    });
  }

  timeAgo(posts) {
    let units = [
      { name: "minute", in_seconds: 60, limit: 3600 },
      { name: "hour", in_seconds: 3600, limit: 86400 },
      { name: "day", in_seconds: 86400, limit: 604800 }
    ];

    for (let i = 0; i < posts.length; i++) {
      let timePosted = new Date(posts[i]['created_at']).getTime();
      let timeDiff = (Date.now() - timePosted) / 1000;

      if(timeDiff < 60) {
        posts[i]['time_ago'] = "Less than a minute ago"
      } else if(timeDiff > 604800) {
        posts[i]['time_ago'] = '';
      } else {
        for (let j = 0; j < units.length; j++) {
          if(timeDiff < units[j]['limit'])  {
            let timeAgo =  Math.floor(timeDiff / units[j].in_seconds);
            posts[i]['time_ago'] = timeAgo + " " + units[j].name + (timeAgo > 1 ? "s" : "") + " ago";
            j = units.length;
          };
        }
      }

      for (let k = 0; k < posts[i]['comments'].length; k++) {
        let comment = posts[i]['comments'][k];
        let commentTimePosted = new Date(comment['created_at']).getTime();
        let commentTimeDiff = (Date.now() - commentTimePosted) / 1000;

        if(commentTimeDiff < 60)  {
          comment['time_ago'] = "Less than a minute ago"
        } else if(commentTimeDiff > 604800) {
          comment['time_ago'] = '';
        } else  {
          for (let l = 0; l < units.length; l++) {
            if(commentTimeDiff < units[l]['limit']) {
              let commentTimeAgo = Math.floor(commentTimeDiff / units[l].in_seconds);
              comment['time_ago'] = commentTimeAgo + " " + units[l].name + (commentTimeAgo > 1 ? "s" : "") + " ago";
              l = units.length;
            }
          }
        }
      }
    }

    this.updatePost.next(posts);
  }

  timeAgoFeed(feed) {
    let units = [
      { name: "minute", in_seconds: 60, limit: 3600 },
      { name: "hour", in_seconds: 3600, limit: 86400 },
      { name: "day", in_seconds: 86400, limit: 604800 }
    ];

    for (let i = 0; i < feed.length; i++) {
      let timePosted = new Date(feed[i]['created_at']).getTime();
      let timeDiff = (Date.now() - timePosted) / 1000;

      if(timeDiff < 60) {
        feed[i]['time_ago'] = "Less than a minute ago"
      } else if(timeDiff > 604800) {
        feed[i]['time_ago'] = '';
      } else {
        for (let j = 0; j < units.length; j++) {
          if(timeDiff < units[j]['limit'])  {
            let timeAgo =  Math.floor(timeDiff / units[j].in_seconds);
            feed[i]['time_ago'] = timeAgo + " " + units[j].name + (timeAgo > 1 ? "s" : "") + " ago";
            j = units.length;
          };
        }
      }

      for (let k = 0; k < feed[i]['comments'].length; k++) {
        let comment = feed[i]['comments'][k];
        let commentTimePosted = new Date(comment['created_at']).getTime();
        let commentTimeDiff = (Date.now() - commentTimePosted) / 1000;

        if(commentTimeDiff < 60)  {
          comment['time_ago'] = "Less than a minute ago"
        } else if(commentTimeDiff > 604800) {
          comment['time_ago'] = '';
        } else  {
          for (let l = 0; l < units.length; l++) {
            if(commentTimeDiff < units[l]['limit']) {
              let commentTimeAgo = Math.floor(commentTimeDiff / units[l].in_seconds);
              comment['time_ago'] = commentTimeAgo + " " + units[l].name + (commentTimeAgo > 1 ? "s" : "") + " ago";
              l = units.length;
            }
          }
        }
      }
    }
    this.updateFeed.next(feed);
  }

}
