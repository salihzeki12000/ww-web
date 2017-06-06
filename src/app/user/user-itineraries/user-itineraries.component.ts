import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Rx';

import { UserService }  from '../user.service';

@Component({
  selector: 'ww-user-itineraries',
  templateUrl: './user-itineraries.component.html',
  styleUrls: ['./user-itineraries.component.scss']
})
export class UserItinerariesComponent implements OnInit, OnDestroy {
  itineraries;
  userSubscription: Subscription;

  constructor(private userService: UserService) { }

  ngOnInit() {
    this.userSubscription = this.userService.updateDisplayUser.subscribe(
      result => {
        this.itineraries = Object.keys(result['itineraries']).map(key => result['itineraries'][key]);
        this.sortItin();
      }
    )
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
  }

  sortItin()  {
    this.itineraries.sort((a,b)  =>  {
      return new Date(b['date_to']).getTime() - new Date(a['date_to']).getTime();
    })
  }

}
