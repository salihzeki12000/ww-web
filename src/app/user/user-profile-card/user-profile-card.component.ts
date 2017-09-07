import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

import { LoadingService } from '../../loading';

@Component({
  selector: 'ww-user-profile-card',
  templateUrl: './user-profile-card.component.html',
  styleUrls: ['./user-profile-card.component.scss']
})
export class UserProfileCardComponent implements OnInit {
  @Input() user;
  @Input() currentUser;

  constructor(
    private router: Router,
    private loadingService: LoadingService) { }

  ngOnInit() {
  }

  routeToUser(id) {
    if(this.currentUser)  {

      if(id === this.currentUser['_id']) {
        this.router.navigateByUrl('/me/profile');
      } else  {
        this.router.navigateByUrl('/wondererwanderer/' + id)
      }

      this.loadingService.setLoader(true, "");
    }

  }

}
