import { Component, OnInit } from '@angular/core';
import { Title }             from '@angular/platform-browser';

@Component({
  selector: 'ww-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  notificationsLimit = false;

  showNotification = false;

  constructor(private titleService: Title) { }

  ngOnInit() {
    this.titleService.setTitle("Notifications");
  }
}
