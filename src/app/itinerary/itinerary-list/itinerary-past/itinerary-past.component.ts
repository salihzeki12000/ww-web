import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Rx';
import { Router } from '@angular/router';

import { UserService }  from '../../../user';
@Component({
  selector: 'ww-itinerary-past',
  templateUrl: './itinerary-past.component.html',
  styleUrls: ['./itinerary-past.component.scss']
})
export class ItineraryPastComponent implements OnInit, OnDestroy {
  itineraries;
  past =[];

  currentUserSubscription: Subscription;

  constructor(
    private userService: UserService,
    private router: Router) { }

  ngOnInit() {
    this.currentUserSubscription = this.userService.updateCurrentUser
                                       .subscribe(
                                         result => {
                                           this.itineraries = Object.keys(result['itineraries']).map(key => result['itineraries'][key]);
                                           this.sortItin(this.itineraries);
                                         }
                                       )
  }

  sortItin(itineraries) {
    this.past = [];
    for (let i = 0; i < itineraries.length; i++) {
      if(itineraries[i]['past']) {
        this.past.push(itineraries[i]);
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
