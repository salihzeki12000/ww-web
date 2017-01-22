import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ww-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  showNotification = false;

  constructor() { }

  ngOnInit() {
  }

  showNotificationsList() {
    this.showNotification = !this.showNotification;
  }
}
