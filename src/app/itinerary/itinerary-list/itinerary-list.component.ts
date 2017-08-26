import { Component, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { Subscription } from 'rxjs/Rx';
import { Router } from '@angular/router';

import { UserService }    from '../../user';
import { LoadingService } from '../../loading';

@Component({
  selector: 'ww-itinerary-list',
  templateUrl: './itinerary-list.component.html',
  styleUrls: ['./itinerary-list.component.scss']
})
export class ItineraryListComponent implements OnInit, OnDestroy {
  itineraries;
  completed =[];
  upcoming = [];

  currentUserSubscription: Subscription;

  constructor(
    private renderer: Renderer2,
    private userService: UserService,
    private loadingService: LoadingService) { }

  ngOnInit() {
    this.currentUserSubscription = this.userService.updateCurrentUser.subscribe(
       result => {
         this.itineraries = Object.keys(result['itineraries']).map(key => result['itineraries'][key]);
         this.sortItin(this.itineraries);
       })

    this.loadingService.setLoader(false, "");
    this.renderer.removeClass(document.body, 'prevent-scroll');
  }

  sortItin(itineraries) {
    this.completed = [];
    this.upcoming = [];

    for (let i = 0; i < itineraries.length; i++) {
      if(itineraries[i]['completed'] === true) {
        this.completed.push(itineraries[i])
      } else  {
        this.upcoming.push(itineraries[i])
      }
    }
  }

  ngOnDestroy() {
    if(this.currentUserSubscription) this.currentUserSubscription.unsubscribe();

    this.loadingService.setLoader(true, "");
  }

}
