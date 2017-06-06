import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Rx';

import { RelationshipService } from '../relationship.service';

@Component({
  selector: 'ww-requested-followings',
  templateUrl: './requested-followings.component.html',
  styleUrls: ['./requested-followings.component.scss']
})
export class RequestedFollowingsComponent implements OnInit, OnDestroy {
  relationshipSubscription: Subscription;
  requestedFollowings = [];

  constructor(private relationshipService: RelationshipService) { }

  ngOnInit() {
    this.relationshipSubscription = this.relationshipService.updateRelationships
                                     .subscribe(
                                       result => {
                                         this.requestedFollowings = Object.keys(result['requestedFollowings']).map(key => result['requestedFollowings'][key]);
                                       }
                                     )
  }

  ngOnDestroy() {
    this.relationshipSubscription.unsubscribe();
  }

}
