import { EventEmitter } from "@angular/core";

import { FlashMessage } from "./flash-message";

export class FlashMessageService {
  flashMessageActivated = new EventEmitter<Error>();

  handleFlashMessage(message: any) {
      this.flashMessageActivated.emit(message);
  }
}
