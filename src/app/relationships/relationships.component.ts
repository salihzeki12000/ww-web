import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Rx';

import { RelationshipService } from './relationship.service';
import { LoadingService }      from '../loading';

@Component({
  selector: 'ww-relationships',
  templateUrl: './relationships.component.html',
  styleUrls: ['./relationships.component.scss']
})
export class RelationshipsComponent implements OnInit, OnDestroy {
  relationshipSubscription: Subscription;

  followings = [];
  followers = [];
  pendingFollowers = [];
  requestedFollowings = [];

  constructor(
    private relationshipService: RelationshipService,
    private loadingService: LoadingService) { }

  ngOnInit() {
    this.relationshipSubscription = this.relationshipService.updateRelationships.subscribe(
      result => {
        this.followers = Object.keys(result['followers']).map(key => result['followers'][key]);;
        this.followings = Object.keys(result['followings']).map(key => result['followings'][key]);;
        this.pendingFollowers = Object.keys(result['pendingFollowers']).map(key => result['pendingFollowers'][key]);;
        this.requestedFollowings = Object.keys(result['requestedFollowings']).map(key => result['requestedFollowings'][key]);
        this.loadingService.setLoader(false, "");
      })
  }

  ngOnDestroy() {
    this.relationshipSubscription.unsubscribe();
    this.loadingService.setLoader(true, "");
  }

}
