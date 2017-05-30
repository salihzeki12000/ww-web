import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Rx';
import { Router } from '@angular/router';

import { UserService }  from '../../../user';

@Component({
  selector: 'ww-itinerary-upcoming',
  templateUrl: './itinerary-upcoming.component.html',
  styleUrls: ['./itinerary-upcoming.component.scss']
})
export class ItineraryUpcomingComponent implements OnInit, OnDestroy {
  itineraries;
  upcoming = [];

  currentUserSubscription: Subscription;

  constructor(
    private userService: UserService,
    private router: Router) { }

  ngOnInit() {
    this.currentUserSubscription = this.userService.updateCurrentUser
                                       .subscribe(
                                         result => {
                                           this.itineraries = Object.keys(result['itineraries']).map(key => result['itineraries'][key]);
                                           this.sortItin(this.itineraries);                                         }
                                       )
  }

  sortItin(itineraries) {
    this.upcoming = [];
    for (let i = 0; i < itineraries.length; i++) {
      if(!itineraries[i]['past']) {
        this.upcoming.push(itineraries[i]);
      }
    }
  }

  ngOnDestroy() {
    this.currentUserSubscription.unsubscribe();
  }

  routeToItin(id) {
    this.router.navigateByUrl('/me/itinerary/' + id);
  }

}
