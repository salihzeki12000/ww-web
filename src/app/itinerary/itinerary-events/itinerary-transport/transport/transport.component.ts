import { Component, OnInit, Input, Renderer } from '@angular/core';
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
  showMenu = false;
  sameUser = true;

  constructor(
    private renderer: Renderer,
    private itineraryEventService: ItineraryEventService,
    private flashMessageService: FlashMessageService,
    private formBuilder: FormBuilder) {
      this.editTransportForm = this.formBuilder.group({
        'transport_type': '',
        'reference_number': '',
        'dep_terminal': '',
        'arr_terminal': '',
        'dep_station': '',
        'arr_station': '',
        'dep_city': '',
        'arr_city': '',
        'dep_date': '',
        'dep_time': '',
        'arr_date': '',
        'arr_time': '',
        'transport_company': '',
        'contact_number': '',
        'note': '',
      })
    }

  ngOnInit()  {
    this.checkSameUser();
  }

  checkSameUser() {
    // if(this.currentUser['id'] === this.event['user']['_id']) {
    //   this.sameUser = true;
    // }
  }

  editTransport()  {
    this.editing = true;
    this.renderer.setElementClass(document.body, 'prevent-scroll', true);
  }

  cancelEditTransport()  {
    this.editing = false;
    this.renderer.setElementClass(document.body, 'prevent-scroll', false);
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

    originalTransport['date'] = originalTransport['dep_date'];
    originalTransport['time'] = originalTransport['dep_time'];

    this.itineraryEventService.editEvent(originalTransport)
        .subscribe(
          result => {
            this.flashMessageService.handleFlashMessage(result.message);
          })

    this.editing = false;
    this.renderer.setElementClass(document.body, 'prevent-scroll', false);

    this.editTransportForm.reset({
      'transport_type': '',
      'reference_number': '',
      'dep_terminal': '',
      'arr_terminal': '',
      'dep_station': '',
      'arr_station': '',
      'dep_city': '',
      'arr_city': '',
      'dep_date': '',
      'dep_time': '',
      'arr_date': '',
      'arr_time': '',
      'transport_company': '',
      'contact_number': '',
      'note': '',
    });

  }

  confirmDeleteTransport() {
    this.deleteTransport = true;
    this.renderer.setElementClass(document.body, 'prevent-scroll', true);
  }

  cancelDeleteTransport()  {
    this.deleteTransport = false;
    this.renderer.setElementClass(document.body, 'prevent-scroll', false);
  }

  onDeleteTransport()  {
    this.itineraryEventService.deleteEvent(this.event)
        .subscribe(
          result => {
            this.flashMessageService.handleFlashMessage(result.message);
          })
    this.deleteTransport = false;
    this.renderer.setElementClass(document.body, 'prevent-scroll', false);
  }

  showMenuOptions() {
    this.showMenu = true;
  }
}
