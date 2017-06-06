import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Rx';

import { RelationshipService } from '../relationship.service';

@Component({
  selector: 'ww-followings',
  templateUrl: './followings.component.html',
  styleUrls: ['./followings.component.scss']
})
export class FollowingsComponent implements OnInit, OnDestroy {
  relationshipSubscription: Subscription;
  followings = [];

  constructor(private relationshipService: RelationshipService) { }

  ngOnInit() {
    this.relationshipSubscription = this.relationshipService.updateRelationships
                                     .subscribe(
                                       result => {
                                         this.followings = Object.keys(result['followings']).map(key => result['followings'][key]);
                                       }
                                     )
  }

  ngOnDestroy() {
    this.relationshipSubscription.unsubscribe();
  }

}
