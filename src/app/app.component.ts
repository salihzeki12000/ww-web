import { Component, OnInit }      from '@angular/core';
import { Router, NavigationEnd }  from '@angular/router';
import { Subscription } from 'rxjs/Rx';

import { AuthService }  from './auth';
import { UserService }  from './user';

@Component({
  selector: 'ww-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  currentUserSubscription: Subscription;

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService) { }

  ngOnInit()  {
    let isLoggedIn = this.authService.isLoggedIn();

    if(isLoggedIn)  {
      this.currentUserSubscription = this.userService.updateCurrentUser.subscribe(
        result => {
          let threeDays = 259200000;
          let today = new Date();
          let join = new Date(result['created_at']).getTime();

          if(!result['validated'])  {
            if(today.getTime() >= (join + threeDays) )  {
              this.router.navigateByUrl('/account-not-verified')
            }
          }
      })
    }

    // to scroll to top when route change
    this.router.events.subscribe((event: NavigationEnd) => {
      if(event instanceof NavigationEnd) {
        window.scrollTo(0, 0);
      }
    })
  }
}
