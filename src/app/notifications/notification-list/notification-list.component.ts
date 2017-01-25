import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Rx';

import { NotificationService } from '../notification.service';
import { UserService }         from '../../user/user.service';

@Component({
  selector: 'ww-notification-list',
  template: `
    <ww-notification *ngFor="let notification of notifications" [notification]="notification"></ww-notification>
  `,
  styleUrls: ['./notification-list.component.scss']
})
export class NotificationListComponent implements OnInit {
  currentUserSubscription: Subscription;
  currentUser;

  notifications = [];

  constructor(
    private notificationService: NotificationService,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.currentUserSubscription = this.userService.updateCurrentUser
                                       .subscribe(
                                         result =>  {
                                           this.getNotifications(result['id'])
                                         }
                                       )
  }

  getNotifications(id)  {
    this.notificationService.getNotifications(id)
        .subscribe(
          data =>  {
            this.notifications = data.notifications;
          }
        )
  }

}
