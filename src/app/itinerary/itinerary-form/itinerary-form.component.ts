import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Rx';

import { User, UserService } from '../../user';
import { ItineraryService } from '../itinerary.service';

@Component({
  selector: 'ww-itinerary-form',
  templateUrl: './itinerary-form.component.html',
  styleUrls: ['./itinerary-form.component.scss']
})
export class ItineraryFormComponent implements OnInit {
  currentUser: User;
  currentUserSubscription: Subscription;

  itineraryForm: FormGroup;
  @Output() hideItineraryForm = new EventEmitter();

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private itineraryService: ItineraryService
  ) {
      this.itineraryForm = this.formBuilder.group({
        'name': ['', Validators.required],
        'date_from': ['', Validators.required],
        'date_to': ['', Validators.required]
      });
    }

  ngOnInit() {
    this.currentUserSubscription = this.userService.updateCurrentUser
                                       .subscribe(
                                         result => {
                                           this.currentUser = result;
                                         }
                                       )
  }


  onSubmit()  {
    let itinerary = this.itineraryForm.value;

    itinerary.members = [this.currentUser['id']];

    this.itineraryService.addItin(itinerary)
        .subscribe(
          data => {
            this.router.navigate(['/me/itinerary', data.itinerary._id]);
          });

    this.hideItineraryForm.emit(false);
  }

  cancelItineraryForm() {
    this.hideItineraryForm.emit(false);
  }

}
