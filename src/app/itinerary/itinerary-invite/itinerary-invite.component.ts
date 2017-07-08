import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { Itinerary }        from '../itinerary';
import { ItineraryService } from '../itinerary.service';
import { LoadingService }   from '../../loading';

@Component({
  selector: 'ww-itinerary-invite',
  templateUrl: './itinerary-invite.component.html',
  styleUrls: ['./itinerary-invite.component.scss']
})
export class ItineraryInviteComponent implements OnInit {
  itinerary: Itinerary;
  reroute;

  passwordForm: FormGroup;

  signin = false;
  signup = false;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private itineraryService: ItineraryService,
    private loadingService: LoadingService) {
      this.passwordForm = this.formBuilder.group({
        'password': '',
      })
    }

  ngOnInit() {
    this.route.params.forEach((params: Params) => {
      let id = params['id'];
      this.reroute = '/me/itinerary/' + id;
      
      this.itineraryService.getItin(id).subscribe(
        result => {
          this.itinerary = result.itinerary;
          console.log(this.itinerary)
        }
      )
    })

    this.loadingService.setLoader(false, "");
  }

  hideSignin(e)  {
    this.signin = false;
  }

  hideSignup(e) {
    this.signup = false;
  }

}
