import { Component, OnInit } from '@angular/core';
import { Router }            from '@angular/router';
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
  validated = true;

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService) { }

  ngOnInit()  {
    let isLoggedIn = this.authService.isLoggedIn();

    if(isLoggedIn)  {
      this.currentUserSubscription = this.userService.updateCurrentUser.subscribe(
        result => {
          // this.validated = result['validated'];
          if(!result['validated'])  {
            this.router.navigateByUrl('/account-not-verified')
          }
      })
    }
  }
}
