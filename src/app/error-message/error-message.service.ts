import { EventEmitter } from "@angular/core";

import { ErrorMessage } from "./error-message";

export class ErrorMessageService {
  errorMessageActivated = new EventEmitter<Error>();
  
  handleErrorMessage(message: any) {
    this.errorMessageActivated.emit(message);
  }
}
