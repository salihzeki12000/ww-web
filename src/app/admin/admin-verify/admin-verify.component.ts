import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Title }  from '@angular/platform-browser';

import { LoadingService } from '../../loading';
import { AdminService }   from '../admin.service';

@Component({
  selector: 'ww-admin-verify',
  templateUrl: './admin-verify.component.html',
  styleUrls: ['./admin-verify.component.scss']
})
export class AdminVerifyComponent implements OnInit {
  admin;
  validated = true;
  validatedMsg = '';
  passwordForm: FormGroup;

  constructor(
    private titleService: Title,
    private adminService: AdminService,
    private loadingService: LoadingService,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute) {
      this.passwordForm = this.formBuilder.group({
        'password': ['', Validators.compose([ Validators.required, Validators.minLength(6)])],
        'confirmPassword': ['', Validators.compose([ Validators.required, this.passwordsAreEqual.bind(this) ])],
      })
    }

  ngOnInit() {
    this.titleService.setTitle("Admin Account Validation");

    this.route.params.forEach((params: Params)  =>  {
      let token = params['token'];
      let id = params['id'];

      this.adminService.getAdmin(id).subscribe(
        result => {
          this.admin = result.admin;

          if(!this.admin['validated']) {
            this.validated = false;
          } else{
            this.validatedMsg = "Your account has been validated. If you have forgotten your password, please reset it via the admin log in screen."
          }

        }
      )

    })

    this.loadingService.setLoader(false, "");
  }

  setPassword() {
    this.loadingService.setLoader(true, "Setting your password...");

    let admin = {
      _id: this.admin['_id'],
      password: this.passwordForm.value['password']
    }

    this.adminService.setPassword(admin).subscribe(
      result => {
        this.loadingService.setLoader(true, "Logging you in...");

        let signin = {
          email: this.admin['email'],
          password: this.passwordForm.value['password']
        }

        setTimeout(() =>  {
          this.adminService.signin(signin).subscribe(
            result => {

              this.router.navigateByUrl('/admin');
            }
          )
        }, 3000)
      }
    )
  }

  passwordsAreEqual(control: FormControl): {[s: string]: boolean} {
      if (!this.passwordForm) {
          return {notMatch: true};
      }
      if (control.value !== this.passwordForm.controls['password'].value) {
          return {notMatch: true};
      }
  }

}
