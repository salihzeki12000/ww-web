import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Rx';
import { Title }        from '@angular/platform-browser';

import { UserService }        from '../../../user';
import { RelationshipService} from '../../../relationships';
import { ItineraryService }   from '../../itinerary.service';
import { LoadingService }     from '../../../loading';

@Component({
  selector: 'ww-itinerary-following',
  templateUrl: './itinerary-following.component.html',
  styleUrls: ['./itinerary-following.component.scss']
})
export class ItineraryFollowingComponent implements OnInit, OnDestroy {
  itineraries;
  filteredItineraries = [];

  user;
  userSubscription: Subscription;

  followingItinSubscription: Subscription;

  constructor(
    private titleService: Title,
    private loadingService: LoadingService,
    private userService: UserService,
    private relationshipService: RelationshipService,
    private itineraryService: ItineraryService) { }

  ngOnInit() {
    this.loadingService.setLoader(true,"")
    this.titleService.setTitle("Following itineraries");

    this.userSubscription = this.userService.updateCurrentUser.subscribe(
     result => {
       this.user = result;
       if (this.itineraries) this.filterItineraries();
     })

    this.relationshipService.filterFollowingItineraries();

    this.followingItinSubscription = this.relationshipService.updateFollowingItins.subscribe(
      result => {
        this.itineraries = result;
        if(this.user) this.filterItineraries();
      })
  }

  ngOnDestroy() {
    if(this.userSubscription) this.userSubscription.unsubscribe();
    if(this.followingItinSubscription) this.followingItinSubscription.unsubscribe();
  }

  filterItineraries() {
    let userItins = this.user['itineraries'];
    for (let i = 0; i < userItins.length; i++) {
      for (let j = 0; j < this.itineraries.length; j++) {
        if(userItins[i]['_id'] === this.itineraries[j]['_id'])  {
          this.itineraries.splice(j,1)
        };
      }
    }

    this.filteredItineraries = this.itineraries;

    this.loadingService.setLoader(false,"")
  }

  filterSearch(text)  {
    if(!text)   {
      this.filteredItineraries = this.itineraries;
    } else  {
      this.filteredItineraries = Object.assign([], this.itineraries).filter(
        itin => itin.name.toLowerCase().indexOf(text.toLowerCase()) > -1
      )
    }
  }

}
