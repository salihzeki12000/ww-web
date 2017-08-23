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

  goToSample()  {
    this.loadingService.setLoader(true, "Retrieving itinerary details...");

    this.router.navigateByUrl('/preview/itinerary/5971d919773bea000429a120/summary')
  }

  preventScroll(value)  {
    if(value) {
      this.renderer.addClass(document.body, 'prevent-scroll');
    } else  {
      this.renderer.removeClass(document.body, 'prevent-scroll');
    }
  }
}
