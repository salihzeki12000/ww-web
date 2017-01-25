import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'ww-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {
  @Input() notification;

  constructor() { }

  ngOnInit() {
  }

}
