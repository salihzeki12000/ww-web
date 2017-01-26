import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Rx';
declare var google:any;

import { ItineraryEvent } from '../itinerary-events/itinerary-event';
import { ItineraryEventService } from '../itinerary-events/itinerary-event.service';

@Component({
  selector: 'ww-itinerary-map',
  templateUrl:'./itinerary-map.component.html',
  styleUrls: ['./itinerary-map.component.scss']
})
export class ItineraryMapComponent implements OnInit {
  @ViewChild('map') map: ElementRef;
  itinMap;

  events: ItineraryEvent[] = [];
  eventSubscription: Subscription;

  mapMarkers = [];

  month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  dates = [];
  selectedDate;

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
    this.mapMarkers = [];

    for (let i = 0; i < this.events.length; i++) {
      if(this.events[i]['type'] !== 'transport')  {
        let date;
        let eventDate;

        if(this.events[i]['date'] !== 'any day')  {
          date = new Date(this.events[i]['date'])
          eventDate = date.getDate() + " " + this.month[date.getMonth()];
        } else if(this.events[i]['date'] === 'any day') {
          eventDate = 'any day';
        }

        eventMarker.push(
          [this.events[i]['name'], this.events[i]['lat'], this.events[i]['lng'], eventDate, this.events[i]['time']]
        )
      }
    }
    this.setDate(eventMarker);

    for (let i = 0; i < eventMarker.length; i++) {
      let event = eventMarker[i];
      let marker = new google.maps.Marker({
        position: { lat: event[1], lng: event[2] },
        map: map,
        title: event[0],
        label: '' + (i + 1),
        date: event[3],
        zIndex: i
      })

      this.mapMarkers.push(marker);

      let infoWindow = new google.maps.InfoWindow({
        content: '<p>' + event[0] + '</p><br/><p>' + event[3] + " - " + event[4]
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

  setDate(events) {
    this.dates = [];
    for (let i = 0; i < events.length; i++) {
      if(this.dates.indexOf(events[i][3]) < 0) {
        this.dates.push(events[i][3])
      }
    }
    this.dates.unshift("All dates");
    this.selectedDate = this.dates[0];
  }

  filterMarkers(date) {
    for (let i = 0; i < this.mapMarkers.length; i++) {
      if(this.mapMarkers[i]['date'] === date || date === "All dates")  {
        this.mapMarkers[i].setVisible(true);
      } else  {
        this.mapMarkers[i].setVisible(false);
      }
    }
  }

  showMapLegend() {
    this.showLegend = !this.showLegend;
  }

  hideLegend()  {
    this.showLegend = false;
  }
}
