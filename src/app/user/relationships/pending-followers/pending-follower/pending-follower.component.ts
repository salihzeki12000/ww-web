import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

import { RelationshipService } from '../../relationship.service';

@Component({
  selector: 'ww-pending-follower',
  templateUrl: './pending-follower.component.html',
  styleUrls: ['./pending-follower.component.scss']
})
export class PendingFollowerComponent implements OnInit {
  @Input() pendingFollower;

  constructor(
    private router: Router,
    private relationshipService: RelationshipService) { }

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

  routeToUser(id) {
    this.router.navigateByUrl('/wondererwanderer/' + id)
  }

}
