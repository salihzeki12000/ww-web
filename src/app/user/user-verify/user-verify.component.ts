import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Title }  from '@angular/platform-browser';

import { LoadingService } from '../../loading';
import { AuthService }    from '../../auth/auth.service';
import { UserService }    from '../user.service';

@Component({
  selector: 'ww-user-verify',
  templateUrl: './user-verify.component.html',
  styleUrls: ['./user-verify.component.scss']
})
export class UserVerifyComponent implements OnInit {
  verified = false;

  constructor(
    private titleService: Title,
    private userService: UserService,
    private authService: AuthService,
    private loadingService: LoadingService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit() {
    this.loadingService.setLoader(true, "Verifying your account...");

    this.titleService.setTitle("Verify account")

    this.route.params.forEach((params: Params)  =>  {
      let verify = {
        token: params['token'],
        _id: params['id'],
      }

      this.authService.verify(verify).subscribe(
        result => {
          this.verified = true;

          setTimeout(() =>  {
            this.router.navigateByUrl('/me')
          }, 5000)
        }
      )
    })
  }

}
