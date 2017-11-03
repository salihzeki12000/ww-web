import { Component, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { Subscription } from 'rxjs/Rx';

import { UserService }  from '../../../user';
import { LoadingService } from '../../../loading';

@Component({
  selector: 'ww-itinerary-all',
  templateUrl: './itinerary-all.component.html',
  styleUrls: ['./itinerary-all.component.scss']
})
export class ItineraryAllComponent implements OnInit, OnDestroy {
  itineraries;
  filteredItineraries = [];

  user;
  userSubscription: Subscription;

  showItineraryForm = false;

  constructor(
    private loadingService: LoadingService,
    private renderer: Renderer2,
    private userService: UserService) { }

  ngOnInit() {
    this.loadingService.setLoader(true,"")

    this.userSubscription = this.userService.updateCurrentUser.subscribe(
     result => {
       this.user = result;
       this.itineraries = Object.keys(result['itineraries']).map(key => result['itineraries'][key]);
       this.filteredItineraries = this.itineraries;

       this.loadingService.setLoader(false,"")
     })
  }

  ngOnDestroy() {
    if(this.userSubscription) this.userSubscription.unsubscribe();
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

  createItinerary() {
    this.showItineraryForm = true;
    this.renderer.addClass(document.body, 'prevent-scroll');
  }

  hideItineraryForm(hide) {
    this.showItineraryForm = false;
    this.renderer.removeClass(document.body, 'prevent-scroll');
  }

}
