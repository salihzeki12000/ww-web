import { Component, OnInit, OnDestroy, Output, EventEmitter, HostListener, Renderer2, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Rx';
import { DaterangePickerComponent } from 'ng2-daterangepicker';

import { User, UserService } from '../../user';
import { ItineraryService }  from '../itinerary.service';
import { LoadingService }    from '../../loading';

@Component({
  selector: 'ww-itinerary-form',
  templateUrl: './itinerary-form.component.html',
  styleUrls: ['./itinerary-form.component.scss']
})
export class ItineraryFormComponent implements OnInit, OnDestroy {
  @ViewChild(DaterangePickerComponent)
  private picker: DaterangePickerComponent;

  @Output() hideItineraryForm = new EventEmitter();
  itineraryForm: FormGroup;

  currentUserSubscription: Subscription;
  currentUser: User;

  dateFrom;
  dateTo;
  dateType = 'none';
  private = false;
  viewOnly = false;
  corporate = false;

  options: any = {
    locale: { format: 'DD-MMM-YYYY' },
    alwaysShowCalendars: false,
  };

  nameError = false;
  dateError = false;
  numError = false;

  showInfo = false;

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
        'invite_password': '',
      });
    }

  ngOnInit() {
    this.currentUserSubscription = this.userService.updateCurrentUser.subscribe(
      result => {
        this.currentUser = result;
        this.checkStatus();
      })

    let password = Math.random().toString(36).substr(2, 8);
    this.itineraryForm.patchValue({
      invite_password: password
    })
  }

  ngOnDestroy() {
    if(this.currentUserSubscription) this.currentUserSubscription.unsubscribe();
  }

  @HostListener('document:click', ['$event'])
  checkClick(event) {
    if(!event.target.classList.contains("pw-info")) {
      this.showInfo = false;
    }
  }

  checkStatus() {
    if(this.currentUser['corporate']) this.corporate = true;

    this.private = this.currentUser['settings']['itinerary_privacy'];
    this.viewOnly = this.currentUser['settings']['itinerary_viewOnly'];
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
      date_to: this.dateTo,
      num_days: undefined
    })

    this.dateType = "Travel dates"
  }

  logDays(days) {
    if(days > 0)  {
      this.dateType = "Number of days";

      this.dateFrom = undefined;
      this.dateTo = undefined;

      this.picker.datePicker.setStartDate(this.dateFrom);
      this.picker.datePicker.setEndDate(this.dateTo);

      this.itineraryForm.patchValue({
        date_from: this.dateFrom,
        date_to: this.dateTo,
        num_days: days
      })
    }

    if(days === '') {
      this.itineraryForm.patchValue({
        num_days: undefined
      })
    }

  }

  checkSave() {
    let itinerary = this.itineraryForm.value;
    this.nameError = false;
    this.dateError = false;
    this.numError = false;

    if(itinerary['name'] === '') this.nameError = true;

    if(!this.corporate) {
      if(itinerary['date_from'] === '') this.dateError = true;

      if(itinerary['name'] !== '' && itinerary['date_from'] !== '') this.saveNew();
    }

    if(this.corporate)  {
      if((itinerary['date_from'] === '' || itinerary['date_from'] === undefined) &&
         (itinerary['num_days'] === '' || itinerary['num_days'] === undefined)) this.numError = true;

      if(itinerary['name'] !== '' &&
         ((itinerary['date_from'] !== '' && itinerary['date_from'] !== undefined) || (itinerary['num_days'] !== '' && itinerary['num_days'] !== undefined))) {
        this.saveNew();
      }
    }
  }

  saveNew()  {
    this.loadingService.setLoader(true, "Saving new itinerary...");

    let itinerary = this.itineraryForm.value;
    let dateRange = [];
    dateRange.push('any day');

    if(itinerary['date_from'] !== "" && itinerary['date_from'] !== undefined) {
      itinerary['num_days'] = undefined;

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

      itinerary['date_from'] = undefined;
      itinerary['date_to'] = undefined;
    }

    itinerary["daily_note"] = [];
    for (let i = 0; i < dateRange.length; i++) {
      itinerary['daily_note'].push({
        date: dateRange[i],
        note: "Note for the day (click to edit)\ne.g. Day trip to the outskirts"
      })
    }

    itinerary['corporate'] = { status: this.corporate, publish: false };
    itinerary.private = this.private;
    itinerary.view_only = this.viewOnly;
    itinerary.members = [this.currentUser['_id']];
    itinerary.admin = [this.currentUser['_id']];
    itinerary.created_by = this.currentUser['_id'];
    itinerary.description = { content: "", photos: [] };

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
