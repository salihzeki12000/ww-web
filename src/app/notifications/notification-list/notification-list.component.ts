import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs/Rx';
import { Title }        from '@angular/platform-browser';

import { NotificationService } from '../notification.service';
import { UserService }         from '../../user/user.service';
import { LoadingService }      from '../../loading';

@Component({
  selector: 'ww-notification-list',
  template: `
    <ww-notification *ngFor="let notification of filteredNotifications" [notification]="notification"></ww-notification>
  `,
  styleUrls: ['./notification-list.component.scss']
})
export class NotificationListComponent implements OnInit, OnDestroy {
  @Input() notificationsLimit;

  currentUserSubscription: Subscription;
  currentUser;

  notifications = [];
  notificationSubscription: Subscription;
  filteredNotifications = [];

  constructor(
    private notificationService: NotificationService,
    private userService: UserService,
    private loadingService: LoadingService) { }

  ngOnInit() {
    this.currentUserSubscription = this.userService.updateCurrentUser.subscribe(
       result =>  { this.getNotifications(result['_id']) })

    this.notificationSubscription = this.notificationService.updateNotifications.subscribe(
      result => {
        this.notifications = Object.keys(result).map(key => result[key]);

        if(this.notificationsLimit)  {
          this.filteredNotifications = this.notifications.slice(0,19);
        } else  {
          this.filteredNotifications = this.notifications;
        }

        this.loadingService.setLoader(false, "");
      })

  }

  ngOnDestroy() {
    if(this.currentUserSubscription) this.currentUserSubscription.unsubscribe();
    if(this.notificationSubscription) this.notificationSubscription.unsubscribe();

    this.loadingService.setLoader(true, "");
  }

  getNotifications(id)  {
    this.notificationService.getNotifications(id).subscribe(
      result =>  {})
  }

}
