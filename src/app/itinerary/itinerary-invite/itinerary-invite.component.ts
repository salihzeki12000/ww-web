import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Title }        from '@angular/platform-browser';
import { Subscription } from 'rxjs/Rx';

import { Itinerary }        from '../itinerary';
import { ItineraryService } from '../itinerary.service';
import { LoadingService }   from '../../loading';
import { AuthService }      from '../../auth';
import { UserService }      from '../../user';

@Component({
  selector: 'ww-itinerary-invite',
  templateUrl: './itinerary-invite.component.html',
  styleUrls: ['./itinerary-invite.component.scss']
})
export class ItineraryInviteComponent implements OnInit {
  itinerary;
  reroute;
  currentUserSubscription: Subscription;
  user;
  members = [];
  member = false;

  passwordValid = false;

  signin = false;
  signup = false;

  constructor(
    private titleService: Title,
    private authService: AuthService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private itineraryService: ItineraryService,
    private loadingService: LoadingService) {}

  ngOnInit() {
    this.loadingService.setLoader(true, "Retrieving your invitation");

    this.route.params.forEach((params: Params) => {
      let id = params['id'];
      this.reroute = '/me/itinerary/' + id;

      this.itineraryService.getItin(id).subscribe(
        result => {
          this.itinerary = result.itinerary;
          let title = this.itinerary['name'] + " | Invite"
          this.titleService.setTitle(title);

          this.getMembers();
          if(this.itinerary['invite_password'] === '')  this.passwordValid = true;
        }
      )
    })

    let isLoggedIn = this.authService.isLoggedIn();

    if(isLoggedIn)  {
      this.userService.getCurrentUser().subscribe(
        data => {
          this.user = data;
      });
    }

    this.loadingService.setLoader(false, "");
  }

  getMembers()  {
    for (let i = 0; i < this.itinerary['members'].length; i++) {
      this.members.push(this.itinerary['members'][i]['_id']);
    }
  }

  enterPassword(password) {
    if(password === this.itinerary['invite_password']) this.passwordValid = true;
  }

  join()  {
    let index = this.members.indexOf(this.user['_id']);

    if(index < 0)  {
      this.itinerary['members'].push(this.user);

      this.itineraryService.editItin(this.itinerary, 'edit').subscribe(
        result => {
          this.loadingService.setLoader(true, "Redirecting to itinerary...")

          this.router.navigateByUrl('/me/itinerary/' + this.itinerary['_id'])
        }
      )
    } else  {
      this.member = true;

      setTimeout(() =>  {
        this.router.navigateByUrl('/me/itinerary/' + this.itinerary['_id'])
      }, 3000)
    }
  }




  hideSignin(e)  {
    this.signin = false;
  }

  hideSignup(e) {
    this.signup = false;
  }

}
