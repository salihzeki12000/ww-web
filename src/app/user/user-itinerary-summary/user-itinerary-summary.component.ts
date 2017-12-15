import { Component, OnInit, OnDestroy, Renderer2, ElementRef, HostListener } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs/Rx';

import { ItineraryService }      from '../../itinerary/itinerary.service';
import { ItineraryEventService } from '../../itinerary/itinerary-events/itinerary-event.service';
import { ResourceService }       from '../../itinerary/itinerary-resources/resource.service';
import { LoadingService }        from '../../loading';
import { User }                  from '../../user/user';
import { UserService }           from '../../user/user.service';
import { FlashMessageService }   from '../../flash-message';
import { NotificationService }   from '../../notifications';

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
  like = false;
  save = false;

  currentUserSubscription: Subscription;
  currentUser: User;

  // to copy individual activity
  itineraries;
  copyActivity;
  getItineraries;

  constructor(
    private renderer: Renderer2,
    private element: ElementRef,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private notificationService: NotificationService,
    private flashMessageService: FlashMessageService,
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
        this.itineraries = this.currentUser['itineraries'];

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

        if(this.events[i]['place']['long_description']) {
          this.events[i]['formatted_long_description'] = this.events[i]['place']['long_description'].replace(/\r?\n/g, '<br/> ');
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

    this.checkSave();
    this.checkLike();
  }

  // like and save
  checkLike()  {
    for (let i = 0; i < this.itinerary['likes'].length; i++) {
      if(this.itinerary['likes'][i] === this.currentUser['_id'])  {
        this.like = true;
        break;
      };
    }
  }

  checkSave()  {
    for (let i = 0; i < this.currentUser['saves']['itineraries'].length; i++) {
      if(this.currentUser['saves']['itineraries'][i]['_id'] === this.itinerary['_id'])  {
        this.save = true;
        break;
      };
    }
  }

  toggleLike()  {
    this.like = !this.like;

    if(this.like) {
      this.itinerary['likes'].push(this.currentUser['_id'])
    } else  {
      let index = this.itinerary['likes'].indexOf(this.currentUser['_id']);

      this.itinerary['likes'].splice(index, 1)
    }

    this.itineraryService.updateItinUser(this.itinerary).subscribe(
      result => {})
  }

  toggleSave()  {
    this.save = !this.save;

    if(this.save) {
      this.currentUser['saves']['itineraries'].push(this.itinerary);
    } else  {
      let itineraries = this.currentUser['saves']['itineraries'];

      for (let i = 0; i < itineraries.length; i++) {
        if(itineraries[i]['_id'] === this.itinerary['_id'])  {
          this.currentUser['saves']['itineraries'].splice(i, 1);
          break;
        }
      }
    }

    this.userService.editUser(this.currentUser).subscribe(
      result => {})
  }




  // Copy itinerary
  copy() {
    this.loadingService.setLoader(true, "Saving to your list of itineraries");

    let newItinerary = {
      name: this.itinerary['name'] + " - copied from " + this.user['username'],
      date_from: this.itinerary['date_from'],
      date_to: this.itinerary['date_to'],
      daily_note:  this.itinerary['daily_note'],
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

      if((this.events[i]['type'] === "accommodation" && this.events[i]['inOut'] === "checkout") ||
        (this.events[i]['type'] === "transport" && this.events[i]['approach'] === "arrival")) {
          this.events.splice(i,1);
          i--
        } else  {
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

          this.itineraryEventService.copyEvent(this.events[i], itinerary).subscribe(
            result => {})
        }
    }

    for (let i = 0; i < this.resources.length; i++) {
      delete this.resources[i]['_id'];
      delete this.resources[i]['created_at'];
      delete this.resources[i]['itinerary'];

      this.resources[i]['itinerary'] = itinerary;

      this.resourceService.copyResource(this.resources[i]).subscribe(
        result => {})
    }

    setTimeout(() =>  {
      this.router.navigateByUrl('/me/itinerary/' + itinerary['_id'] + '/summary');
    }, 5000)
  }




  // Copy single event
  copyEvent(event)  {
    this.getItineraries = true;
    this.copyActivity = event;
  }

  cancelCopy()  {
    this.getItineraries = false;
    this.copyActivity = undefined;
  }

  saveActivity(itinerary) {
    this.loadingService.setLoader(true, "Copying activity...")
    delete this.copyActivity['_id'];
    delete this.copyActivity['created_at'];
    delete this.copyActivity['itinerary'];
    delete this.copyActivity['user'];

    this.copyActivity['user'] = this.currentUser;
    this.copyActivity['date'] = 'any day';
    this.copyActivity['time'] = 'anytime';

    if(this.copyActivity['place']) {
      this.copyActivity['place_id'] = this.copyActivity['place']['place_id'];
      this.copyActivity['lat'] = this.copyActivity['place']['lat'];
      this.copyActivity['lng'] = this.copyActivity['place']['lng'];
    }

    this.itineraryEventService.copyEvent(this.copyActivity, itinerary).subscribe(
      result => {

        for (let i = 0; i < itinerary['members'].length; i++) {
          if(itinerary['members'][i]['_id'] !== this.currentUser['_id'])  {

            let messageBody = 'activity - ' + result['eventItem']['name'];

            this.notificationService.newNotification({
              recipient: itinerary['members'][i]['_id'],
              originator: this.currentUser['_id'],
              message: " has added a new " + messageBody + ' to the itinerary ' + itinerary['name'],
              link: "/me/itinerary/" + itinerary['_id'] + "/activity",
              read: false
            }).subscribe(result => {})

          };
        }

        this.cancelCopy();
        this.flashMessageService.handleFlashMessage(result.message)
        this.loadingService.setLoader(false, "")
      })
  }


  preventScroll(value)  {
    if(value) {
      this.renderer.addClass(document.body, 'prevent-scroll');
    } else  {
      this.renderer.removeClass(document.body, 'prevent-scroll');
    }
  }

}
