import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Rx';
import { Router } from '@angular/router';

import { UserService }  from '../../../user';

@Component({
  selector: 'ww-itinerary-all',
  templateUrl: './itinerary-all.component.html',
  styleUrls: ['./itinerary-all.component.scss']
})
export class ItineraryAllComponent implements OnInit, OnDestroy {
  itineraries;
  currentUser;
  currentUserSubscription: Subscription;

  constructor(
    private userService: UserService,
    private router: Router) { }

  ngOnInit() {
    this.currentUserSubscription = this.userService.updateCurrentUser
                                       .subscribe(
                                         result => {
                                           this.currentUser = result;
                                           this.itineraries = Object.keys(result['itineraries']).map(key => result['itineraries'][key]);
                                         }
                                       )
  }

  ngOnDestroy() {
    this.currentUserSubscription.unsubscribe();
  }

  routeToItin(id) {
    this.router.navigateByUrl('/me/itinerary/' + id);
  }

  routeToUser(id) {
    if(id === this.currentUser['_id']) {
      this.router.navigateByUrl('/me/profile');
    } else  {
      this.router.navigateByUrl('/wondererwanderer/' + id)
    }
  }

}
