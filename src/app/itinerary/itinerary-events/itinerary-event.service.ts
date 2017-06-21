import { Injectable } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Http, Headers, Response, RequestOptions, Jsonp } from '@angular/http';
import 'rxjs/Rx';
import { Observable, ReplaySubject } from 'rxjs';

import { ItineraryEvent }      from './itinerary-event';
import { NotificationService } from '../../notifications';
import { ErrorMessageService } from '../../error-message';

@Injectable()
export class ItineraryEventService  {
  private events: ItineraryEvent[] = [];

  updateEvent = new ReplaySubject();

  private url = 'https://vast-island-87972.herokuapp.com';

  private flightStatsUrl = "https://api.flightstats.com/flex/schedules/rest/v1/jsonp/"
  // flight/SQ/346/departing/2017/2/12?appId=8d4596b2&appKey=ab8b1a3b2f1f66e0db7be662f41425cc

  constructor(
    private http: Http,
    private jsonp: Jsonp,
    private route: ActivatedRoute,
    private notificationService: NotificationService,
    private errorMessageService: ErrorMessageService )  {}

  getFlightDetails(criteria)  {
    const id = '?appId=8d4596b2&appKey=ab8b1a3b2f1f66e0db7be662f41425cc&callback=JSONP_CALLBACK';

    return this.jsonp.get(this.flightStatsUrl + criteria + id)
                     .map((response: Response) => {
                       return response['_body'];
                     })
  }

  getEvents(itineraryId) {
    const itinId = '?itinId=' + itineraryId;
    return this.http.get( this.url + "/event" + itinId)
                    .map((response: Response) => {
                      this.events = response.json().events;
                      this.timeAgo(this.events);
                      return this.events;
                    })
                    .catch((error: Response) => {
                      this.errorMessageService.handleErrorMessage(error.json());
                      return Observable.throw(error.json())
                    });
  }

  addEvent(event: ItineraryEvent, itinerary) {
    const body = JSON.stringify(event);
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';
    let messageBody;

    if(event['type'] === 'activity') {
      messageBody = 'activity - ' + event['name'];
    } else if (event['type'] === 'accommodation')  {
      messageBody = 'accommodation - ' + event['name'];
    } else if (event['type'] === 'transport')  {
      messageBody = 'transport - ' + event['transportType'] + ' from ' + event['depCity'] + ' to ' + event['arrCity'];
    }

    return this.http.post( this.url + "/event/new/" + itinerary['_id'] + token, body, { headers: headers })
                    .map((response: Response) => {
                      let newEvent = response.json().eventItem;
                      newEvent.user = {
                        _id: event['user']._Id,
                        username: event['user'].username
                      }
                      newEvent.sameUser = true;
                      this.events.push(newEvent);
                      this.sortEventByDate(this.events);

                      for (let i = 0; i < itinerary['members'].length; i++) {
                        if(itinerary['members'][i]['_id'] !== event['user']._Id)  {
                          this.notificationService.newNotification({
                            recipient: itinerary['members'][i]['_id'],
                            originator: event['user']._Id,
                            message: " has added a new " + messageBody + ' to the itinerary ' + itinerary['name'],
                            link: "/me/itinerary/" + itinerary['_id'] + "/" + event['type'],
                            read: false
                          }).subscribe(date => {});
                        }
                      }

                      return response.json();
                    })
                    .catch((error: Response) => {
                      this.errorMessageService.handleErrorMessage(error.json());
                      return Observable.throw(error.json())
                    });
  }

  copyEvent(event: ItineraryEvent, itinerary) {
    const body = JSON.stringify(event);
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';

    return this.http.post( this.url + "/event/new/" + itinerary['_id'] + token, body, { headers: headers })
                    .map((response: Response) => response.json())
                    .catch((error: Response) => {
                      this.errorMessageService.handleErrorMessage(error.json());
                      return Observable.throw(error.json())
                    });
  }

  editEvent(event: ItineraryEvent)  {
    const body = JSON.stringify(event);
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';

    return this.http.patch( this.url + "/event/" + event['_id']+ token, body, { headers: headers })
                    .map((response: Response) => {
                      let index = this.events.indexOf(event);
                      this.events[index] = event;
                      this.sortEventByDate(this.events);

                      return response.json()
                    })
                    .catch((error: Response) => {
                      this.errorMessageService.handleErrorMessage(error.json());
                      return Observable.throw(error.json())
                    });
  }

  deleteEvent(event: ItineraryEvent)  {
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';

    return this.http.delete( this.url + "/event/" + event['_id'] + token)
                    .map((response: Response) => {
                      this.events.splice(this.events.indexOf(event), 1);
                      this.updateEvent.next(this.events);

                      return response.json()
                    })
                    .catch((error: Response) => {
                      this.errorMessageService.handleErrorMessage(error.json());
                      return Observable.throw(error.json())
                    });
  }

  sortEventByDate(events) {
    let flex = [];
    let dated = [];

    for (let i = 0; i < events.length; i++) {
      if(events[i]['date'] === 'any day') {
        flex.push(events[i]);
      } else  {
        dated.push(events[i])
      }
    }

    flex = this.sort(flex);
    dated = this.sort(dated);

    events = dated.concat(flex);

    this.events = events;
    this.timeAgo(events);
  }

  sort(events)  {
    events.sort((a,b) =>  {
      let dateA = new Date(a['date']).getTime();
      let dateB = new Date(b['date']).getTime();

      let timeA = parseInt((a['time'].replace(a['time'].substring(2,3), "")));
      let timeB = parseInt((b['time'].replace(b['time'].substring(2,3), "")));

      if (dateA < dateB) return -1;
      if (dateA > dateB) return 1;
      if (timeA < timeB) return -1;
      if (timeA > timeB) return 1;

      return 0;
    })

    return events;
  }

  timeAgo(events) {
    for (let i = 0; i < events.length; i++) {
      let timePosted = new Date(events[i]['created_at']).getTime();
      let timeDiff = (Date.now() - timePosted) / 1000;

      let units = [
        { name: "minute", in_seconds: 60, limit: 3600 },
        { name: "hour", in_seconds: 3600, limit: 86400 },
        { name: "day", in_seconds: 86400, limit: 604800 }
      ];

      if(timeDiff < 60) {
        events[i]['time_ago'] = "Less than a minute ago"
      } else if(timeDiff > 604800) {
        events[i]['time_ago'] = '';
      } else {
        for (let j = 0; j < units.length; j++) {
          if(timeDiff < units[j]['limit'])  {
            let timeAgo =  Math.floor(timeDiff / units[j].in_seconds);
            events[i]['time_ago'] = timeAgo + " " + units[j].name + (timeAgo > 1 ? "s" : "") + " ago";
            j = units.length;
          };
        }
      }
    }
    this.updateEvent.next(events);
  }
}

// getFlightDetails(criteria)  {
//   const id = '?appId=8d4596b2&appKey=ab8b1a3b2f1f66e0db7be662f41425cc';
//   let opt: RequestOptions;
//   let myHeaders: Headers = new Headers
//   myHeaders.append('Accept', 'application/json')
//   myHeaders.append('Access-Control-Allow-Origin', '*')
//   myHeaders.append('Access-Control-Allow-Headers', 'Origin, Content-Type, X-Auth-Token')
//   myHeaders.append('Access-Control-Allow-Methods', 'GET')
//
//   opt = new RequestOptions({
//     headers: myHeaders,
//   })
//
//   return this.http.get(this.flightStatsUrl + criteria + id, opt)
//                   .map((response: Response) => response.json())
//                   // .catch((error: Response) => console.log(error));
// }
