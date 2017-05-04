import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ww-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  notificationLimit = false;

  showNotification = false;

  constructor() { }

  ngOnInit() {
  }

  showNotificationsList() {
    this.showNotification = true;
  }

  hideNotificationList()  {
    this.showNotification = false;
  }
}
