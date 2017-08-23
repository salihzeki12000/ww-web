import { Component, OnInit } from '@angular/core';
import { Router }            from '@angular/router';
import { Title }             from '@angular/platform-browser';
import { Subscription }      from 'rxjs/Rx';

import { LoadingService } from '../../loading';
import { AuthService }    from '../../auth';
import { UserService }    from '../user.service';

@Component({
  selector: 'ww-user-unverified',
  templateUrl: './user-unverified.component.html',
  styleUrls: ['./user-unverified.component.scss']
})
export class UserUnverifiedComponent implements OnInit {
  currentUserSubscription: Subscription;
  user;

  requested = false;

  constructor(
    private router: Router,
    private titleService: Title,
    private authService: AuthService,
    private userService: UserService,
    private loadingService: LoadingService,
  ) { }

  ngOnInit() {
    this.titleService.setTitle("Access Denied")

    this.currentUserSubscription = this.userService.updateCurrentUser.subscribe(
      result => {
        this.user = result;
      }
    )

    this.loadingService.setLoader(false, "");
  }

  request() {
    let user = {
      _id: this.user['_id']
    }

    this.authService.newVerification(user).subscribe(
      result => {
        this.requested = true;
        setTimeout(() =>  {
          this.router.navigateByUrl('/')
        }, 10000)
      }
    )
  }
}
