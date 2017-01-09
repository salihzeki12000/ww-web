import { Component, OnInit } from '@angular/core';

import { UserService } from './user';

@Component({
  selector: 'ww-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(private userService: UserService) {}

  ngOnInit()  {
    if(localStorage.getItem('token')) {
      console.log("Initialise get user details from app component");
      this.userService.getCurrentUserDetails()
          .subscribe(
            data => {
            }
          );
    }
  }
}
