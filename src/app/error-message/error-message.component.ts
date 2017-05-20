import { Component, OnInit } from '@angular/core';

import { ErrorMessage } from './error-message';
import { ErrorMessageService } from './error-message.service';

@Component({
  selector: 'ww-error-message',
  templateUrl: './error-message.component.html',
  styleUrls: ['./error-message.component.scss']
})
export class ErrorMessageComponent implements OnInit {
  errorMessage: ErrorMessage;
  error = false;

  constructor(private errorMessageService: ErrorMessageService) { }

  ngOnInit() {
    this.errorMessageService.errorMessageActivated
        .subscribe(
            (errorMessage: ErrorMessage) => {
              this.errorMessage = errorMessage;
              this.error = true;
            }
        );
  }

  exitError() {
    this.error = false;
  }

}
