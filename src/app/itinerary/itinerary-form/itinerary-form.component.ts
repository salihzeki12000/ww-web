import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Rx';

import { User, UserService } from '../../user';
import { ItineraryService }  from '../itinerary.service';

@Component({
  selector: 'ww-itinerary-form',
  templateUrl: './itinerary-form.component.html',
  styleUrls: ['./itinerary-form.component.scss']
})
export class ItineraryFormComponent implements OnInit, OnDestroy {
  @Output() hideItineraryForm = new EventEmitter();
  itineraryForm: FormGroup;

  currentUserSubscription: Subscription;
  currentUser: User;


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
    this.currentUserSubscription = this.userService.updateCurrentUser.subscribe(
                                        result => { this.currentUser = result; })
  }

  ngOnDestroy() {
    this.currentUserSubscription.unsubscribe();
  }

  saveNew()  {
    let itinerary = this.itineraryForm.value;
    let oneDay = 24*60*60*1000;

    let startDate = new Date(itinerary['date_from']);
    let endDate = new Date(itinerary['date_to']);
    let numDays = Math.round(Math.abs((startDate.getTime() - endDate.getTime())/(oneDay))) + 2;

    itinerary["daily_note"] = [];
    for (let i = 0; i < numDays; i++) {
      itinerary['daily_note'].push("")
    }

    itinerary.members = [this.currentUser['id']];
    itinerary.admin = [this.currentUser['id']];

    this.itineraryService.addItin(itinerary)
        .subscribe(
          data => {
            this.router.navigate(['/me/itinerary', data.itinerary._id]);
          });

    this.hideItineraryForm.emit(false);
  }

  cancelForm() {
    this.hideItineraryForm.emit(false);
  }

}
