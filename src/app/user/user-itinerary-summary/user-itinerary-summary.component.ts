import { Component, OnInit, OnDestroy, Renderer2, ElementRef, HostListener } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs/Rx';

import { ItineraryService, ItineraryEventService, ResourceService }  from '../../itinerary';
import { LoadingService } from '../../loading';
import { User, UserService }    from '../../user';

@Component({
  selector: 'ww-user-itinerary-summary',
  templateUrl: './user-itinerary-summary.component.html',
  styleUrls: ['./user-itinerary-summary.component.scss']
})
export class UserItinerarySummaryComponent implements OnInit, OnDestroy {
  userSubscription: Subscription;
  user;

  eventSubscription: Subscription;
  events = [];
  totalEvents = 1;
  resources = [];

  dateSubscription: Subscription;
  dateRange = [];

  itinerarySubscription: Subscription;
  itinerary;
  dailyNotes = [];

  scroll = false;
  dateBar;
  dateRow;

  left;
  itemPosition = [];
  currentDate = 'any day';
  index = 0;

  oldWidth;
  newWidth;

  copied = false;
  // for copy itinerary
  dateFrom;
  dateTo;
  requestDate = false;
  newDateRange = [];

  currentUserSubscription: Subscription;
  currentUser: User;

  constructor(
    private renderer: Renderer2,
    private element: ElementRef,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private itineraryService: ItineraryService,
    private itineraryEventService: ItineraryEventService,
    private resourceService: ResourceService,
    private loadingService: LoadingService) { }

  ngOnInit() {
    this.route.params.forEach((params: Params) => {
      let id = params['id'];

      this.itineraryService.getItin(id).subscribe(
        result => {
          this.itinerarySubscription = this.itineraryService.currentItinerary.subscribe(
             result => {
               this.itinerary = result;

               if(this.currentUser) this.checkCopy();
               this.formatItinDescription();

               this.sortDailyNotes();
             })
        })

      this.itineraryEventService.getEvents(id).subscribe(
        eventResult => {})

      this.resourceService.getResources(id).subscribe(
        resourceResult => { this.resources = resourceResult })
    })

    this.events = [];

    this.dateSubscription = this.itineraryService.updateDate.subscribe(
      result => {
        this.dateRange = Object.keys(result).map(key => result[key]);
      })

    this.eventSubscription = this.itineraryEventService.updateEvent.subscribe(
      result => {
        this.events = Object.keys(result).map(key => result[key]);
        this.formatDescription();
      })

    this.currentUserSubscription = this.userService.updateCurrentUser.subscribe(
      result => {
        this.currentUser = result;

        if(this.itinerary) this.checkCopy();
      })

    this.userSubscription = this.userService.updateDisplayUser.subscribe(
      result => { this.user = result })
  }

