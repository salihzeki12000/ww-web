import { Component, OnInit, HostListener, Renderer2 } from '@angular/core';
import { Router, NavigationEnd }  from '@angular/router';
import { Subscription } from 'rxjs/Rx';

import { AuthService }  from './auth';
import { UserService }  from './user';
import { ErrorMessageService } from './error-message';

@Component({
  selector: 'ww-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  currentUserSubscription: Subscription;

  constructor(
    private router: Router,
    private renderer: Renderer2,
    private errorMessageService: ErrorMessageService,
    private authService: AuthService,
    private userService: UserService) { }

  ngOnInit()  {
    if(!navigator.onLine) {
      let message = {
        title: "No internet connection",
        error: {
          message: "No internet connection"
        }
      }
      console.log('send error message')
      this.errorMessageService.handleErrorMessage(message)
    }

    let isLoggedIn = this.authService.isLoggedIn();

    if(isLoggedIn)  {
      this.currentUserSubscription = this.userService.updateCurrentUser.subscribe(
        result => {
          let oneDay = 86400000; 86400000
          let today = new Date();
          let join = new Date(result['created_at']).getTime();

          if(!result['validated'])  {
            if(today.getTime() >= (join + oneDay) )  {
              this.router.navigateByUrl('/account-not-verified')
            }
          }
      })
    }

    // to scroll to top when route change
    this.router.events.subscribe((event: NavigationEnd) => {
      if(event instanceof NavigationEnd) {
        window.scrollTo(0, 0);
        this.renderer.removeClass(document.body, 'prevent-scroll');
      }
    })
  }

  @HostListener('window', ['$event'])
  onInit(event)  {
    console.log(event)
  }
}
