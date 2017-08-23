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
  selector: 'ww-recommendation-display',
  templateUrl: './recommendation-display.component.html',
  styleUrls: ['./recommendation-display.component.scss']
})
export class RecommendationDisplayComponent implements OnInit, OnDestroy {
  recommendation;

  currentUserSubscription: Subscription;
  currentUser;

  itineraries;

  addRecommendation = false;
  deleteRecommendation = false;

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




  // add to itinerary
  addToItinerary()  {
    this.addRecommendation = true;
    this.preventScroll(true);
  }

  cancelAdd() {
    this.addRecommendation = false;
    this.preventScroll(false);
  }

  updateAdd(itinerary) {
    this.recommendation['itinerary'] = itinerary;
  }



  // delete recommendation
  delete()  {
    this.deleteRecommendation = true;
    this.preventScroll(true);
  }

  cancelDelete()  {
    this.deleteRecommendation = false
    this.preventScroll(false);
  }

  confirmDelete()  {
    this.recommendationService.deleteRecommendation(this.recommendation).subscribe(
      result => {
        this.flashMessageService.handleFlashMessage(result.message);
      })

    this.cancelDelete()
  }




  // others
  preventScroll(value)  {
    if(value) {
      this.renderer.addClass(document.body, 'prevent-scroll');
    } else  {
      this.renderer.removeClass(document.body, 'prevent-scroll');
    }
  }
}
