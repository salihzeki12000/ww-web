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

  summary = 'https://res.cloudinary.com/wwfileupload/image/upload/v1511074663/example-summary_x7cc87.png';
  description = 'https://res.cloudinary.com/wwfileupload/image/upload/v1511074669/example-description_h1lvct.png';
  transport = 'https://res.cloudinary.com/wwfileupload/image/upload/v1511074659/example-transport_uu1dce.png';
  accommodation = 'https://res.cloudinary.com/wwfileupload/image/upload/v1511074661/example-accommodation_mvx8y8.png';
  activity = 'https://res.cloudinary.com/wwfileupload/image/upload/v1511074663/example-activity_m20vdw.png';
  resource = 'https://res.cloudinary.com/wwfileupload/image/upload/v1511074661/example-resource_kzczxi.png';
  map = 'https://res.cloudinary.com/wwfileupload/image/upload/v1511074667/example-map_ptgnef.png';

  summaryM = 'https://res.cloudinary.com/wwfileupload/image/upload/v1511075362/example-summary-mobile_hrn5vv.png';
  descriptionM = 'https://res.cloudinary.com/wwfileupload/image/upload/v1511075360/example-description-mobile_cocrir.png';
  transportM = 'https://res.cloudinary.com/wwfileupload/image/upload/v1511075361/example-transport-mobile_pqevms.png';
  accommodationM = 'https://res.cloudinary.com/wwfileupload/image/upload/v1511075364/exmaple-accommodation-mobile_al6yeh.png';
  activityM = 'https://res.cloudinary.com/wwfileupload/image/upload/v1511075369/example-activity-mobile_npgaay.png';
  resourceM = 'https://res.cloudinary.com/wwfileupload/image/upload/v1511075359/example-resource-mobile_zrvdu2.png';
  mapM = 'https://res.cloudinary.com/wwfileupload/image/upload/v1511075364/example-map-mobile_thh8ff.png';

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
