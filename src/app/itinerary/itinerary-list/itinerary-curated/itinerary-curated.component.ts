import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Rx';
import { Title }        from '@angular/platform-browser';

import { UserService }    from '../../../user';
import { LoadingService } from '../../../loading';

@Component({
  selector: 'ww-itinerary-curated',
  templateUrl: './itinerary-curated.component.html',
  styleUrls: ['./itinerary-curated.component.scss']
})
export class ItineraryCuratedComponent implements OnInit, OnDestroy {
  itineraries;
  filteredItineraries = [];

  user;
  userSubscription: Subscription;

  constructor(
    private titleService: Title,
    private loadingService: LoadingService,
    private userService: UserService) { }

  ngOnInit() {
    this.loadingService.setLoader(true,"")
    this.titleService.setTitle("Itineraries | Curated");

    this.userService.getUser("59001ca5e0cc620004da87b8").subscribe(
      result => {
        this.itineraries = Object.keys(result['user']['itineraries']).map(key => result['user']['itineraries'][key]);

        this.filteredItineraries = this.itineraries;
        this.sortItin();
      })

    this.userSubscription = this.userService.updateCurrentUser.subscribe(
     result => {
       this.user = result;

     })
  }

  ngOnDestroy() {
    if(this.userSubscription) this.userSubscription.unsubscribe();
  }

  sortItin()  {
    for (let i = 0; i < this.itineraries.length; i++) {
      if(this.itineraries[i]['private'])  {
        this.itineraries.splice(i,1);
        i--;
      } else if(this.itineraries[i]['corporate']['status'] && !this.itineraries[i]['corporate']['publish']) {
        this.itineraries.splice(i,1);
        i--;
      }
    }

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
