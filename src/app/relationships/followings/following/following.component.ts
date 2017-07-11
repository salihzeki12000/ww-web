import { Component, OnInit, Input } from '@angular/core';

import { RelationshipService } from '../../relationship.service';

@Component({
  selector: 'ww-following',
  templateUrl: './following.component.html',
  styleUrls: ['./following.component.scss']
})
export class FollowingComponent implements OnInit {
  @Input() following;
  currentUser = {
    _id: 0
  }

  constructor(private relationshipService: RelationshipService) { }

  ngOnInit() {
  }

  unfollow()  {
    let status = "following";

    this.relationshipService.deleteFollow(this.following, status)
        .subscribe( result => {} )
  }

}
