import { Component, OnInit } from '@angular/core';

import { ErrorMessage }        from './error-message';
import { ErrorMessageService } from './error-message.service';
import { LoadingService }      from '../loading';

@Component({
  selector: 'ww-error-message',
  templateUrl: './error-message.component.html',
  styleUrls: ['./error-message.component.scss']
})
export class ErrorMessageComponent implements OnInit {
  errorMessage: ErrorMessage;
  error = false;

  constructor(
    private errorMessageService: ErrorMessageService,
    private loadingService: LoadingService) { }

  ngOnInit() {
    this.errorMessageService.errorMessageActivated.subscribe(
      (errorMessage: ErrorMessage) => {

        this.errorMessage = errorMessage;
        console.log(this.errorMessage);
        if(this.errorMessage['error'] === undefined)  {
          this.errorMessage['title'] = "An error has occurred"
          this.errorMessage['error'] = {
            message: "An error has occurred. Please refresh your browser."
          }
        }

        this.error = true;
      }
    );
  }

  exitError() {
    this.error = false;
    this.loadingService.setLoader(false, "");
  }

}
