import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Rx';
import { Title }        from '@angular/platform-browser';

declare var google:any;
declare var MarkerClusterer:any;

import { ItineraryService }      from '../itinerary.service';
import { ItineraryEvent }        from '../itinerary-events/itinerary-event';
import { ItineraryEventService } from '../itinerary-events/itinerary-event.service';
import { LoadingService }        from '../../loading';

@Component({
  selector: 'ww-itinerary-map',
  templateUrl:'./itinerary-map.component.html',
  styleUrls: ['./itinerary-map.component.scss']
})
export class ItineraryMapComponent implements OnInit, OnDestroy {
  @ViewChild('map') map: ElementRef;
  itinMap;

  preview;
  
  currentItinerarySubscription: Subscription;

  eventSubscription: Subscription;
  events: ItineraryEvent[] = [];
  filteredEvents: ItineraryEvent[] = [];

  markers = [];
  infoWindows = [];
  flightPath;

  month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  dates = [];
  selectedDate;

  showMapLegend = false;

  constructor(
    private titleService: Title,
    private renderer: Renderer2,
    private itineraryService: ItineraryService,
    private itineraryEventService: ItineraryEventService,
    private route: ActivatedRoute,
    private loadingService: LoadingService) { }

  ngOnInit() {
    let segments = this.route.snapshot['_urlSegment'].segments;
    if(segments[0]['path'] === 'preview') this.preview = true;

    this.eventSubscription = this.itineraryEventService.updateEvent.subscribe(
      result => {
        this.filterEvents(result);
        this.initMap();
      })

    this.currentItinerarySubscription = this.itineraryService.currentItinerary.subscribe(
      result => {
        let header = ''
        if(this.preview) header = "Preview : ";

        let title = header + result['name'] + " | Map";
        this.titleService.setTitle(title);
      })
  }

  ngOnDestroy() {
    this.eventSubscription.unsubscribe();
    this.loadingService.setLoader(true, "");
  }

  filterEvents(events)  {
    this.events = [];
    let index = 1;
    for (let i = 0; i < events.length; i++) {
      if(events[i]['type'] !== 'transport' && events[i]['location'])  {
        let date = new Date(events[i]['date'])
        let converted_date = date.getDate() + " " + this.month[date.getMonth()]
        events[i]['converted_date'] = converted_date;
        events[i]['index'] = index;
        index += 1;

        this.events.push(events[i])
      }
    }

    this.filteredEvents = this.events;
  }

  initMap() {
    let mapDiv = this.map.nativeElement;
    let center;
    let zoom;

    let centerEvent = this.events.find(this.getCenter);

    if (centerEvent !== undefined) {
      center = {lat: centerEvent['place']['lat'], lng: centerEvent['place']['lng'] },
      zoom = 13
    } else if (centerEvent === undefined) {
      center = {lat: 0, lng: 0},
      zoom = 2
    }

    this.itinMap = new google.maps.Map(mapDiv, {
      center: center,
      zoom: zoom,
      styles: [{"stylers": [{ "saturation": -20 }]}]
    });

    this.setMarkers(this.itinMap);
    this.getCurrentLocation(this.itinMap);
  }

