import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Rx';
import { Title }        from '@angular/platform-browser';

import { RelationshipService } from '../relationship.service';
import { LoadingService }      from '../../loading';

@Component({
  selector: 'ww-requested-followings',
  templateUrl: './requested-followings.component.html',
  styleUrls: ['./requested-followings.component.scss']
})
export class RequestedFollowingsComponent implements OnInit, OnDestroy {
  relationshipSubscription: Subscription;
  requestedFollowings = [];
  filteredFollowings = [];

  constructor(
    private loadingService: LoadingService,
    private titleService: Title,
    private relationshipService: RelationshipService) { }

  ngOnInit() {
    this.titleService.setTitle("Relationships | Following Requests");

    this.relationshipSubscription = this.relationshipService.updateRelationships.subscribe(
     result => {
       this.requestedFollowings = Object.keys(result['requestedFollowings']).map(key => result['requestedFollowings'][key]);

       this.filteredFollowings = this.requestedFollowings;
     })

    this.loadingService.setLoader(false, "");
  }

  ngOnDestroy() {
    if(this.relationshipSubscription) this.relationshipSubscription.unsubscribe();
  }

  filterSearch(text)  {
    if(!text)   {
      this.filteredFollowings = this.requestedFollowings;
    } else  {
      this.filteredFollowings = Object.assign([], this.requestedFollowings).filter(
        following => following.following.username.toLowerCase().indexOf(text.toLowerCase()) > -1
      )
    }
  }

}
