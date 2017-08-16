import { Component, OnInit, Input, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';

import { RecommendationService } from '../recommendation.service';
import { FlashMessageService }   from '../../flash-message';

@Component({
  selector: 'ww-recommendation',
  templateUrl: './recommendation.component.html',
  styleUrls: ['./recommendation.component.scss']
})
export class RecommendationComponent implements OnInit {
  @Input() recommendation;
  @Input() currentUser;

  addRecommendation = false;
  deleteRecommendation = false;

  constructor(
    private router: Router,
    private renderer: Renderer2,
    private flashMessageService: FlashMessageService,
    private recommendationService: RecommendationService) { }

  ngOnInit() {
    this.sortFormat();
  }

  sortFormat()  {
    if(this.recommendation['message']) {
      this.recommendation['formatted_message'] = this.recommendation['message'].replace(/\r?\n/g, '<br/> ');
    }
  }

  navigate()  {
    this.recommendation['read'] = true;

    this.router.navigateByUrl('/me/recommendation/' + this.recommendation['_id']);

    this.recommendationService.updateRecommendation(this.recommendation).subscribe(
      result => {})
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
