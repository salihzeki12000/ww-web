import { Injectable }  from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import 'rxjs/Rx';
import { Observable, ReplaySubject } from 'rxjs';

import { Resource }            from './resource';
import { NotificationService } from '../../notifications';

@Injectable()
export class ResourceService  {
  private resources: Resource[] = [];

  updateResources = new ReplaySubject();

  private url = 'https://vast-island-87972.herokuapp.com';

  constructor(
    private http: Http,
    private notificationService: NotificationService)  {}

  getResources(itineraryId)  {
    const itinId = '?itinId=' + itineraryId;
    return this.http.get( this.url + "/resource" + itinId)
                    .map((response: Response) => {
                      this.resources = response.json().resources;
                      this.timeAgo(this.resources);
                      return this.resources;
                    })
                    .catch((error: Response) => Observable.throw(error.json()));
  }

  addResource(resource: Resource) {
    const body = JSON.stringify(resource);
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';

    return this.http.post(this.url + '/resource/new' + token, body, { headers: headers })
                    .map((response: Response) => {
                      let newResource = response.json().resource;
                      newResource.user = {
                        _Id: resource['user']._Id,
                        username: resource['user'].username
                      }

                      this.resources.push(newResource);
                      this.timeAgo(this.resources);

                      let itinerary = resource['itinerary'];

                      for (let i = 0; i < itinerary['members'].length; i++) {
                        if(itinerary['members'][i]['_id'] !== resource['user']._Id)  {
                          this.notificationService.newNotification({
                            recipient: itinerary['members'][i]['_id'],
                            originator: resource['user']._Id,
                            message: " has added a new resource " + resource['title'] + " to the itinerary " + itinerary['name'],
                            link: "/me/itinerary/" + itinerary['_id'] + "/resource",
                            read: false
                          }).subscribe(date => {});
                        }
                      }

                      return response.json();
                    })
                    .catch((error: Response) => Observable.throw(error.json()));
  }

  copyResource(resource: Resource) {
    const body = JSON.stringify(resource);
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';

    return this.http.post(this.url + '/resource/new' + token, body, { headers: headers })
                    .map((response: Response) => response.json())
                    .catch((error: Response) => Observable.throw(error.json()));
  }

  editResource(resource: Resource)  {
    const body = JSON.stringify(resource);
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';

    return this.http.patch( this.url + "/resource/" + resource['_id']+ token, body, { headers: headers })
                    .map((response: Response) => {
                      let index = this.resources.indexOf(resource);
                      this.resources[index] = resource;
                      this.updateResources.next(this.resources);
                      return response.json()
                    })
                    .catch((error: Response) => Observable.throw(error.json()));
  }

  deleteResource(resource: Resource)  {
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';

    return this.http.delete( this.url + "/resource/" + resource['_id'] + token)
                    .map((response: Response) => {
                      this.resources.splice(this.resources.indexOf(resource), 1);
                      this.updateResources.next(this.resources);
                      return response.json()
                    })
                    .catch((error: Response) => Observable.throw(error.json()));
  }

  timeAgo(resources) {
    for (let i = 0; i < resources.length; i++) {
      let timePosted = new Date(resources[i]['created_at']).getTime();
      let timeDiff = (Date.now() - timePosted) / 1000;

      let units = [
        { name: "minute", in_seconds: 60, limit: 3600 },
        { name: "hour", in_seconds: 3600, limit: 86400 },
        { name: "day", in_seconds: 86400, limit: 604800 }
      ];

      if(timeDiff < 60) {
        resources[i]['time_ago'] = "Less than a minute ago"
      } else if(timeDiff > 604800) {
        resources[i]['time_ago'] = '';
      } else {
        for (let j = 0; j < units.length; j++) {
          if(timeDiff < units[j]['limit'])  {
            let timeAgo =  Math.floor(timeDiff / units[j].in_seconds);
            resources[i]['time_ago'] = timeAgo + " " + units[j].name + (timeAgo > 1 ? "s" : "") + " ago";
            j = units.length;
          };
        }
      }
    }
    this.updateResources.next(resources);
  }

}
