import { Component, OnInit, trigger, state, style, transition, animate } from '@angular/core';

import { FlashMessage } from './flash-message';
import { FlashMessageService } from './flash-message.service';

@Component({
  selector: 'ww-flash-message',
  template: `
  <div class="flash-message" [@slideInOut]="messageState">
    <h5>{{ flashMessage }}</h5>
  </div>
  `,
  styleUrls: ['./flash-message.component.scss'],
  animations: [
    trigger('slideInOut', [
      state('in', style({ transform: 'translate3d(0, 0, 0)' })),
      state('out', style({ transform: 'translate3d(0, -100%, 0)' })),
      transition('in => out', animate('800ms ease-in-out')),
      transition('out => in', animate('800ms ease-in-out'))
    ]),
  ]
})
export class FlashMessageComponent implements OnInit {
  flashMessage: FlashMessage;
  display = 'none';
  messageState = 'out'
// [ngStyle]="{'display': display}"
  constructor(private flashMessageService: FlashMessageService) {}

  onErrorHandled() {
      // this.display = 'none';
      this.messageState = 'out';
  }

  ngOnInit() {
      this.flashMessageService.flashMessageActivated
          .subscribe(
              (flashMessage: FlashMessage) => {
                  this.flashMessage = flashMessage;
                  this.messageState = 'in';
                  // this.display = 'block';
                  setTimeout(()  =>  {
                    // this.display = 'none';
                    this.messageState = 'out';
                  }, 5000);
              }
          );
  }
}
