import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

import { NotificationService } from '../notification.service';

@Component({
  selector: 'ww-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {
  @Input() notification;
  unread = false;

  constructor(
    private router: Router,
    private notificationService: NotificationService) { }

  ngOnInit() {
    if(!this.notification.read) {
      this.unread = true;
    }
  }

  navigate()  {
    this.unread = false;
    this.notification.read = true;
    if(this.notification.link) {
      this.router.navigateByUrl(this.notification.link);
    }

    this.notificationService.editNotification(this.notification).subscribe(
      result => {
        console.log(result);
      }
    )
  }

}
