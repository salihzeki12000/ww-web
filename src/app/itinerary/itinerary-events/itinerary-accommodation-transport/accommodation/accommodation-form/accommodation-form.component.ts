import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs/Rx';

import { Itinerary } from '../../../../itinerary';
import { ItineraryService } from '../../../../itinerary.service';
import { ItineraryEvent } from '../../../itinerary-event';
import { ItineraryEventService } from '../../../itinerary-event.service';

import { UserService } from '../../../../../user';
import { FlashMessageService } from '../../../../../flash-message';

@Component({
  selector: 'ww-accommodation-form',
  templateUrl: './accommodation-form.component.html',
  styleUrls: ['./accommodation-form.component.scss']
})
export class AccommodationFormComponent implements OnInit {
  @Input() itinerary: Itinerary;
  @Output() cancelAccommodationForm = new EventEmitter();

  addAccommodationForm: FormGroup;
  googleAccommodationDetail;

  itinDateSubscription: Subscription;
  itinDateRange = [];

  currentUserSubscription: Subscription;
  currentUser;

  constructor(
    private itineraryService: ItineraryService,
    private itineraryEventService: ItineraryEventService,
    private userService: UserService,
    private flashMessageService: FlashMessageService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder) {
      this.addAccommodationForm = this.formBuilder.group({
        'name': '',
        'formatted_address': '',
        'website': '',
        'international_phone_number': '',
        'checkInDate': '',
        'checkOutDate': '',
        'checkInTime': '',
        'checkOutTime': '',
        'note': '',
      })
    }

  ngOnInit() {
    this.currentUserSubscription = this.userService.updateCurrentUser
                                       .subscribe(
                                         result => {
                                           this.currentUser = result;
                                         }
                                       )

    this.itinDateSubscription = this.itineraryService.updateDate
                                    .subscribe(
                                      result => {
                                        this.itinDateRange  = Object.keys(result).map(key => result[key]);
                                    })
  }

  // get place details form Google API
  getAccommodationDetails(value)  {
    this.googleAccommodationDetail = value;
  }

  // to submit new accommodation/transport form
  onSubmitNewAccommodation()  {
    let newAccommodation = this.addAccommodationForm.value;

    if(this.googleAccommodationDetail)  {
      for (var value in newAccommodation)  {
        if (newAccommodation[value] === '' && this.googleAccommodationDetail[value]) {
          newAccommodation[value] = this.googleAccommodationDetail[value];
        }
      }

      newAccommodation['url'] = this.googleAccommodationDetail['url'];
      newAccommodation['place_id'] = this.googleAccommodationDetail['place_id'];

      let lat = this.googleAccommodationDetail['geometry'].location.lat();
      let lng = this.googleAccommodationDetail['geometry'].location.lng();

      newAccommodation['lat'] = lat;
      newAccommodation['lng'] = lng;
    }

    if(newAccommodation['checkInTime'] === '')  {
      newAccommodation['checkInTime'] = 'anytime';
    }

    if(newAccommodation['checkOutTime'] === '')  {
      newAccommodation['checkOutTime'] = 'anytime';
    }

    newAccommodation['date'] = newAccommodation['checkInDate'];
    newAccommodation['time'] = newAccommodation['checkInTime'];
    newAccommodation['type'] = 'accommodation';
    newAccommodation['user'] =  {
      _Id: this.currentUser['id'],
      username: this.currentUser['username'],
    }
    newAccommodation['created_at'] = new Date();

    this.itineraryEventService.addEvent(newAccommodation, this.itinerary)
        .subscribe(
          result => {
            this.flashMessageService.handleFlashMessage(result.message);
          })

    this.cancelAccommodationForm.emit(false)
  }

  cancelForm()  {
    this.cancelAccommodationForm.emit(false)
  }
}
