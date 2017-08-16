import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Rx';
import { Title }        from '@angular/platform-browser';

import { RelationshipService } from '../relationship.service';

@Component({
  selector: 'ww-pending-followers',
  templateUrl: './pending-followers.component.html',
  styleUrls: ['./pending-followers.component.scss']
})
export class PendingFollowersComponent implements OnInit, OnDestroy {
  relationshipSubscription: Subscription;
  pendingFollowers = [];

  constructor(
    private titleService: Title,
    private relationshipService: RelationshipService) { }

  ngOnInit() {
    this.titleService.setTitle("Relationships | Pending Followers");

    this.relationshipSubscription = this.relationshipService.updateRelationships.subscribe(
     result => {
       this.pendingFollowers = Object.keys(result['pendingFollowers']).map(key => result['pendingFollowers'][key]);
     })
  }

  ngOnDestroy() {
    if(this.relationshipSubscription) this.relationshipSubscription.unsubscribe();
  }

}
