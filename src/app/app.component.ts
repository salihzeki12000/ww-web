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
