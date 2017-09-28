import { Component, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { Title }  from '@angular/platform-browser';
import { Router } from '@angular/router';

import { LoadingService } from '../loading';

@Component({
  selector: 'ww-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit, OnDestroy {
  reroute = '/me';
  showAuth = false;
  showSignin = false;
  showSignup = false;

  // pictures
  mtfuji = 'https://res.cloudinary.com/wwfileupload/image/upload/v1505975133/mt_fuji_ggztym.jpg';

  summary = 'http://res.cloudinary.com/wwfileupload/image/upload/v1505975635/landing%20page/example-summary.png';
  description = 'http://res.cloudinary.com/wwfileupload/image/upload/v1505975650/landing%20page/example-description.png';
  transport = 'https://res.cloudinary.com/wwfileupload/image/upload/v1505975498/landing page/example-transport.png';
  accommodation = 'https://res.cloudinary.com/wwfileupload/image/upload/v1505975571/landing page/example-accommodation.png';
  activity = 'https://res.cloudinary.com/wwfileupload/image/upload/v1505975569/landing page/example-activity.png';
  resource = 'https://res.cloudinary.com/wwfileupload/image/upload/v1505975568/landing page/example-resource.png';
  map = 'https://res.cloudinary.com/wwfileupload/image/upload/v1505975581/landing page/example-map.png';

  summaryM = 'https://res.cloudinary.com/wwfileupload/image/upload/v1505976231/landing page/example-summary-mobile.png';
  descriptionM = 'https://res.cloudinary.com/wwfileupload/image/upload/v1505976285/landing page/example-description-mobile.png';
  transportM = 'https://res.cloudinary.com/wwfileupload/image/upload/v1505976229/landing page/example-transport-mobile.png';
  accommodationM = 'https://res.cloudinary.com/wwfileupload/image/upload/v1505976282/landing page/example-accommodation-mobile.png';
  activityM = 'https://res.cloudinary.com/wwfileupload/image/upload/v1505976284/landing page/example-activity-mobile.png';
  resourceM = 'https://res.cloudinary.com/wwfileupload/image/upload/v1505976228/landing page/example-resource-mobile.png';
  mapM = 'https://res.cloudinary.com/wwfileupload/image/upload/v1505976230/landing page/example-map-mobile.png';

  constructor(
    private titleService: Title,
    private renderer: Renderer2,
    private loadingService: LoadingService,
    private router: Router) {}

  ngOnInit() {
    this.titleService.setTitle("wondererwanderer");

    this.loadingService.setLoader(false, "");
  }

  ngOnDestroy() {
    this.loadingService.setLoader(true, "");
  }


  getSignin() {
    this.showSignin = true;
    this.preventScroll(true);
  }

  getSignup() {
    this.showSignup = true;
    this.preventScroll(true);
  }

  hideSignin(event)  {
    this.showSignin = false;
    this.preventScroll(false);
  }

  hideSignup(event)  {
    this.showSignup = false;
    this.preventScroll(false);
  }

  routeTo(id)  {
    this.loadingService.setLoader(true, "Retrieving itinerary...");

    this.router.navigateByUrl('/preview/itinerary/' + id + '/summary')
  }

  preventScroll(value)  {
    if(value) {
      this.renderer.addClass(document.body, 'prevent-scroll');
    } else  {
      this.renderer.removeClass(document.body, 'prevent-scroll');
    }
  }
}
