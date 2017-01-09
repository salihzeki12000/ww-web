import { Component, OnInit } from '@angular/core';

import { UserService } from './user.service';

@Component({
  selector: 'ww-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  username;
  userId;

  constructor(private userService: UserService) { }

  ngOnInit() {
    // this.username = this.userService.getCurrentUserName();
    // this.userService.getCurrentUserId();
    // this.userId = this.userService.userId;

  }

}
