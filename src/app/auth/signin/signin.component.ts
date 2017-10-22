import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';

import { User, UserService } from '../../user';
import { AuthService }       from '../auth.service';
import { LoadingService }    from '../../loading';
import { ItineraryService }  from '../../itinerary';

@Component({
  selector: 'ww-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit {
  // reroute to itinerary from invite & to home from landing page
  @Input() reroute;
  @Input() reload;
  @Input() itinerary;
  @Output() hideSignin = new EventEmitter();

  signinForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private itineraryService: ItineraryService,
    private loadingService: LoadingService,
    private router: Router) {
    this.signinForm = formBuilder.group({
      'email' : ['', Validators.compose([ Validators.required, this.validEmail ])],
      'password' : ['', Validators.compose([ Validators.required, Validators.minLength(6)])]
    })
  }

  ngOnInit() {
    this.loadingService.setLoader(false, "");
  }

  onSubmit()  {
    this.loadingService.setLoader(true, "get ready to wonder wander");

    this.authService.signin(this.signinForm.value).subscribe(
      data => {

        // this.userService.getCurrentUser().subscribe(
        //   result => {});

        if(this.itinerary)  {
          let user = { _id: data.userId };
          this.addToItin(user);
        } else if (!data['validated']) {
          this.checkVerification(data);
        } else if(this.reload) {
          window.location.reload();
        } else {
          setTimeout(() =>  {
            this.router.navigateByUrl(this.reroute);
          }, 1000)
        }
      },
      error => console.error(error)
    )
  }

  checkVerification(user) {
    let threeDays = 259200000;
    let today = new Date();
    let join = new Date(user['created_at']).getTime();

    if(today.getTime() >= (join + threeDays) )  {
      this.router.navigateByUrl('/account-not-verified')
    } else  {
      this.router.navigateByUrl('/me');
    }
  }

  addToItin(user) {
    let members = [];

    for (let i = 0; i < this.itinerary['members'].length; i++) {
      members.push(this.itinerary['members'][i]['_id']);
    }

    let index = members.indexOf(user);

    if(index === -1)  {
      this.itinerary['members'].push(user);

      this.itineraryService.updateItinUser(this.itinerary).subscribe(
        data => {
          setTimeout(() =>  {
            this.router.navigateByUrl(this.reroute);
          }, 1000)
        })
    } else  {
      this.router.navigateByUrl(this.reroute);
      window.location.reload();
    }
  }

  validEmail(control: FormControl): {[s: string]: boolean} {
      if (!control.value.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
          return {invalidEmail: true};
      }
  }

  cancelAuth()  {
    this.hideSignin.emit()
  }

  routeToForgetPw() {
    this.router.navigateByUrl('/forgot-password');
    this.loadingService.setLoader(true, "");
  }

}
