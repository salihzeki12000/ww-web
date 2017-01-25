import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';

import { ItineraryEvent } from '../../itinerary-event';
import { ItineraryEventService } from '../../itinerary-event.service';
import { FlashMessageService } from '../../../../flash-message';

@Component({
  selector: 'ww-transport',
  templateUrl: './transport.component.html',
  styleUrls: ['./transport.component.scss']
})
export class TransportComponent implements OnInit {
  @Input() event: ItineraryEvent;
  @Input() itinDateRange;
  @Input() currentUser;

  editTransportForm: FormGroup;
  editing = false;

  deleteTransport = false;

  sameUser;

  constructor(
    private itineraryEventService: ItineraryEventService,
    private flashMessageService: FlashMessageService,
    private formBuilder: FormBuilder) {
      this.editTransportForm = this.formBuilder.group({
        'transportType': '',
        'referenceNumber': '',
        'depTerminal': '',
        'arrTerminal': '',
        'depStation': '',
        'arrStation': '',
        'depCity': '',
        'arrCity': '',
        'depDate': '',
        'depTime': '',
        'arrDate': '',
        'arrTime': '',
        'transportCompany': '',
        'contactNumber': '',
        'note': '',
      })
    }

  ngOnInit()  {
    this.checkSameUser();
  }

  checkSameUser() {
    if(this.currentUser['id'] === this.event['user']['_id']) {
      this.sameUser = true;
    }
  }

  editTransport()  {
    this.editing = true;
  }

  cancelEditTransport()  {
    this.editing = false;
  }

  onEditTransport()  {
    let editedTransport = this.editTransportForm.value;
    let originalTransport = this.event;

    for (var value in editedTransport) {
      if(editedTransport[value] === null) {
        editedTransport[value] = '';
      }
      if(editedTransport[value] !== '')  {
        originalTransport[value] = editedTransport[value];
      }
    }

    originalTransport['date'] = originalTransport['depDate'];
    originalTransport['time'] = originalTransport['depTime'];

    this.itineraryEventService.editEvent(originalTransport)
        .subscribe(
          result => {
            this.flashMessageService.handleFlashMessage(result.message);
          })

    this.editing = false;

    this.editTransportForm.reset({
      'transportType': '',
      'referenceNumber': '',
      'depTerminal': '',
      'arrTerminal': '',
      'depStation': '',
      'arrStation': '',
      'depCity': '',
      'arrCity': '',
      'depDate': '',
      'depTime': '',
      'arrDate': '',
      'arrTime': '',
      'transportCompany': '',
      'contactNumber': '',
      'note': '',
    });

  }

  confirmDeleteTransport() {
    this.deleteTransport = true;
  }

  cancelDeleteTransport()  {
    this.deleteTransport = false;
  }

  onDeleteTransport()  {
    this.itineraryEventService.deleteEvent(this.event)
        .subscribe(
          result => {
            this.flashMessageService.handleFlashMessage(result.message);
          })
    this.deleteTransport = false;
  }
}
