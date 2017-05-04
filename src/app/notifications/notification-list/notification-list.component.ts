import { Component, OnInit, Input } from '@angular/core';
import { Subscription } from 'rxjs/Rx';

import { NotificationService } from '../notification.service';
import { UserService }         from '../../user/user.service';

@Component({
  selector: 'ww-notification-list',
  template: `
    <ww-notification *ngFor="let notification of filteredNotifications" [notification]="notification"></ww-notification>
  `,
  styleUrls: ['./notification-list.component.scss']
})
export class NotificationListComponent implements OnInit {
  @Input() notificationsLimit;
  currentUserSubscription: Subscription;
  currentUser;

  notifications = [];
  notificationSubscription: Subscription;
  filteredNotifications = [];

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
    this.notificationSubscription = this.notificationService.updateNotifications
                                        .subscribe(
                                          result => {
                                            this.notifications = Object.keys(result).map(key => result[key]);

                                            if(this.notificationsLimit)  {
                                              this.filteredNotifications = this.notifications.slice(0,19);
                                            } else  {
                                              this.filteredNotifications = this.notifications;
                                            }

                                          }
                                        )
  }

  getNotifications(id)  {
    this.notificationService.getNotifications(id)
        .subscribe(
          result =>  {}
        )
  }

}
