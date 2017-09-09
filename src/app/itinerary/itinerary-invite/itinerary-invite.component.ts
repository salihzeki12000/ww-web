import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Title }        from '@angular/platform-browser';

import { Itinerary }        from '../itinerary';
import { ItineraryService } from '../itinerary.service';
import { LoadingService }   from '../../loading';

@Component({
  selector: 'ww-itinerary-invite',
  templateUrl: './itinerary-invite.component.html',
  styleUrls: ['./itinerary-invite.component.scss']
})
export class ItineraryInviteComponent implements OnInit {
  itinerary;
  reroute;

  passwordValid = false;

  signin = false;
  signup = false;

  constructor(
    private titleService: Title,
    private route: ActivatedRoute,
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

          if(this.itinerary['invite_password'] === '')  this.passwordValid = true;
        }
      )
    })

    this.loadingService.setLoader(false, "");
  }

  enterPassword(password) {
    if(password === this.itinerary['invite_password']) this.passwordValid = true;
  }

  hideSignin(e)  {
    this.signin = false;
  }

  hideSignup(e) {
    this.signup = false;
  }

}
