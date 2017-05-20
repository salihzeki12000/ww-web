import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import 'rxjs/Rx';
import { Observable, ReplaySubject } from 'rxjs';

import { ErrorMessageService } from '../../error-message';

@Injectable()
export class RelationshipService  {
  // currentUser = apple, user = apple, following = banana, apple follows banana
  // currentUser = apple, user = banana, following = apple, apple followed by banana
  followings = []; // apple follows banana (people you follow)
  followers = []; // apple followed by banana (people who follow you)
  pendingFollowers = [];
  requestedFollowings = [];
  relationships = [];
  currentUser;

  updateRelationships = new ReplaySubject();

  private url = 'https://vast-island-87972.herokuapp.com';

  constructor(
    private http: Http,
    private errorMessageService: ErrorMessageService)  {}

  getRelationships(currentUser)  {
    this.currentUser = currentUser;
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';
    const headers = new Headers({ 'Content-Type': 'application/json' });
    return this.http.get(this.url + '/following' + token, { headers: headers })
                    .map((response: Response) => {
                      this.filterRelationships(response.json().followings);
                      return response.json();
                    })
                    .catch((error: Response) => {
                      this.errorMessageService.handleErrorMessage(error.json());
                      return Observable.throw(error.json())
                    });
  }

  requestFollow(following) {
    const body = JSON.stringify({
      user: following.user["id"],
      following: following.following["_id"],
      status: "requested"
    });
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';
    const headers = new Headers({ 'Content-Type': 'application/json' });
    return this.http.post(this.url + '/following/new' + token, body, { headers: headers })
                    .map((response: Response) => {
                      let newFollowing = response.json().following;
                      newFollowing['relative_status'] = "requestedFollowing";

                      newFollowing['user'] = {
                        _id: this.currentUser['id'],
                        username: this.currentUser['username'],
                        display_picture: this.currentUser['display_picture'],
                        description: this.currentUser['description']
                      }

                      newFollowing['following'] = {
                        _id: following.following['_id'],
                        username: following.following['username'],
                        display_picture: following.following['display_picture'],
                        description: following.following['description']
                      }
                      this.requestedFollowings.push(newFollowing);
                      this.relationships.push(newFollowing);

                      this.updateRelationships.next({
                        relationships: this.relationships,
                        followers: this.followers,
                        followings: this.followings,
                        pendingFollowers: this.pendingFollowers,
                        requestedFollowings: this.requestedFollowings,
                      });

                      return newFollowing;
                    })
                    .catch((error: Response) => {
                      this.errorMessageService.handleErrorMessage(error.json());
                      return Observable.throw(error.json())
                    });
  }

  acceptFollow(following) {
    console.log(following);
    const body = JSON.stringify(following);
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';

    return this.http.patch( this.url + "/following/" + following['_id']+ token, body, { headers: headers })
                    .map((response: Response) => {
                      let acceptedFollowing = response.json().following;
                      acceptedFollowing['relative_status'] = "follower";

                      acceptedFollowing['user'] = {
                        _id: following.user['_id'],
                        username: following.user['username'],
                        display_picture: following.user['display_picture'],
                        description: following.user['description']
                      }

                      acceptedFollowing['following'] = {
                        _id: this.currentUser['id'],
                        username: this.currentUser['username'],
                        display_picture: this.currentUser['display_picture'],
                        description: this.currentUser['description']
                      }

                      let index = this.relationships.indexOf(acceptedFollowing);
                      this.relationships[index] = acceptedFollowing;

                      this.followers.push(acceptedFollowing);
                      this.pendingFollowers.splice(this.pendingFollowers.indexOf(following), 1);

                      this.updateRelationships.next({
                        relationships: this.relationships,
                        followers: this.followers,
                        followings: this.followings,
                        pendingFollowers: this.pendingFollowers,
                        requestedFollowings: this.requestedFollowings,
                      });

                      return response.json()
                    })
                    .catch((error: Response) => {
                      this.errorMessageService.handleErrorMessage(error.json());
                      return Observable.throw(error.json())
                    });
  }

  deleteFollow(following, status)  {
    console.log(following);
    console.log(status);
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';

    return this.http.delete( this.url + "/following/" + following['_id'] + token)
                    .map((response: Response) => {
                      if(status === "following")  {
                        this.followings.splice(this.followings.indexOf(following), 1)
                      }

                      if(status === "requestedFollowing")  {
                        this.requestedFollowings.splice(this.requestedFollowings.indexOf(following), 1)
                      }

                      if(status === "follower")  {
                        this.followers.splice(this.followers.indexOf(following), 1)
                      }

                      if(status === "pendingFollower")  {
                        this.pendingFollowers.splice(this.pendingFollowers.indexOf(following), 1)
                      }

                      this.relationships.splice(this.relationships.indexOf(following), 1)

                      this.updateRelationships.next({
                        relationships: this.relationships,
                        followers: this.followers,
                        followings: this.followings,
                        pendingFollowers: this.pendingFollowers,
                        requestedFollowings: this.requestedFollowings,
                      });

                      return response.json()
                    })
                    .catch((error: Response) => {
                      this.errorMessageService.handleErrorMessage(error.json());
                      return Observable.throw(error.json())
                    });
  }

  filterRelationships(relationships)  {
    this.followings = [];
    this.followers = [];
    this.pendingFollowers = [];
    this.requestedFollowings = [];

    for (let i = 0; i < relationships.length; i++) {
      if(relationships[i]['user']['_id'] === this.currentUser['id']) {
        if(relationships[i]['status'] === "requested")  {
          relationships[i]['relative_status'] = "requestedFollowing";
          this.requestedFollowings.push(relationships[i]);
        } else if (relationships[i]['status'] === "accepted") {
          relationships[i]['relative_status'] = "following";
          this.followings.push(relationships[i]);
        }
      }

      if(relationships[i]['following']['_id'] === this.currentUser['id']) {
        if(relationships[i]['status'] === "requested")  {
          relationships[i]['request_ignored'] = false;
          relationships[i]['request_accepted'] = false;
          relationships[i]['responded'] = false;
          relationships[i]['relative_status'] = "pendingFollower";
          this.pendingFollowers.push(relationships[i]);
        } else if(relationships[i]['status'] === "accepted") {
          relationships[i]['relative_status'] = "follower";
          this.followers.push(relationships[i]);
        }
      }
    }
    this.relationships = relationships;

    this.updateRelationships.next({
      relationships: this.relationships,
      followers: this.followers,
      followings: this.followings,
      pendingFollowers: this.pendingFollowers,
      requestedFollowings: this.requestedFollowings,
    });
  }
}
