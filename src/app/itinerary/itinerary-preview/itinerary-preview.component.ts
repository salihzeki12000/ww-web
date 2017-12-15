import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Rx';

import { UserService }      from '../../user/user.service';
import { AuthService }      from '../../auth/auth.service';
import { ItineraryService } from '../itinerary.service';

@Component({
  selector: 'ww-itinerary-preview',
  templateUrl: './itinerary-preview.component.html',
  styleUrls: ['./itinerary-preview.component.scss']
})
export class ItineraryPreviewComponent implements OnInit, OnDestroy {

  itinerarySubscription: Subscription;
  itinerary;
  currentUser;
  start;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private itineraryService: ItineraryService) { }

  ngOnInit() {
    let isLoggedIn = this.authService.isLoggedIn();

    if(isLoggedIn)  {
      this.userService.getCurrentUser().subscribe(
        result => {
          this.currentUser = result;
          if(this.itinerary) this.getStart();
        });
    } else  {
      this.currentUser = {
        _id: "5a33bb68992e9ccd0535213a",
      }
    }

    this.itinerarySubscription = this.itineraryService.currentItinerary.subscribe(
      result => {
        this.itinerary = result;
        if(this.currentUser) this.getStart();
      })
  }

  ngOnDestroy() {
    this.endView();
    if(this.itinerarySubscription) this.itinerarySubscription.unsubscribe();
  }

  getStart()  {
    this.start = new Date();
  }

  endView() {
    let corporate = this.itinerary['corporate']['status'];
    let publish = this.itinerary['corporate']['publish'];

    if( corporate && publish && this.currentUser['_id'] !== this.itinerary['created_by']['_id'])  {

      let newView = {
        start: this.start,
        end: new Date(),
        user: this.currentUser,
        dwell: (new Date()).getTime() - this.start.getTime()
      }

      this.itinerary['views'].push(newView);

      this.itineraryService.updateItinUser(this.itinerary).subscribe(
        result => {
          console.log(result);
        })

    }
  }

}
