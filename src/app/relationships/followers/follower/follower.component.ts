import { Component, OnInit, Input } from '@angular/core';

import { RelationshipService } from '../../relationship.service';

@Component({
  selector: 'ww-follower',
  templateUrl: './follower.component.html',
  styleUrls: ['./follower.component.scss']
})
export class FollowerComponent implements OnInit {
  @Input() follower;
  currentUser = {
    _id: 0
  }

  removeFollower = false;

  constructor(private relationshipService: RelationshipService) { }

  ngOnInit() {
  }

  remove()  {
    this.removeFollower = false;

    let status = "follower"

    this.relationshipService.deleteFollow(this.follower, status)
      .subscribe(result => {})
  }
}
