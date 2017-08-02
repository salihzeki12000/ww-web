import { Component, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Title }  from '@angular/platform-browser';
import { Subscription } from 'rxjs/Rx';

import { RecommendationService }  from '../recommendation.service';
import { ItineraryEventService }  from '../../itinerary';
import { LoadingService }         from '../../loading';
import { UserService }            from '../../user';
import { FlashMessageService }    from '../../flash-message';

@Component({
  selector: 'ww-recommendation',
  templateUrl: './recommendation.component.html',
  styleUrls: ['./recommendation.component.scss']
})
export class RecommendationComponent implements OnInit, OnDestroy {
  recommendation;

  currentUserSubscription: Subscription;
  currentUser;

  itineraries;

  showItineraries = false;
  itinerarySelected = false;
  itinerary;
  displayPic;

  constructor(
    private titleService: Title,
    private renderer: Renderer2,
    private userService: UserService,
    private flashMessageService: FlashMessageService,
    private itineraryEventService: ItineraryEventService,
    private recommendationService: RecommendationService,
    private loadingService: LoadingService,
    private route: ActivatedRoute,
    private router: Router) { }

  ngOnInit() {
    this.route.params.forEach((params: Params)  =>  {
      if(params['id'])  {
        let id = params['id'];

        this.recommendationService.getRecommendation(id).subscribe(
          result => {
            this.recommendation = result.recommendation;

            let title = "Recommendation | " + this.recommendation.place.name
            this.titleService.setTitle(title);

            this.sortFormat();

            console.log(result);
            this.loadingService.setLoader(false, "");
          }
        )
      }
    })

    this.currentUserSubscription = this.userService.updateCurrentUser.subscribe(
      result => {
        this.currentUser = result;
        this.itineraries = result['itineraries'];
      })
  }

  ngOnDestroy() {
    if(this.currentUserSubscription) this.currentUserSubscription.unsubscribe();
  }

  sortFormat()  {
    if(this.recommendation['note']) {
      this.recommendation['formatted_note'] = this.recommendation['note'].replace(/\r?\n/g, '<br/> ');
    }

    if(this.recommendation['message']) {
      this.recommendation['formatted_message'] = this.recommendation['message'].replace(/\r?\n/g, '<br/> ');
    }

    if(this.recommendation['place']['opening_hours'])  {
      this.recommendation['formatted_hours'] = this.recommendation['place']['opening_hours'].replace(/\r?\n/g, '<br/> ');
    }

    if(this.recommendation['place']['photos'].length > 0)  {
      this.displayPic = this.recommendation['place']['photos'][0];
    }
  }

  addToItinerary()  {
    this.showItineraries = true;
    this.preventScroll(true);
  }

  cancel()  {
    this.showItineraries = false;
    this.itinerarySelected = false;
    this.preventScroll(false);
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
    console.log(this.recommendation['itinerary'])
    if(this.recommendation['itinerary'] === undefined || this.recommendation['itinerary'] === '')  {
      this.recommendation['itinerary'] = [this.itinerary['_id']]
    } else  {
      this.recommendation['itinerary'].push(this.itinerary['_id']);
    }

    this.itineraryEventService.addEvent(newItem, this.itinerary).subscribe(
      result => {
        this.loadingService.setLoader(false, "");
        this.flashMessageService.handleFlashMessage(result.message);
        this.cancel();
        this.preventScroll(false);

        this.recommendationService.updateRecommendation(this.recommendation).subscribe(
          result =>{})
      })
  }


  preventScroll(value)  {
    if(value) {
      this.renderer.addClass(document.body, 'prevent-scroll');
    } else  {
      this.renderer.removeClass(document.body, 'prevent-scroll');
    }
  }
}
