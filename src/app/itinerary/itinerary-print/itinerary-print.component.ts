import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs/Rx';
import { Title }        from '@angular/platform-browser';

import { Itinerary } from '../itinerary';
import { ItineraryService } from '../itinerary.service';

import { ItineraryEventService } from '../itinerary-events/itinerary-event.service';

import { LoadingService } from '../../loading';

@Component({
  selector: 'ww-itinerary-print',
  templateUrl: './itinerary-print.component.html',
  styleUrls: ['./itinerary-print.component.scss']
})
export class ItineraryPrintComponent implements OnInit {
  itinerary;
  events = [];

  itinDateSubscription: Subscription;
  itinDateRange = [];

  dailyNotes = [];

  pageError = false;

  constructor(
    private titleService: Title,
    private itineraryService: ItineraryService,
    private itineraryEventService: ItineraryEventService,
    private loadingService: LoadingService,
    private route: ActivatedRoute,
    private router: Router) { }

  ngOnInit() {
    this.route.params.forEach((params: Params) => {
      let id = params['id'];

      this.itineraryService.getItin(id).subscribe(
        result => {
          if(!result.itinerary) {
            this.pageError = true;
          }

          this.itinerary = result.itinerary;
          let title = this.itinerary['name'] + " | Save-print"
          this.titleService.setTitle(title);

          this.sortDailyNotes();
        })

      this.itineraryEventService.getEvents(id).subscribe(
        result => { this.filterEvents(result)})
    })

    this.itinDateSubscription = this.itineraryService.updateDate.subscribe(
      result => {
        this.itinDateRange = Object.keys(result).map(key => result[key]);
      })

    this.loadingService.setLoader(false, "");
  }

  ngOnDestroy() {
    if(this.itinDateSubscription) this.itinDateSubscription.unsubscribe();
    this.loadingService.setLoader(true, "");
  }

  sortDailyNotes()  {
    this.dailyNotes = []
    let notes = this.itinerary['daily_note'];

    for (let i = 0; i < notes.length; i++) {
      if(notes[i]['note'] === 'e.g. Day trip to the outskirts') {
        notes[i]['note'] = '';
      }
    }

    this.dailyNotes = notes;
  }

  filterEvents(events)  {
    for (let i = 0; i < events.length; i++) {
      if(events[i]['note']) {
        events[i]['formatted_note'] = events[i]['note'].replace(/\r?\n/g, '<br/> ')
      };

      if(events[i]['location'] && events[i]['place']['opening_hours']){
        events[i]['formatted_hours'] = events[i]['place']['opening_hours'].replace(/\r?\n/g, '<br/> ');
      }
    }

    this.events = events
  }

  download()  {
    window.print();
  }
}
