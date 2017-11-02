import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Rx';
import { Title }        from '@angular/platform-browser';

import { RelationshipService } from '../relationship.service';
import { LoadingService }      from '../../loading';

@Component({
  selector: 'ww-pending-followers',
  templateUrl: './pending-followers.component.html',
  styleUrls: ['./pending-followers.component.scss']
})
export class PendingFollowersComponent implements OnInit, OnDestroy {
  relationshipSubscription: Subscription;
  pendingFollowers = [];
  filteredFollowers = [];

  constructor(
    private loadingService: LoadingService,
    private titleService: Title,
    private relationshipService: RelationshipService) { }

  ngOnInit() {
    this.titleService.setTitle("Relationships | Pending Followers");

    this.relationshipSubscription = this.relationshipService.updateRelationships.subscribe(
     result => {
       this.pendingFollowers = Object.keys(result['pendingFollowers']).map(key => result['pendingFollowers'][key]);

       this.filteredFollowers = this.pendingFollowers;
     })

    setTimeout(()  =>  {
      this.loadingService.setLoader(false, "");
    }, 500)
  }

  ngOnDestroy() {
    if(this.relationshipSubscription) this.relationshipSubscription.unsubscribe();
  }

  filterSearch(text)  {
    if(!text)   {
      this.filteredFollowers = this.pendingFollowers;
    } else  {
      this.filteredFollowers = Object.assign([], this.pendingFollowers).filter(
        follower => follower.user.username.toLowerCase().indexOf(text.toLowerCase()) > -1
      )
    }
  }

}
