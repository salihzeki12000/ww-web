import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs/Rx';
import { Title }        from '@angular/platform-browser';

import { Itinerary } from '../itinerary';
import { ItineraryService } from '../itinerary.service';

import { ItineraryEventService } from '../itinerary-events/itinerary-event.service';

import { LoadingService } from '../../loading';
import { AuthService }    from '../../auth/auth.service';
import { UserService }    from '../../user/user.service';

@Component({
  selector: 'ww-itinerary-print',
  templateUrl: './itinerary-print.component.html',
  styleUrls: ['./itinerary-print.component.scss']
})
export class ItineraryPrintComponent implements OnInit {
  isLoggedIn = false;
  validUser = false;
  invalidMsg = '';

  itinerary;
  events = [];

  currentUserSubscription: Subscription;
  currentUser;

  dateSubscription: Subscription;
  dateRange = [];

  dailyNotes = [];

  pageError = false;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private titleService: Title,
    private itineraryService: ItineraryService,
    private itineraryEventService: ItineraryEventService,
    private loadingService: LoadingService,
    private route: ActivatedRoute,
    private router: Router) { }

  ngOnInit() {
    this.loadingService.setLoader(true, "Getting the preview...");

    this.isLoggedIn = this.authService.isLoggedIn();

    this.userService.getCurrentUser().subscribe(
      result => { this.currentUser = result; });

    this.route.params.forEach((params: Params) => {
      let id = params['id'];

      this.itineraryService.getItin(id).subscribe(
        result => {
          if(!result.itinerary) this.pageError = true;
          this.itinerary = result.itinerary;

          setTimeout(() =>  {
            this.checkAccess();
          }, 1500)

          let title = this.itinerary['name'] + " | Save-print"
          this.titleService.setTitle(title);

          this.sortDailyNotes();

          if(this.itinerary['description']) {
            this.itinerary['formatted_description'] = this.itinerary['description']['content'].replace(/\r?\n/g, '<br/> ');
          }
        })

      this.itineraryEventService.getEvents(id).subscribe(
        result => { this.filterEvents(result)})
    })

    this.dateSubscription = this.itineraryService.updateDate.subscribe(
      result => {
        this.dateRange = Object.keys(result).map(key => result[key]);
      })

  }

  ngOnDestroy() {
    if(this.dateSubscription) this.dateSubscription.unsubscribe();
    if(this.currentUserSubscription) this.currentUserSubscription.unsubscribe();

    this.loadingService.setLoader(true, "");
  }

  checkAccess() {
    if(this.isLoggedIn) {
      for (let i = 0; i < this.itinerary['members'].length; i++) {
        if(this.itinerary['members'][i]['_id'] === this.currentUser['_id']) {
          this.validUser = true;
        }
      }
    }

    this.invalidMsg = 'You are not authorised to access the itinerary. If you are not logged in, please log in and try to access this page via the itinerary.';

    this.loadingService.setLoader(false, "");
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
    this.events = [];
    for (let i = 0; i < events.length; i++) {
      if(events[i]['note'] !== '') {
        events[i]['formatted_note'] = events[i]['note'].replace(/\r?\n/g, '<br/> ');
      }

      if(events[i]['location']){
        if(events[i]['place']['opening_hours'] !== '' && events[i]['place']['opening_hours'] !== undefined) {
          events[i]['formatted_hours'] = events[i]['place']['opening_hours'].replace(/\r?\n/g, '<br/> ');
        }

        if(events[i]['place']['description']) {
          events[i]['formatted_description'] = events[i]['place']['description'].replace(/\r?\n/g, '<br/> ');
        }

        if(events[i]['place']['sub_description']) {
          events[i]['formatted_sub_description'] = events[i]['place']['sub_description'].replace(/\r?\n/g, '<br/> ');
        }

      } else if(events[i]['opening_hours'] !== '' && events[i]['opening_hours'] !== undefined) {
        events[i]['formatted_hours'] = events[i]['opening_hours'].replace(/\r?\n/g, '<br/> ');
      }


    }

    this.events = events;
  }

  download()  {
    window.print();
  }
}
