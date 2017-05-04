import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'ww-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {
  @Input() notification;

  constructor(private router: Router) { }

  ngOnInit() {
  }

  navigate()  {
    this.notification.read = true;
    if(this.notification.link) {
      this.router.navigateByUrl(this.notification.link);
    }
  }

}
