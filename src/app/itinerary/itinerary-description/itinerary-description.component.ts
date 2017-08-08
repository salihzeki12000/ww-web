import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Rx';

import { UserService }           from '../../user';
import { ItineraryService }      from '../itinerary.service';
import { LoadingService }        from '../../loading';

@Component({
  selector: 'ww-itinerary-description',
  templateUrl: './itinerary-description.component.html',
  styleUrls: ['./itinerary-description.component.scss']
})
export class ItineraryDescriptionComponent implements OnInit, OnDestroy {

  currentItinerarySubscription: Subscription;
  currentItinerary;

  currentUserSubscription: Subscription;
  currentUser;
  validUser = false;

  editing = false;

  constructor(
    private userService: UserService,
    private itineraryService: ItineraryService,
    private loadingService: LoadingService) { }

  ngOnInit() {
    this.currentItinerarySubscription = this.itineraryService.currentItinerary.subscribe(
      result =>{
        this.currentItinerary = result;

        if(this.currentItinerary['description'])  {
          this.currentItinerary['formatted_description'] = this.currentItinerary['description']['content'].replace(/\r?\n/g, '<br/> ');
        } else  {
          this.currentItinerary['formatted_description'] = '';
        }

      })

    this.currentUserSubscription = this.userService.updateCurrentUser.subscribe(
      result => {
        this.currentUser = result;
        this.checkSameUser();
      })

    this.loadingService.setLoader(false, "");
  }

  ngOnDestroy() {
    if(this.currentItinerarySubscription) this.currentItinerarySubscription.unsubscribe();
  }

  checkSameUser() {
    if(this.currentItinerary['created_by']['_id'] === this.currentUser['_id'])  {
      this.validUser = true;
    }
  }

  save(content) {
    this.editing = false;

    this.currentItinerary['formatted_description'] = content.replace(/\r?\n/g, '<br/> ');
    this.currentItinerary['description']['content'] = content;

    this.itineraryService.editItin(this.currentItinerary, 'edit').subscribe(
      data => {})
  }

}
