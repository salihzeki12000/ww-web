import { Component, OnInit, Input } from '@angular/core';

import { RelationshipService } from '../../relationship.service';

@Component({
  selector: 'ww-requested-following',
  templateUrl: './requested-following.component.html',
  styleUrls: ['./requested-following.component.scss']
})
export class RequestedFollowingComponent implements OnInit {
  @Input() requestedFollowing;

  constructor(private relationshipService: RelationshipService) { }

  ngOnInit() {
  }

  unfollow()  {
    let status = "requestedFollowing";
    
    this.relationshipService.deleteFollow(this.requestedFollowing, status)
        .subscribe( result => {} )
  }

}