  getCurrentLocation(map)  {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        let pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        let marker = new google.maps.Marker({
          position: { lat: pos['lat'], lng: pos['lng'] },
          map: map,
          title: "Current location",
          label: {
            text: 'C',
            color: 'black',
          },
          zIndex: 100
        })
      })
    }
  }

  getCenter(event) {
    return event['type'] !== 'transport';
  }

  setMarkers(map) {
    let eventMarker = [];
    this.markers = [];

    for (let i = 0; i < this.events.length; i++) {
      if(this.events[i]['type'] !== 'transport')  {
        if(this.events[i]['place']['lat']) {
          let date;
          let eventDate;

          if(this.events[i]['date'] !== 'any day')  {
            date = new Date(this.events[i]['date'])
            eventDate = date.getDate() + " " + this.month[date.getMonth()];
          } else if(this.events[i]['date'] === 'any day') {
            eventDate = 'any day';
          }

          eventMarker.push(
            [
              this.events[i]['name'],
              this.events[i]['place']['lat'],
              this.events[i]['place']['lng'],
              eventDate,
              this.events[i]['time']]
          )
        } else if(!this.events[i]['place']['lat']) {
          this.events.splice(i,1)
          i--;
        }
      }
    }
    this.setDate(eventMarker);

    for (let i = 0; i < eventMarker.length; i++) {
      let event = eventMarker[i];
      let marker = new google.maps.Marker({
        position: { lat: event[1], lng: event[2] },
        map: map,
        // icon: 'https://res.cloudinary.com/wwfileupload/image/upload/v1501394201/lodging-2_jsekp1.png',
        title: event[0],
        label: {
          text: '' + (i + 1),
          color: 'black',
        },
        date: event[3],
        zIndex: i
      })

      this.markers.push(marker);

      let infoWindow = new google.maps.InfoWindow({
        content: '<div class="info-window"><p>' + event[0] + '</p><br/><p>' + event[3] + " - " + event[4] + '</p></div>'
      })

      this.infoWindows.push(infoWindow);

      // infoWindow.open(map, marker)

      // google.maps.event.addListener(map, 'zoom_changed', (e) =>  {
      //   if(map.zoom > 16) {
      //     infoWindow.open(map, marker)
      //   } else  {
      //     infoWindow.close()
      //   }
      // })

      marker.addListener('click', ()  =>  {
        infoWindow.open(map, marker)
      })
    }

    let imagePath = 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
    let markerCluster = new MarkerClusterer(map, this.markers, {
            maxZoom: 15,
            imagePath: imagePath
          });

    this.loadingService.setLoader(false, "");
    this.preventScroll(false);
  }

  changeCenter(event)  {
    if(event['place']['lat'])  {
      let center = new google.maps.LatLng(event['place']['lat'], event['place']['lng']);

      this.openInfoWindow(event['place']['lat'], event['place']['lng'])
      this.itinMap.panTo(center);
      this.itinMap.setZoom(18);
    }

    this.showMapLegend = false;
    this.preventScroll(false);
  }

  openInfoWindow(lat, lng)  {
    for (let i = 0; i < this.infoWindows.length; i++) {
      this.infoWindows[i].close();
    }

    for (let i = 0; i < this.markers.length; i++) {
      let mlat = this.markers[i]['position'].lat().toFixed(6);
      let mlng = this.markers[i]['position'].lng().toFixed(6);
      let placeLat = lat.toFixed(6);
      let placeLng = lng.toFixed(6);

      if((placeLat == mlat) && (placeLng == mlng))  {
        google.maps.event.trigger(this.markers[i], 'click');
      }
    }
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
    if(this.flightPath !== undefined) this.flightPath.setMap(null);

    for (let i = 0; i < this.markers.length; i++) {
      if(this.markers[i]['date'] === date || date === "All dates")  {
        this.markers[i].setVisible(true);
      } else  {
        this.markers[i].setVisible(false);
      }
    }

    if(date === "All dates")  {
      this.filteredEvents = this.events;
    } else  {
      this.filteredEvents = Object.assign([], this.events).filter(
        event => event.converted_date === date
      )
    }

    this.changeCenter(this.filteredEvents[0]);

    if(date !== "All dates" && this.filteredEvents.length > 1)  {
      let path = [];
      for (let i = 0; i < this.filteredEvents.length; i++) {
        path.push({lat: this.filteredEvents[i]['place']['lat'], lng: this.filteredEvents[i]['place']['lng'] });
      }

      this.flightPath = new google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
      });

      this.flightPath.setMap(this.itinMap);
    }
  }

  toggleLegend() {
    this.showMapLegend = !this.showMapLegend;
    this.preventScroll(this.showMapLegend);
  }

  preventScroll(value)  {
    if(value) {
      this.renderer.addClass(document.body, 'prevent-scroll');
    } else  {
      this.renderer.removeClass(document.body, 'prevent-scroll');
    }
  }
}
