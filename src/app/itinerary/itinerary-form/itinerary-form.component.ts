import { Component, OnInit, OnDestroy, Output, EventEmitter, Renderer2 } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Rx';

import { User, UserService } from '../../user';
import { ItineraryService }  from '../itinerary.service';
import { LoadingService }    from '../../loading';

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

  dateFrom;
  dateTo;
  private = false;
  corporate = false;

  options: any = {
    locale: { format: 'DD-MMM-YYYY' },
    alwaysShowCalendars: false,
  };

  constructor(
    private router: Router,
    private renderer: Renderer2,
    private loadingService: LoadingService,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private itineraryService: ItineraryService) {
      this.itineraryForm = this.formBuilder.group({
        'name': ['', Validators.required],
        'date_from': '',
        'date_to': '',
        'num_days': '',
      });
    }

  ngOnInit() {
    this.currentUserSubscription = this.userService.updateCurrentUser.subscribe(
      result => {
        this.currentUser = result;
        this.checkStatus();
      })
  }

  ngOnDestroy() {
    if(this.currentUserSubscription) this.currentUserSubscription.unsubscribe();
  }

  checkStatus() {
    if(this.currentUser['corporate']) this.corporate = true;
    this.private = this.currentUser['privacy']['itinerary'];
  }

  selectedDate(value) {
    let startDate = value.start._d;
    let startDay = startDate.getDate();
    let startMonth = startDate.getMonth() + 1;
    let startYear = startDate.getFullYear();
    this.dateFrom = startMonth + "-" + startDay + "-" + startYear;

    let endDate = value.end._d;
    let endDay = endDate.getDate();
    let endMonth = endDate.getMonth() + 1;
    let endYear = endDate.getFullYear();
    this.dateTo = endMonth + "-" + endDay + "-" + endYear;

    this.itineraryForm.patchValue({
      date_from: this.dateFrom,
      date_to: this.dateTo
    })
  }

  saveNew()  {
    this.loadingService.setLoader(true, "Saving new itinerary...");

    let itinerary = this.itineraryForm.value;
    let dateRange = [];
    dateRange.push('any day');

    if(itinerary['date_from'] !== "") {
      let startDate = new Date(itinerary['date_from']);
      let endDate = new Date(itinerary['date_to']);

      dateRange.push((new Date(itinerary['date_from'])).toISOString());

      while(startDate < endDate){
        let addDate = startDate.setDate(startDate.getDate() + 1);
        let newDate = new Date(addDate);
        dateRange.push(newDate.toISOString());
      }
    } else  {
      for (let i = 0; i < itinerary['num_days']; i++) {
        let day = i + 1;
        dateRange.push("Day " + day);
      }
    }

    itinerary["daily_note"] = [];
    for (let i = 0; i < dateRange.length; i++) {
      itinerary['daily_note'].push({
        date: dateRange[i],
        note: "e.g. Day trip to the outskirts"
      })
    }

    itinerary.corporate = this.currentUser['corporate'];
    itinerary.private = this.private;
    itinerary.members = [this.currentUser['_id']];
    itinerary.admin = [this.currentUser['_id']];
    itinerary.created_by = this.currentUser['_id'];
    itinerary.description = { content: "" };

    this.itineraryService.addItin(itinerary).subscribe(
      data => {
        this.loadingService.setLoader(false, "");
        this.router.navigate(['/me/itinerary', data.itinerary._id]);
    });

    this.cancelForm();
  }

  cancelForm() {
    this.hideItineraryForm.emit(false);
    this.preventScroll(false);
  }

  preventScroll(value)  {
    if(value) {
      this.renderer.addClass(document.body, 'prevent-scroll');
    } else  {
      this.renderer.removeClass(document.body, 'prevent-scroll');
    }
  }
}
