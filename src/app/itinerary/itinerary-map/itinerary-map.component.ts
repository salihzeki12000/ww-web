import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Rx';
declare var google:any;

import { ItineraryEvent } from '../itinerary-events/itinerary-event';
import { ItineraryEventService } from '../itinerary-events/itinerary-event.service';

@Component({
  selector: 'ww-itinerary-map',
  template:`
    <div *ngIf="showLegend" [class.hide-legend]="showLegend" (click)="hideLegend()">x</div>
    
    <div #map id="map"></div>

    <div class="map-legend" [class.show-legend]="showLegend">
      <div *ngFor="let event of events; let i = index" class="map-event" (click)="changeCenter(event)">
        <i class="fa fa-map-marker fa-2x" aria-hidden="true"></i>
        <h5 class="marker-index">{{ i+1 }}</h5>
        <h5 class="marker-name">{{ event.name }}</h5>
      </div>
    </div>

    <button type="button" class="reverseButton show-legend-button" (click)="showMapLegend()">Show markers list</button>
  `,
  styleUrls: ['./itinerary-map.component.scss']
})
export class ItineraryMapComponent implements OnInit {
  @ViewChild('map') map: ElementRef;
  itinMap;

  events: ItineraryEvent[] = [];
  eventSubscription: Subscription;
  eventList;

  showLegend = false;

  constructor(
    private itineraryEventService: ItineraryEventService,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.eventSubscription = this.itineraryEventService.updateEvent
                                .subscribe(
                                  result => {
                                    this.filterEvents(result);
                                    this.initMap()
                                  }
                                )
  }

  filterEvents(events)  {
    this.events = [];
    for (let i = 0; i < events.length; i++) {
      if(events[i]['type'] !== 'transport')  {
        this.events.push(events[i])
      }
    }
  }

  initMap() {
    let mapDiv = this.map.nativeElement;
    let center;
    let zoom;

    let centerEvent = this.events.find(this.getCenter)

    if (centerEvent !== undefined) {
      center = {lat: centerEvent['lat'], lng: centerEvent['lng'] },
      zoom = 12
    } else if (centerEvent === undefined) {
      center = {lat: 0, lng: 0},
      zoom = 1
    }

    this.itinMap = new google.maps.Map(mapDiv, {
      center: center,
      zoom: zoom
    });

    this.setMarkers(this.itinMap);
  }

  getCenter(event) {
    return event['type'] !== 'transport';
  }

  setMarkers(map) {
    let eventMarker = [];

    for (let i = 0; i < this.events.length; i++) {
      if(this.events[i]['type'] !== 'transport')  {
        eventMarker.push(
          [this.events[i]['name'], this.events[i]['lat'], this.events[i]['lng']]
        )
      }
    }

    this.eventList = eventMarker;

    for (let i = 0; i < eventMarker.length; i++) {
        let event = eventMarker[i];
        let marker = new google.maps.Marker({
          position: { lat: event[1], lng: event[2] },
          map: map,
          title: event[0],
          label: '' + (i + 1),
          zIndex: i
        })

        let infoWindow = new google.maps.InfoWindow({
          content: '<p>' + event[0] + '</p>'
        })

        marker.addListener('click', ()  =>  {
          infoWindow.open(map, marker)
        })
    }

  }

  changeCenter(event)  {
    let center = new google.maps.LatLng(event['lat'], event['lng']);

    this.itinMap.panTo(center);
  }

  showMapLegend() {
    this.showLegend = !this.showLegend;
  }

  hideLegend()  {
    this.showLegend = false;
  }



}
