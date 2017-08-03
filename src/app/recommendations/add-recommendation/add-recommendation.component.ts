import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { RecommendationService }  from '../recommendation.service';
import { ItineraryEventService }  from '../../itinerary';
import { LoadingService }         from '../../loading';
import { FlashMessageService }    from '../../flash-message';

@Component({
  selector: 'ww-add-recommendation',
  templateUrl: './add-recommendation.component.html',
  styleUrls: ['./add-recommendation.component.scss']
})
export class AddRecommendationComponent implements OnInit {
  @Input() recommendation;
  @Input() currentUser;

  @Output() cancelAdd = new EventEmitter();

  itineraries;
  itinerarySelected = false;
  itinerary;
  displayPic;

  constructor(
    private loadingService: LoadingService,
    private flashMessageService: FlashMessageService,
    private itineraryEventService: ItineraryEventService,
    private recommendationService: RecommendationService) { }

  ngOnInit() {
    this.itineraries = this.currentUser['itineraries'];
  }

  selectItinerary(itinerary)  {
    this.itinerary = itinerary;
    this.itinerarySelected = true;
  }

  selectPic(image)  {
    this.displayPic = image;
  }

  backToSelectItinerary() {
    this.itinerarySelected = false;
  }

  cancel()  {
    this.cancelAdd.emit(false);
  }

  save()  {
    this.loadingService.setLoader(true, "Adding to itinerary...");

    let newItem = {
      type: this.recommendation['type'],
      lat: this.recommendation['place']['lat'],
      lng: this.recommendation['place']['lng'],
      name: this.recommendation['place']['name'],
      location: true,
      note: this.recommendation['note'],
      photo: this.displayPic,
      recommended_by: this.recommendation['originator']["_id"]
    }

    if(this.recommendation['type'] === 'accommodation') {
      newItem['check_in_date'] = this.itinerary['date_from'];
      newItem['check_in_time'] = "15:00";
      newItem['check_out_date'] = this.itinerary['date_to'];
      newItem['check_out_time'] = "12:00";

      newItem['date'] = this.itinerary['date_from'];
      newItem['time'] = "15:00";
      newItem['city'] = this.recommendation['city'];
    }

    if(this.recommendation['type'] === 'activity')  {
      newItem['date'] = "any day";
      newItem['time'] = 'anytime';
    }

    newItem['user'] = {
      _id: this.currentUser['_id'],
      username: this.currentUser['username'],
    }

    if(this.recommendation['itinerary'] === undefined || this.recommendation['itinerary'] === '')  {
      this.recommendation['itinerary'] = [this.itinerary['_id']]
    } else  {
      this.recommendation['itinerary'].push(this.itinerary['_id']);
    }

    this.itineraryEventService.addEvent(newItem, this.itinerary).subscribe(
      result => {
        this.loadingService.setLoader(false, "");
        this.flashMessageService.handleFlashMessage(result.message);

        this.cancelAdd.emit(false)

        this.recommendationService.updateRecommendation(this.recommendation).subscribe(
          result =>{})
      })
  }

}
