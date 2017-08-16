import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Rx';

import { Title }  from '@angular/platform-browser';

import { UserService }    from '../user';
import { LoadingService } from '../loading';
import { RecommendationService } from './recommendation.service';

@Component({
  selector: 'ww-recommendations',
  templateUrl: './recommendations.component.html',
  styleUrls: ['./recommendations.component.scss']
})
export class RecommendationsComponent implements OnInit, OnDestroy {
  currentUserSubscription: Subscription;
  currentUser;

  recommendationsSubscription: Subscription;
  recommendations;

  constructor(
    private titleService: Title,
    private userService: UserService,
    private loadingService: LoadingService,
    private recommendationService: RecommendationService) { }

  ngOnInit() {
    this.currentUserSubscription = this.userService.updateCurrentUser.subscribe(
       result =>  {
         this.getRecommendations(result['_id'])
         this.currentUser = result;
       })

    this.recommendationsSubscription = this.recommendationService.updateRecommendations.subscribe(
      result => { this.recommendations = result; })

    this.titleService.setTitle("Recommendations");
    this.loadingService.setLoader(false, "");
  }

  ngOnDestroy() {
    if(this.currentUserSubscription) this.currentUserSubscription.unsubscribe();
    if(this.recommendationsSubscription) this.recommendationsSubscription.unsubscribe();
  }

  getRecommendations(id)  {
    this.recommendationService.getRecommendations(id).subscribe(
      result =>  {})
  }

}
