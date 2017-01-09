import { Component, OnInit } from '@angular/core';

import { FlashMessage } from './flash-message';
import { FlashMessageService } from './flash-message.service';

@Component({
  selector: 'ww-flash-message',
  template: `
  <div class="flash-message" [ngStyle]="{'display': display}">
    <h5>{{ flashMessage }}</h5>
    <span class="x-close" (click)="close()">&times;</span>
  </div>
  `,
  styles: [`
      .flash-message  {
        position: fixed;
        padding: 10px 100px;
        top: 10%;
        left: 35%;
        background-color: #DFF0D8;
        border: 2px solid #D6E9C6;
        border-radius: 5px;
        z-index: 9999;
      }

      .flash-message > h5 {
        color: #3C763D;
        display: inline-block;
      }

      .x-close  {
        top: 25%;
      }
    `]
})
export class FlashMessageComponent implements OnInit {
  flashMessage: FlashMessage;
  display = 'none';

  constructor(private flashMessageService: FlashMessageService) {}

  onErrorHandled() {
      this.display = 'none';
  }

  ngOnInit() {
      this.flashMessageService.flashMessageActivated
          .subscribe(
              (flashMessage: FlashMessage) => {
                  this.flashMessage = flashMessage;
                  this.display = 'block';
                  // setInterval(()  =>  {
                  //   this.display = 'none';
                  // }, 1000);
              }
          );
  }

  close() {
    this.display = 'none';
  }

}
