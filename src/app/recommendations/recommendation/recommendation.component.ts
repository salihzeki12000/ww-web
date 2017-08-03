import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

import { RecommendationService } from '../recommendation.service';

@Component({
  selector: 'ww-recommendation',
  templateUrl: './recommendation.component.html',
  styleUrls: ['./recommendation.component.scss']
})
export class RecommendationComponent implements OnInit {
  @Input() recommendation;
  @Input() currentUser;

  addRecommendation = false;

  constructor(
    private router: Router,
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
      result => {
        console.log(result);
      }
    )
  }

  addToItinerary()  {
    this.addRecommendation = true;
  }

  cancelAdd() {
    this.addRecommendation = false;
  }

  delete()  {

  }

}
