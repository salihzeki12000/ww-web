import { Component, OnInit } from '@angular/core';
import {
    Router,
    Event as RouterEvent,
    NavigationStart,
    NavigationEnd,
    NavigationCancel,
    NavigationError
} from '@angular/router';

import { UserService } from './user';

@Component({
  selector: 'ww-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  loading: boolean = true;

  constructor(
    private userService: UserService,
    private router: Router) {
      router.events.subscribe((event: RouterEvent) => {
        this.navigationInterceptor(event);
      });
    }
  // http://stackoverflow.com/questions/37069609/show-loading-screen-when-navigating-between-routes-in-angular-2
  navigationInterceptor(event: RouterEvent): void {
    if (event instanceof NavigationStart) {
      this.loading = true;
    }
    if (event instanceof NavigationEnd) {
      this.loading = false;
    }

    // Set loading state to false in both of the below events to hide the spinner in case a request fails
    if (event instanceof NavigationCancel) {
      this.loading = false;
    }
    if (event instanceof NavigationError) {
      this.loading = false;
    }
   }

  ngOnInit()  {
    console.log("app component init");
    if(localStorage.getItem('token')) {
      this.userService.getCurrentUserDetails()
          .subscribe(
            data => {
            }
          );
    }
  }
}
