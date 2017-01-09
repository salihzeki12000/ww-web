import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Rx';

import { ItineraryService } from '../../itinerary.service';

@Component({
  selector: 'ww-itinerary-activity',
  templateUrl: './itinerary-activity.component.html',
  styleUrls: ['./itinerary-activity.component.scss']
})
export class ItineraryActivityComponent implements OnInit {
  addActivity = false;
  showCheckin = false;
  itinDateSubscription: Subscription;
  itinDateRange = [];

  constructor( private itineraryService: ItineraryService ) { }

  ngOnInit() {
    this.itinDateSubscription = this.itineraryService.updateDate
                                    .subscribe(
                                      result => {
                                        let updatedItinDate = Object.keys(result).map(key => result[key]);
                                        this.itinDateRange = updatedItinDate;
                                    })
  }

  addCustomActivity() {
    this.addActivity = true;
    this.showCheckin = false;
  }

  customCheckIn() {
    this.showCheckin = true;
    this.addActivity = false;
  }

  hideForm(hide)  {
    this.addActivity = hide;
  }
}



// tried to use nearby places search but response is slow

// @ViewChild('customCheckInSearch') customCheckInSearch: ElementRef;
// nearbyPlaces;
// nearbyPlacesArray = [];
// lat;
// lng;
// service;
// customCheckIn() {
//   this.service.nearbySearch({
//     location: { lat: this.lat, lng: this.lng },
//     keyword: [''],
//     rankBy: google.maps.places.RankBy.DISTANCE
//   }, (results, status)  =>  {
//     if (status === google.maps.places.PlacesServiceStatus.OK) {
//       this.nearbyPlacesArray = results;
//       console.log(this.nearbyPlacesArray);
//     }
//   })
// }
//
// ngAfterViewInit() {
//   if(navigator.geolocation) {
//     navigator.geolocation.getCurrentPosition(
//       (position)  =>  {
//         this.lat = position.coords.latitude;
//         this.lng = position.coords.longitude;
//       }
//     );
//   }
//
//   this.nearbyPlaces = this.customCheckInSearch.nativeElement;
//   this.service = new google.maps.places.PlacesService(this.nearbyPlaces);
// }
