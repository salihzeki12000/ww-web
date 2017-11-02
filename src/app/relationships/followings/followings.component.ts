import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Rx';
import { Title }        from '@angular/platform-browser';

import { RelationshipService } from '../relationship.service';
import { LoadingService }      from '../../loading';

@Component({
  selector: 'ww-followings',
  templateUrl: './followings.component.html',
  styleUrls: ['./followings.component.scss']
})
export class FollowingsComponent implements OnInit, OnDestroy {
  relationshipSubscription: Subscription;
  followings = [];
  filteredFollowings = [];

  constructor(
    private loadingService: LoadingService,
    private titleService: Title,
    private relationshipService: RelationshipService) { }

  ngOnInit() {
    this.titleService.setTitle("Relationships | Followings");

    this.relationshipSubscription = this.relationshipService.updateRelationships.subscribe(
     result => {
       this.followings = Object.keys(result['followings']).map(key => result['followings'][key]);

       this.filteredFollowings = this.followings;
     })

     this.loadingService.setLoader(false, "");
  }

  ngOnDestroy() {
    if(this.relationshipSubscription) this.relationshipSubscription.unsubscribe();
  }

  filterSearch(text)  {
    if(!text)   {
      this.filteredFollowings = this.followings;
    } else  {
      this.filteredFollowings = Object.assign([], this.followings).filter(
        following => following.following.username.toLowerCase().indexOf(text.toLowerCase()) > -1
      )
    }
  }
}
