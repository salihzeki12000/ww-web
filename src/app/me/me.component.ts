import { Component, OnInit } from '@angular/core';

import { UserService } from '../user';

@Component({
  selector: 'ww-me',
  templateUrl: './me.component.html',
  styleUrls: ['./me.component.scss']
})
export class MeComponent implements OnInit {

  constructor(private userService: UserService) { }

  ngOnInit() {
    this.userService.getCurrentUser()
        .subscribe(
          data => {
          }
        );
  }
}
