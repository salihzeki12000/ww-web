import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Rx';
import { Router }       from '@angular/router';

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
  userSubscription: Subscription;
  currentUser;

  constructor(
    private itineraryService: ItineraryService,
    private itineraryEventService: ItineraryEventService,
    private userService: UserService,
    private loadingService: LoadingService,
    private router: Router) { }

  ngOnInit() {
    this.userSubscription = this.userService.updateDisplayUser.subscribe(
      result => {
        this.currentUser = result;
        this.itineraries = Object.keys(result['itineraries']).map(key => result['itineraries'][key]);
        this.sortItin();
      }
    )
  }

  ngOnDestroy() {
    if(this.userSubscription) this.userSubscription.unsubscribe();
  }

  sortItin()  {
    this.itineraries.sort((a,b)  =>  {
      return new Date(b['date_to']).getTime() - new Date(a['date_to']).getTime();
    })

    for (let i = 0; i < this.itineraries.length; i++) {
      if(this.itineraries[i]['private'])  {
        this.itineraries.splice(i,1);
        i--;
      }
    }
  }

  routeToItin(itinerary)  {
    this.router.navigateByUrl('/wondererwanderer/' + this.currentUser['_id'] + '/itinerary/' + itinerary['_id'])
    this.loadingService.setLoader(true, "");
  }

}
