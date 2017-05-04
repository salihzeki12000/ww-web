import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Rx';

import { ItineraryService } from '../itinerary.service';
import { Itinerary } from '../itinerary';
import { FlashMessageService }   from '../../flash-message';

@Component({
  selector: 'ww-itinerary-settings',
  templateUrl: './itinerary-settings.component.html',
  styleUrls: ['./itinerary-settings.component.scss']
})
export class ItinerarySettingsComponent implements OnInit {
  itinerary: Itinerary;
  itinerarySubscription: Subscription;

  editItineraryForm: FormGroup;

  deleteItinerary = false;
  constructor(
    private formBuilder: FormBuilder,
    private itineraryService: ItineraryService,
    private flashMessageService: FlashMessageService,
    private router: Router) {
      this.editItineraryForm = this.formBuilder.group({
        'name': '',
        'date_from': '',
        'date_to': ''
      })
    }

  ngOnInit() {
    this.itinerarySubscription = this.itineraryService.currentItinerary
                                     .subscribe(
                                       result =>  {
                                         this.itinerary = result;
                                       }
                                     )
  }

  saveDetails() {
    let editedDetails = this.editItineraryForm.value;

    for (let value in editedDetails)  {
      if(editedDetails[value] === null)  {
        editedDetails[value] = '';
      }
      if(editedDetails[value] !== '') {
        this.itinerary[value] = editedDetails[value];
      }
    }

    this.editItineraryForm.reset({
      'name': '',
      'date_from': '',
      'date_to': ''
    })

    this.itineraryService.editItin(this.itinerary)
        .subscribe(
          data => {
            this.flashMessageService.handleFlashMessage(data.message);
          }
        )
  }

  confirmDelete() {
    this.deleteItinerary = true;
  }

  cancelDelete()  {
    this.deleteItinerary = false;
  }

  onDeleteItinerary()  {
    this.itineraryService.deleteItin(this.itinerary)
        .subscribe(
          data => {
            this.router.navigateByUrl('/me');
            this.flashMessageService.handleFlashMessage(data.message);
        })
    this.deleteItinerary = false;
  }


}
