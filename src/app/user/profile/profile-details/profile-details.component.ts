import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { User } from '../../user';
import { UserService } from '../../user.service';

@Component({
  selector: 'ww-profile-details',
  templateUrl: './profile-details.component.html',
  styleUrls: ['./profile-details.component.scss']
})
export class ProfileDetailsComponent implements OnInit {
  user: User;

  constructor(
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit() {
    this.userService.getCurrentUserDetails()
        .subscribe(
          data => {
            this.user = data;
            console.log(this.user);
        },
          error => console.error(error)
      );
  }

  onDelete()  {
    // this.userService.deleteUser()
    //     .subscribe(
    //       data => {
    //         console.log(data);
    //         this.router.navigateByUrl('/');
    //     });
  }

}
