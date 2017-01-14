import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import 'rxjs/Rx';
import { Observable, ReplaySubject } from 'rxjs';

import { Itinerary } from './itinerary';

@Injectable()
export class ItineraryService {
  itinerary: Itinerary;
  itineraryId;
  private itineraries: Itinerary[] = [];

  updateDate = new ReplaySubject();
  updateItineraries = new ReplaySubject();
  currentItinerary = new ReplaySubject();

  private url = 'https://vast-island-87972.herokuapp.com';

  constructor( private http: Http)  {}

  getItin(itineraryId) {
    return this.http.get( this.url + "/itinerary/" + itineraryId)
                    .map((response: Response) => {
                      this.itinerary = response.json().itinerary;
                      this.itineraryId = this.itinerary['_id'];
                      this.updateDate.next(this.setDateRange(this.itinerary));
                      this.currentItinerary.next(this.itinerary);
                      return response.json();
                    })
                    .catch((error: Response) => Observable.throw(error.json()));
  }

  setDateRange(itinerary)  {
    let startDate = new Date(itinerary['dateFrom']);
    let endDate = new Date(itinerary['dateTo']);
    let dateRange = [];

    dateRange.push('any day');
    dateRange.push((new Date(itinerary['dateFrom'])).toISOString());

    while(startDate < endDate){
      let addDate = startDate.setDate(startDate.getDate() + 1);
      let newDate = new Date(addDate);
      dateRange.push(newDate.toISOString());
   }

   return dateRange;
  }

  itin()  {
    return this.itinerary;
  }

  addItin(itinerary: Itinerary) {
    const body = JSON.stringify(itinerary);
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';

    return this.http.post(this.url + '/itinerary/new' + token, body, { headers: headers })
                    .map((response: Response) => {
                      let newItinerary = response.json().itinerary;
                      newItinerary['method'] = 'add';
                      this.updateItineraries.next(newItinerary);
                      return response.json();
                    })
                    .catch((error: Response) => Observable.throw(error.json()));
  }

  editItin(itinerary: Itinerary)  {
    const body = JSON.stringify(itinerary);
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';

    return this.http.patch( this.url + "/itinerary/" + itinerary['_id']+ token, body, { headers: headers })
                    .map((response: Response) => {
                      this.itinerary = response.json().itinerary;
                      this.updateDate.next(this.setDateRange(this.itinerary));
                      this.itinerary['method'] = 'edit';
                      this.updateItineraries.next(this.itinerary);
                      return response.json();
                    })
                    .catch((error: Response) => Observable.throw(error.json()));
  }

  deleteItin(itinerary: Itinerary)  {
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';

    return this.http.delete( this.url + "/itinerary/" + itinerary['_id'] + token)
                    .map((response: Response) => {
                      itinerary['method'] = 'delete';
                      this.updateItineraries.next(itinerary);
                      return response.json()
                    })
                    .catch((error: Response) => Observable.throw(error.json()));
  }
}
