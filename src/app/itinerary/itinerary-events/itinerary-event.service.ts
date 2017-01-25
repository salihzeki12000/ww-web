import { Injectable } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Http, Headers, Response } from '@angular/http';
import 'rxjs/Rx';
import { Observable, ReplaySubject } from 'rxjs';

import { ItineraryEvent }      from './itinerary-event';
import { NotificationService } from '../../notifications';

@Injectable()
export class ItineraryEventService  {
  private events: ItineraryEvent[] = [];

  updateEvent = new ReplaySubject();

  // private url = 'http://localhost:9000';
  private url = 'https://vast-island-87972.herokuapp.com';

  private flightStatsUrl = "https://api.flightstats.com/flex/schedules/rest/v1/json/"
  // flight/SQ/346/departing/2017/2/12?appId=8d4596b2&appKey=ab8b1a3b2f1f66e0db7be662f41425cc

  constructor(
    private http: Http,
    private route: ActivatedRoute,
    private notificationService: NotificationService)  {}

  getFlightDetails(criteria)  {
    const id = '?appId=8d4596b2&appKey=ab8b1a3b2f1f66e0db7be662f41425cc';
    let myHeaders: Headers = new Headers
    myHeaders.append('Accept', 'application/json')
    myHeaders.append('Access-Control-Allow-Origin', '*')
    myHeaders.append('Access-Control-Allow-Headers', 'Origin, Content-Type, X-Auth-Token')
    myHeaders.append('Access-Control-Allow-Methods', 'GET')

    return this.http.get(this.flightStatsUrl + criteria + id, { headers: myHeaders })
                    .map((response: Response) => response.json())
                    .catch((error: Response) => Observable.throw(error.json()));
  }

  getEvents(itineraryId) {
    const itinId = '?itinId=' + itineraryId;
    return this.http.get( this.url + "/event" + itinId)
                    .map((response: Response) => {
                      this.events = response.json().events;
                      this.updateEvent.next(this.events);
                      return this.events;
                    })
                    .catch((error: Response) => Observable.throw(error.json()));
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
                        _Id: event['user']._Id,
                        username: event['user'].username
                      }
                      this.events.push(newEvent);
                      this.sortEventByDate(this.events);

                      for (let i = 0; i < itinerary['members'].length; i++) {
                        this.notificationService.newNotification({
                          recipient: itinerary['members'][i]['_id'],
                          originator: event['user']._Id,
                          message: event['user'].username + " has added a new " + messageBody + ' to the itinerary ' + itinerary['name'],
                          read: false
                        }).subscribe(date => {});
                      }

                      return response.json();
                    })
                    .catch((error: Response) => Observable.throw(error.json()));
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
                    .catch((error: Response) => Observable.throw(error.json()));
  }

  deleteEvent(event: ItineraryEvent)  {
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';

    return this.http.delete( this.url + "/event/" + event['_id'] + token)
                    .map((response: Response) => {
                      this.events.splice(this.events.indexOf(event), 1);
                      this.updateEvent.next(this.events);

                      return response.json()
                    })
                    .catch((error: Response) => Observable.throw(error.json()));
  }

  sortEventByDate(events) {
    events.sort((a,b) =>  {
      return new Date(a['date']).getTime() - new Date(b['date']).getTime()
    })
    this.updateEvent.next(events);
  }

}
