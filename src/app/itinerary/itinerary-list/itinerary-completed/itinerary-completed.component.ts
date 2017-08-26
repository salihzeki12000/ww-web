import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Rx';
import { Router } from '@angular/router';
import { Title }        from '@angular/platform-browser';

import { UserService }  from '../../../user';

@Component({
  selector: 'ww-itinerary-completed',
  templateUrl: './itinerary-completed.component.html',
  styleUrls: ['./itinerary-completed.component.scss']
})
export class ItineraryCompletedComponent implements OnInit, OnDestroy {
  itineraries;
  completed =[];

  currentUser;
  currentUserSubscription: Subscription;

  constructor(
    private titleService: Title,
    private userService: UserService,
    private router: Router) { }

  ngOnInit() {
    this.titleService.setTitle("Itineraries | completed");

    this.currentUserSubscription = this.userService.updateCurrentUser.subscribe(
     result => {
       this.currentUser = result;
       this.itineraries = Object.keys(result['itineraries']).map(key => result['itineraries'][key]);
       this.sortItin(this.itineraries);
     })
  }

  sortItin(itineraries) {
    this.completed = [];
    for (let i = 0; i < itineraries.length; i++) {
      if(itineraries[i]['completed']) {
        this.completed.push(itineraries[i]);
      }
    }
  }

  ngOnDestroy() {
    if(this.currentUserSubscription) this.currentUserSubscription.unsubscribe();
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
