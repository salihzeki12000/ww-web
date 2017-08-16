import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Rx';
import { Title }        from '@angular/platform-browser';

import { RelationshipService } from '../relationship.service';

@Component({
  selector: 'ww-followers',
  templateUrl: './followers.component.html',
  styleUrls: ['./followers.component.scss']
})
export class FollowersComponent implements OnInit, OnDestroy {
  relationshipSubscription: Subscription;
  followers = [];

  constructor(
    private titleService: Title,
    private relationshipService: RelationshipService) { }

  ngOnInit() {
    this.titleService.setTitle("Relationships | Followers");

    this.relationshipSubscription = this.relationshipService.updateRelationships.subscribe(
       result => {
         this.followers = Object.keys(result['followers']).map(key => result['followers'][key]);
       })
  }

  ngOnDestroy() {
    if(this.relationshipSubscription) this.relationshipSubscription.unsubscribe();
  }

}
