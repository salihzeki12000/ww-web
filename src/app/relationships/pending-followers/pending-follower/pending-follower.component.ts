import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

import { RelationshipService } from '../../relationship.service';
import { NotificationService } from '../../../notifications';

@Component({
  selector: 'ww-pending-follower',
  templateUrl: './pending-follower.component.html',
  styleUrls: ['./pending-follower.component.scss']
})
export class PendingFollowerComponent implements OnInit {
  @Input() pendingFollower;

  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private relationshipService: RelationshipService) { }

  ngOnInit() {
  }

  acceptRequest() {
    this.pendingFollower['status'] = 'accepted';
    this.pendingFollower['responded'] = true;
    this.pendingFollower['request_accepted'] = true;

    this.relationshipService.acceptFollow(this.pendingFollower)
        .subscribe( result => {
          this.notificationService.newNotification({
            recipient: this.pendingFollower['user']['_id'],
            originator: this.pendingFollower['following']['_id'],
            message: " has accepted your follow request",
            link: "/wondererwanderer" + this.pendingFollower['following']['_id'],
            read: false
          }).subscribe(data => {})
        } )
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
