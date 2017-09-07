import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Title }        from '@angular/platform-browser';

import { AuthService }    from '../auth.service';
import { LoadingService } from '../../loading';
import { UserService }    from '../../user';

@Component({
  selector: 'ww-reset',
  templateUrl: './reset.component.html',
  styleUrls: ['./reset.component.scss']
})
export class ResetComponent implements OnInit {
  resetForm: FormGroup;
  resetToken = '';
  username;
  email;

  resetValid = false;
  resetInvalid = false;
  resetSuccess = false;

  constructor(
    private titleService: Title,
    private userService: UserService,
    private authService: AuthService,
    private loadingService: LoadingService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder) {
      this.resetForm = this.formBuilder.group({
        'newPassword': ['', Validators.compose([ Validators.required, Validators.minLength(6)])],
        'confirmNewPassword': ['', Validators.compose([ Validators.required, this.passwordsAreEqual.bind(this) ])],
      })
   }

  ngOnInit() {
    this.titleService.setTitle("Reset password")

    this.route.params.forEach((params: Params)  =>  {
      this.resetToken = params['id'];

      this.authService.reset(this.resetToken).subscribe(
        result => {
          if(result.message === 'Reset valid') this.resetValid = true;
          if(result.message === 'Reset Invalid') this.resetInvalid = true;

          this.username = result.username;
          this.email = result.email;
        }
      )
    })

    this.loadingService.setLoader(false, "");
  }

  resetPassword() {
    this.loadingService.setLoader(true, "Resetting your password...");

    let resetPassword = {
      resetToken: this.resetToken,
      newPassword: this.resetForm.value.newPassword
    }

    this.userService.resetPassword(resetPassword).subscribe(
      result => {
        this.loadingService.setLoader(true, "Logging you in...");
        this.resetSuccess = true;

        let signin = {
          email: this.email,
          password: this.resetForm.value.newPassword
        }

        setTimeout(() =>  {
          this.authService.signin(signin).subscribe(
            result => {
              this.userService.getCurrentUser().subscribe(
                data =>{})

              this.router.navigateByUrl('/me')
            }
          )
        }, 3000)

      }
    )
  }

  passwordsAreEqual(control: FormControl): {[s: string]: boolean} {
      if (!this.resetForm) {
          return {notMatch: true};
      }
      if (control.value !== this.resetForm.controls['newPassword'].value) {
          return {notMatch: true};
      }
  }


  routeToHome() {
    this.router.navigateByUrl('/');
    this.loadingService.setLoader(true, "");
  }

  routeToForgetPw() {
    this.router.navigateByUrl('/forgot-password');
    this.loadingService.setLoader(true, "");
  }

}