  ngOnDestroy() {
    if(this.dateSubscription) this.dateSubscription.unsubscribe();
    if(this.eventSubscription) this.eventSubscription.unsubscribe();
    if(this.itinerarySubscription) this.itinerarySubscription.unsubscribe();
    if(this.currentUserSubscription) this.currentUserSubscription.unsubscribe();
    if(this.userSubscription) this.userSubscription.unsubscribe();
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

  formatItinDescription() {
    let sections = this.itinerary['description']['sections'];

    for (let i = 0; i < sections.length; i++) {
      let formatted_content = sections[i]['section_content'].replace(/\r?\n/g, '<br/> ');

      sections[i]['formatted_content'] = formatted_content;
    }
  }

  formatDescription() {
    for (let i = 0; i < this.events.length; i++) {
      if(this.events[i]['location'] && this.events[i]['place'])  {

        if(this.events[i]['place']['description']) {
          this.events[i]['formatted_description'] = this.events[i]['place']['description'].replace(/\r?\n/g, '<br/> ');
        }

        if(this.events[i]['place']['sub_description']) {
          this.events[i]['formatted_sub_description'] = this.events[i]['place']['sub_description'].replace(/\r?\n/g, '<br/> ');
        }
      }

      this.events[i]['formatted_note'] = this.events[i]['note'].replace(/\r?\n/g, '<br/> ');
    }

    this.filterEvents();
  }

  filterEvents()  {
    let summaryEvents = [];
    let copyEvents = [];

    for (let i = 0; i < this.events.length; i++) {
      if(this.events[i]['type'] === 'activity')  {
        this.events[i]['summary_date'] = this.events[i]['date'];
        this.events[i]['summary_time'] = this.events[i]['time'];
      }

      if(this.events[i]['type'] === 'accommodation')  {
        let copy = Object.assign({}, this.events[i]);

        this.events[i]['inOut'] = "checkin";
        this.events[i]['summary_date'] = this.events[i]['check_in_date'];
        this.events[i]['summary_time'] = this.events[i]['check_in_time'];

        copy['inOut'] = "checkout";
        copy['summary_date'] = this.events[i]['check_out_date'];
        copy['summary_time'] = this.events[i]['check_out_time'];

        copyEvents.push(copy)
      }


      if(this.events[i]['type'] === 'transport')  {
        let copy = Object.assign({}, this.events[i]);

        this.events[i]['approach'] = 'departure';
        this.events[i]['summary_date'] = this.events[i]['dep_date'];
        this.events[i]['summary_time'] = this.events[i]['dep_time'];

        copy['approach'] = 'arrival';
        copy['summary_date'] = this.events[i]['arr_date'];
        copy['summary_time'] = this.events[i]['arr_time'];

        copyEvents.push(copy);
      }
    }

    summaryEvents = this.events.concat(copyEvents)
    this.sortEvents(summaryEvents);
  }

  sortEvents(events)  {
    let flex = [];
    let dated = [];

    for (let i = 0; i < events.length; i++) {
      if(events[i]['summary_time'] === 'anytime') {
        events[i]['sort_time'] = "25:00"
      } else  {
        events[i]['sort_time'] = events[i]['summary_time']
      }

      if(events[i]['summary_date'] === 'any day') {
        flex.push(events[i]);
      } else  {
        dated.push(events[i])
      }
    }

    flex = this.sort(flex);
    dated = this.sort(dated);

    this.events = dated.concat(flex);

    setTimeout(() =>  {this.loadingService.setLoader(false, "")}, 1000);
  }

  sort(events)  {
    events.sort((a,b) =>  {
      let dateA = new Date(a['summary_date']).getTime();
      let dateB = new Date(b['summary_date']).getTime();

      let timeA = parseInt((a['sort_time'].replace(a['sort_time'].substring(2,3), "")));
      let timeB = parseInt((b['sort_time'].replace(b['sort_time'].substring(2,3), "")));

      if (dateA < dateB) return -1;
      if (dateA > dateB) return 1;
      if (timeA < timeB) return -1;
      if (timeA > timeB) return 1;

      return 0;
    })

    return events;
  }

  checkCopy() {
    for (let i = 0; i < this.itinerary['copied_by'].length; i++) {
      if(this.itinerary['copied_by'][i]['user']['_id'] === this.currentUser['_id'])  {
        this.copied = true;
      }
    }
  }

  // copy a preview itinerary
  copy()  {
    if(this.itinerary['date_from'] !== '' && this.itinerary['date_from'] !== undefined) {
      this.dateFrom = this.itinerary['date_from'];
      this.dateTo = this.itinerary['date_to']
      this.duplicate();
    } else  {
      this.requestDate = true;
    }
  }

  selectedDate(value) {
    let startDate = value.start._d;
    let startDay = startDate.getDate();
    let startMonth = startDate.getMonth() + 1;
    let startYear = startDate.getFullYear();

    if(startDay < 10) startDay = "0" + startDay;
    if(startMonth < 10) startMonth = "0" + startMonth;
    this.dateFrom = startYear + "-" + startMonth + "-" + startDay + "T00:00:00.000Z";

    let endDate = value.end._d;
    let endDay = endDate.getDate();
    let endMonth = endDate.getMonth() + 1;
    let endYear = endDate.getFullYear();

    if(endDay < 10) endDay = "0" + endDay;
    if(endMonth < 10) endMonth = "0" + endMonth;
    this.dateTo = endYear + "-" + endMonth + "-" + endDay + "T00:00:00.000Z";

    this.setDailyNote();
  }

  setDailyNote()  {
    // let startDate = new Date(this.dateFrom);
    // let endDate = new Date(this.dateTo);

    let startArray = this.dateFrom.split(/[- :]/);
    let startDate = new Date(startArray[2], startArray[0] - 1, startArray[1]);

    let endArray = this.dateTo.split(/[- :]/);
    let endDate = new Date(endArray[2], endArray[0] - 1, endArray[1]);

    this.newDateRange = [];
    this.newDateRange.push('any day');
    this.newDateRange.push((new Date(startArray[2], startArray[0] - 1, startArray[1])).toISOString());

    while(startDate < endDate){
      let addDate = startDate.setDate(startDate.getDate() + 1);
      let newDate = new Date(addDate);
      this.newDateRange.push(newDate.toISOString());
    }

    this.dailyNotes = [];
    for (let i = 0; i < this.newDateRange.length; i++) {
      this.dailyNotes.push({
        date: this.newDateRange[i],
        note: "Note for the day (click to edit)\ne.g. Day trip to the outskirts"
      })
    }
  }

  dateSelected()  {
    this.requestDate = false;
    this.duplicate();
  }

  cancelDate()  {
    this.requestDate = false;
  }

  duplicate() {
    this.loadingService.setLoader(true, "Saving to your list of itineraries");

    let currentNote = this.itinerary['daily_note'].length;
    let newNote = this.newDateRange.length;

    if(currentNote === newNote) {
      this.dailyNotes = this.itinerary['daily_note'];
    } else if(currentNote < newNote)  {
      for (let i = 0; i < currentNote; i++) {
        this.dailyNotes[i] = this.itinerary['daily_note'][i];
      }
    } else if(currentNote > newNote)  {
      for (let i = 0; i < newNote; i++) {
        this.dailyNotes[i] = this.itinerary['daily_note'][i];
      }
    }

    let newItinerary = {
      name: this.itinerary['name'] + " - copied from " + this.user['username'],
      date_from: this.dateFrom,
      date_to: this.dateTo,
      daily_note: this.dailyNotes,
      description: this.itinerary['description'],
      photo: this.itinerary['photo'],
      private: this.currentUser['settings']['itinerary_privacy'],
      view_only: this.currentUser['settings']['itinerary_viewonly'],
      members: [this.currentUser['_id']],
      admin: [this.currentUser['_id']],
      link: this.itinerary['link'],
      created_by: this.itinerary['created_by'],
      copied_from: this.user['_id'],
      invite_password: Math.random().toString(36).substr(2, 8),
      corporate:  {
        status: false,
        publish: false
      }
    }

    this.itineraryService.addItin(newItinerary).subscribe(
      result => {
        this.shareEvents(result.itinerary);
      })

    let newCopy = {
      user: this.currentUser['_id'],
      copied_on: new Date()
    }

    if(this.itinerary['copied_by'])  {
      this.itinerary['copied_by'].push(newCopy);
    } else  {
      this.itinerary['copied_by'] = [newCopy];
    }

    this.itineraryService.editItin(this.itinerary, '').subscribe(
      result =>{})
  }

  shareEvents(itinerary) {
    for (let i = 0; i < this.events.length; i++) {
      delete this.events[i]['_id'];
      delete this.events[i]['created_at'];
      delete this.events[i]['itinerary'];

      if(this.events[i]['type'] !== 'transport')  {
        if(this.events[i]['place']) {
          this.events[i]['place_id'] = this.events[i]['place']['place_id'];
          this.events[i]['lat'] = this.events[i]['place']['lat'];
          this.events[i]['lng'] = this.events[i]['place']['lng'];
        }
      }

      if(this.itinerary['date_from'] === '' || this.itinerary['date_from'] === undefined) {

        if(this.events[i]['type'] === 'activity') {
          let index = this.dateRange.indexOf(this.events[i]['date']);

          if(index < this.newDateRange.length)  {
            this.events[i]['date'] = this.newDateRange[index];
          } else if(index >= this.newDateRange.length)  {
            this.events[i]['date'] = 'any day';
          }
        }

        if(this.events[i]['type'] === 'accommodation')  {
          let CIIndex = this.dateRange.indexOf(this.events[i]['check_in_date']);
          let COIndex = this.dateRange.indexOf(this.events[i]['check_out_date']);

          if(CIIndex < this.newDateRange.length && COIndex < this.newDateRange.length) {
            this.events[i]['date'] = this.newDateRange[CIIndex];
            this.events[i]['check_in_date'] = this.newDateRange[CIIndex];
            this.events[i]['check_out_date'] = this.newDateRange[COIndex];
          } else  {
            this.events[i]['date'] = this.newDateRange[0];
            this.events[i]['check_in_date'] = this.newDateRange[0];
            this.events[i]['check_out_date'] = this.newDateRange[this.newDateRange.length - 1];
          }
        }

        if(this.events[i]['type'] === 'transport')  {
          let depIndex = this.dateRange.indexOf(this.events[i]['dep_date']);
          let arrIndex = this.dateRange.indexOf(this.events[i]['arr_date']);

          if(depIndex < this.newDateRange.length && arrIndex < this.newDateRange.length) {
            this.events[i]['date'] = this.newDateRange[depIndex];
            this.events[i]['dep_date'] = this.newDateRange[depIndex];
            this.events[i]['arr_date'] = this.newDateRange[arrIndex];
          } else  {
            this.events[i]['date'] = this.newDateRange[0];
            this.events[i]['dep_date'] = this.newDateRange[0];
            this.events[i]['arr_date'] = this.newDateRange[0];
          }
        }

      }

      this.itineraryEventService.copyEvent(this.events[i], itinerary).subscribe(
        result => {})
    }

    for (let i = 0; i < this.resources.length; i++) {
      delete this.resources[i]['_id'];
      delete this.resources[i]['created_at'];
      delete this.resources[i]['itinerary'];

      this.resources[i]['itinerary'] = itinerary;

      this.resourceService.copyResource(this.resources[i]).subscribe(
        result => {})
    }

    this.router.navigateByUrl('/me/itinerary/' + itinerary['_id'])
  }





  preventScroll(value)  {
    if(value) {
      this.renderer.addClass(document.body, 'prevent-scroll');
    } else  {
      this.renderer.removeClass(document.body, 'prevent-scroll');
    }
  }

}
