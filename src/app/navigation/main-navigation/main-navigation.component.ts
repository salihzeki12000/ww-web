import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Rx';

import { AuthService } from '../../auth';
import { User, UserService } from '../../user';

@Component({
  selector: 'ww-main-navigation',
  templateUrl: './main-navigation.component.html',
  styleUrls: ['./main-navigation.component.scss']
})
export class MainNavigationComponent implements OnInit {
  currentUser: User;

  currentUserSubscription: Subscription;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit() {
    this.currentUser = this.userService.currentUser;
    console.log(this.currentUser);
    this.currentUserSubscription = this.userService.updateCurrentUser
                                       .subscribe(
                                         data =>  {
                                           this.currentUser = data;
                                           console.log(this.currentUser);
                                         }
                                       )

    // this.userService.getCurrentUserDetails()
    //     .subscribe( data => {
    //       this.currentUser = this.userService.currentUser;
    //       console.log(this.currentUser);
    //     });
  }

  logout()  {
    this.authService.logout();
    console.log("logout successful");
    // this.router.navigateByUrl("/");
  }

}
