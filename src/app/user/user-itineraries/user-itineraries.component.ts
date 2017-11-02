import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Rx';

import { UserService }    from '../user.service';
import { LoadingService } from '../../loading';
import { ItineraryService, ItineraryEventService } from '../../itinerary';

@Component({
  selector: 'ww-user-itineraries',
  templateUrl: './user-itineraries.component.html',
  styleUrls: ['./user-itineraries.component.scss']
})
export class UserItinerariesComponent implements OnInit, OnDestroy {
  itineraries;
  filteredItineraries = [];

  userSubscription: Subscription;
  user;

  currentUserSubscription: Subscription;
  currentUser;

  constructor(
    private itineraryService: ItineraryService,
    private itineraryEventService: ItineraryEventService,
    private userService: UserService,
    private loadingService: LoadingService) { }

  ngOnInit() {
    this.currentUserSubscription = this.userService.updateCurrentUser.subscribe(
      result => { this.currentUser = result })

    this.userSubscription = this.userService.updateDisplayUser.subscribe(
      result => {
        this.user = result;
        this.itineraries = Object.keys(result['itineraries']).map(key => result['itineraries'][key]);

        this.sortItin();
      })
  }

  ngOnDestroy() {
    if(this.userSubscription) this.userSubscription.unsubscribe();
    if(this.currentUserSubscription) this.currentUserSubscription.unsubscribe();
  }

  sortItin()  {
    this.itineraries.sort((a,b)  =>  {
      return new Date(b['date_to']).getTime() - new Date(a['date_to']).getTime();
    })

    for (let i = 0; i < this.itineraries.length; i++) {
      if(this.itineraries[i]['private'])  {
        this.itineraries.splice(i,1);
        i--;
      } else if(this.itineraries[i]['corporate']['status'] && !this.itineraries[i]['corporate']['publish']) {
        this.itineraries.splice(i,1);
        i--;
      }
    }

    this.filteredItineraries = this.itineraries;

    setTimeout(() =>  {
      this.loadingService.setLoader(false, "");
    }, 1500)
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
