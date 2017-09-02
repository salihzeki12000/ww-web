import { Component, OnInit }                          from '@angular/core';

import { FlashMessage }        from './flash-message';
import { FlashMessageService } from './flash-message.service';

@Component({
  selector: 'ww-flash-message',
  template: `
  <div class="flash-message" *ngIf="display">
    <h5>{{ flashMessage }}</h5>
  </div>
  `,
  styleUrls: ['./flash-message.component.scss'],
})
export class FlashMessageComponent implements OnInit {
  flashMessage: FlashMessage;
  display = false;

  constructor(private flashMessageService: FlashMessageService) {}

  ngOnInit() {
    this.flashMessageService.flashMessageActivated.subscribe(
      (flashMessage: FlashMessage) => {

        this.flashMessage = flashMessage;
        this.display = true;

        setTimeout(()  =>  {
          this.display = false;
        }, 4000);
    }
    );
  }
}
