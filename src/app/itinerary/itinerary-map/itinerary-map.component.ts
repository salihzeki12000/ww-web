import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Rx';
declare var google:any;

import { ItineraryEvent } from '../itinerary-events/itinerary-event';
import { ItineraryEventService } from '../itinerary-events/itinerary-event.service';

@Component({
  selector: 'ww-itinerary-map',
  template:`
    <div #map id="map"></div>
  `,
  styleUrls: ['./itinerary-map.component.scss']
})
export class ItineraryMapComponent implements OnInit {
  @ViewChild('map') map: ElementRef;
  events: ItineraryEvent[] = [];
  eventSubscription: Subscription;

  constructor(
    private itineraryEventService: ItineraryEventService,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.eventSubscription = this.itineraryEventService.updateEvent
                                .subscribe(
                                  result => {
                                    this.events = Object.keys(result).map(key => result[key]);
                                    this.initMap()
                                  }
                                )
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

    let map = new google.maps.Map(mapDiv, {
      center: center,
      zoom: zoom
    });

    this.setMarkers(map);
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

}
