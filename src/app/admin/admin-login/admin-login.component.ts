import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Title }  from '@angular/platform-browser';

import { LoadingService } from '../../loading';
import { AdminService }   from '../admin.service';

@Component({
  selector: 'ww-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss']
})
export class AdminLoginComponent implements OnInit {
  signinForm: FormGroup;

  constructor(
    private titleService: Title,
    private router: Router,
    private adminService: AdminService,
    private formBuilder: FormBuilder,
    private loadingService: LoadingService) {
    this.signinForm = formBuilder.group({
      'email' : ['', Validators.compose([ Validators.required, this.validEmail ])],
      'password' : ['', Validators.compose([ Validators.required, Validators.minLength(6)])]
    })
  }

  ngOnInit() {
    this.loadingService.setLoader(false, "");
    this.titleService.setTitle("Admin Log In");
  }

  onSubmit()  {
    this.loadingService.setLoader(true, "Signing in...");

    this.adminService.signin(this.signinForm.value).subscribe(
      data => {
        this.router.navigateByUrl('/admin');
      })
  }

  validEmail(control: FormControl): {[s: string]: boolean} {
      if (!control.value.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
          return {invalidEmail: true};
      }
  }

  routeToForgetPw() {
    this.router.navigateByUrl('/forgot-password');
    this.loadingService.setLoader(true, "");
  }

}
