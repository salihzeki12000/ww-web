import { Component, OnInit } from '@angular/core';

import { UserService } from '../../user/user.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'ww-itinerary-preview',
  templateUrl: './itinerary-preview.component.html',
  styleUrls: ['./itinerary-preview.component.scss']
})
export class ItineraryPreviewComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private userService: UserService) { }

  ngOnInit() {
    let isLoggedIn = this.authService.isLoggedIn();

    if(isLoggedIn)  {
      this.userService.getCurrentUser()
        .subscribe( data => {} );
    }

  }

}
