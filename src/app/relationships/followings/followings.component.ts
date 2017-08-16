import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Rx';
import { Title }        from '@angular/platform-browser';

import { RelationshipService } from '../relationship.service';

@Component({
  selector: 'ww-followings',
  templateUrl: './followings.component.html',
  styleUrls: ['./followings.component.scss']
})
export class FollowingsComponent implements OnInit, OnDestroy {
  relationshipSubscription: Subscription;
  followings = [];

  constructor(
    private titleService: Title,
    private relationshipService: RelationshipService) { }

  ngOnInit() {
    this.titleService.setTitle("Relationships | Followings");

    this.relationshipSubscription = this.relationshipService.updateRelationships.subscribe(
     result => {
       this.followings = Object.keys(result['followings']).map(key => result['followings'][key]);
     })
  }

  ngOnDestroy() {
    if(this.relationshipSubscription) this.relationshipSubscription.unsubscribe();
  }

}
