import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs/Rx';

import { ItineraryService } from '../../../itinerary.service';
import { Itinerary } from '../../../itinerary';
import { UserService } from '../../../../user';
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

  editTransportForm: FormGroup;
  editing = false;

  deleteTransport = false;

  constructor(
    private itineraryService: ItineraryService,
    private itineraryEventService: ItineraryEventService,
    private userService: UserService,
    private flashMessageService: FlashMessageService,
    private route: ActivatedRoute,
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

    this.itineraryEventService.editEvent(originalTransport)
        .subscribe(
          data => {
            this.flashMessageService.handleFlashMessage(data.message);
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
          data => {
            this.flashMessageService.handleFlashMessage(data.message);
          })
    this.deleteTransport = false;
  }
}
