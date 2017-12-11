import { Component, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Title }  from '@angular/platform-browser';
import { Subscription } from 'rxjs/Rx';

import { RecommendationService }  from '../recommendation.service';
import { ItineraryEventService }  from '../../itinerary/itinerary-events/itinerary-event.service';
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
            this.timeAgo();

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

  timeAgo() {
    let timePosted = new Date(this.recommendation['created_at']).getTime();
    let timeDiff = (Date.now() - timePosted) / 1000;

    let units = [
      { name: "minute", in_seconds: 60, limit: 3600 },
      { name: "hour", in_seconds: 3600, limit: 86400 },
      { name: "day", in_seconds: 86400, limit: 604800 }
    ];

    if(timeDiff < 60) {
      this.recommendation['time_ago'] = "Less than a minute ago"
    } else if(timeDiff > 604800) {
      this.recommendation['time_ago'] = '';
    } else {
      for (let j = 0; j < units.length; j++) {
        if(timeDiff < units[j]['limit'])  {
          let timeAgo =  Math.floor(timeDiff / units[j].in_seconds);
          this.recommendation['time_ago'] = timeAgo + " " + units[j].name + (timeAgo > 1 ? "s" : "") + " ago";
          j = units.length;
        };
      }
    }
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

    if(this.recommendation['place']['opening_hours'] !== ''){
      this.recommendation['formatted_hours'] = this.recommendation['place']['opening_hours'].replace(/\r?\n/g, '<br/> ');
    } else if(this.recommendation['opening_hours']) {
      this.recommendation['formatted_hours'] = this.recommendation['opening_hours'].replace(/\r?\n/g, '<br/> ');
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
