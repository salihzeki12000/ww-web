import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

import { RelationshipService } from '../../relationship.service';

@Component({
  selector: 'ww-following',
  templateUrl: './following.component.html',
  styleUrls: ['./following.component.scss']
})
export class FollowingComponent implements OnInit {
  @Input() following;

  constructor(
    private router: Router,
    private relationshipService: RelationshipService) { }

  ngOnInit() {
  }

  unfollow()  {
    let status = "following";

    this.relationshipService.deleteFollow(this.following, status)
        .subscribe( result => {} )
  }

  routeToUser(id) {
    this.router.navigateByUrl('/wondererwanderer/' + id)
  }

}
