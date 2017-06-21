import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'ww-time-picker',
  templateUrl: './time-picker.component.html',
  styleUrls: ['./time-picker.component.scss']
})
export class TimePickerComponent implements OnInit {
  hours = [];
  minutes = [];
  hour = "anytime";
  minute = "00";

  @Input() timePicker;
  @Input() ats; //any time selector
  @Input() initHour;
  @Input() initMinute;
  
  @Output() hourSelected = new EventEmitter();
  @Output() minuteSelected = new EventEmitter();
  @Output() pickerSelected = new EventEmitter();

  constructor() { }

  ngOnInit() {
    this.initHours();
    this.initMinutes();

    if(this.initHour !== undefined) {
      this.hour = this.initHour;

      if(this.initHour !== 'anytime') {
        this.minute = this.initMinute;
      }
    }
  }

  initHours()  {
    this.hours = []
    for (let i = 0; i < 10; i++) {
      let h = "0" + i;
      this.hours.push(h)
    }

    for (let i = 10; i < 24; i++) {
      let h = "" + i;
      this.hours.push(h)
    }
  }

  initMinutes()  {
    this.minutes = []
    for (let i = 0; i < 10; i++) {
      let m = "0" + i;
      this.minutes.push(m)
    }

    for (let i = 10; i < 60; i++) {
      let m = "" + i;
      this.minutes.push(m)
    }
  }

  showPicker()  {
    this.timePicker = true;
    this.pickerSelected.emit(true);
  }

  selectHour(h) {
    this.hour = h;
    this.hourSelected.emit(h);

    if(h === 'anytime') {
      this.minute = "00";
    }
  }

  selectMinute(m) {
    this.minute = m;
    this.minuteSelected.emit(m);

    if(this.hour === 'anytime') {
      this.hour = "00";
      this.hourSelected.emit("00");
    }
  }

}
