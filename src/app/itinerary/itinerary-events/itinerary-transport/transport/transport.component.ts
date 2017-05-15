import { Component, OnInit, Input, Renderer } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';

import { ItineraryEvent }        from '../../itinerary-event';
import { ItineraryEventService } from '../../itinerary-event.service';
import { FlashMessageService }   from '../../../../flash-message';

@Component({
  selector: 'ww-transport',
  templateUrl: './transport.component.html',
  styleUrls: ['./transport.component.scss']
})
export class TransportComponent implements OnInit {
  @Input() event: ItineraryEvent;
  @Input() itinDateRange;
  @Input() currentItinerary;
  @Input() currentUser;
  sameUser = true;

  showMenu = false;
  editing = false;
  deleteTransport = false;

  editTransportForm: FormGroup;

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
    // this.checkSameUser();
  }

  checkSameUser() {
    if(this.currentUser['id'] === this.event['user']['_id']) {
      this.sameUser = true;
    } else  {
      let admin = this.currentItinerary['admin'];
      for (let i = 0; i < admin.length; i++) {
        if(this.currentUser['id'] === admin[i]) {
          this.sameUser = true;
          i = admin.length;
        }
      }
    }  }

  showMenuOptions() {
    this.showMenu = true;
  }

  // edit section
  edit()  {
    this.editing = true;
    this.renderer.setElementClass(document.body, 'prevent-scroll', true);
  }

  cancelEdit()  {
    this.editing = false;
    this.renderer.setElementClass(document.body, 'prevent-scroll', false);
  }

  saveEdit()  {
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
  }

  // delete section
  delete() {
    this.deleteTransport = true;
    this.renderer.setElementClass(document.body, 'prevent-scroll', true);
  }

  cancelDelete()  {
    this.deleteTransport = false;
    this.renderer.setElementClass(document.body, 'prevent-scroll', false);
  }

  confirmDelete()  {
    this.itineraryEventService.deleteEvent(this.event)
        .subscribe(
          result => {
            this.flashMessageService.handleFlashMessage(result.message);
          })
    this.deleteTransport = false;
    this.renderer.setElementClass(document.body, 'prevent-scroll', false);
  }

}
