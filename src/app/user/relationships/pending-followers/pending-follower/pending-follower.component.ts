import { Component, OnInit, Input } from '@angular/core';

import { RelationshipService } from '../../relationship.service';

@Component({
  selector: 'ww-pending-follower',
  templateUrl: './pending-follower.component.html',
  styleUrls: ['./pending-follower.component.scss']
})
export class PendingFollowerComponent implements OnInit {
  @Input() pendingFollower;

  constructor(private relationshipService: RelationshipService) { }

  ngOnInit() {
  }

  acceptRequest() {
    this.pendingFollower['status'] = 'accepted';
    this.pendingFollower['responded'] = true;
    this.pendingFollower['request_accepted'] = true;

    this.relationshipService.acceptFollow(this.pendingFollower)
        .subscribe( result => {} )
  }

  ignoreRequest() {
    this.pendingFollower['responded'] = true;
    this.pendingFollower['request_ignored'] = true;

    this.relationshipService.deleteFollow(this.pendingFollower, "pendingFollower")
        .subscribe( result => {} )
  }

}
