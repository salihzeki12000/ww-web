import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Rx';

declare var google:any;
declare var MarkerClusterer:any;

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

  eventSubscription: Subscription;
  events: ItineraryEvent[] = [];

  markers = [];
  infoWindows = [];

  month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  dates = [];
  selectedDate;

  showMapLegend = false;

  constructor(
    private renderer: Renderer2,
    private itineraryEventService: ItineraryEventService,
    private route: ActivatedRoute,
    private loadingService: LoadingService) { }

  ngOnInit() {
    this.eventSubscription = this.itineraryEventService.updateEvent.subscribe(
                                  result => {
                                    this.filterEvents(result);
                                    this.initMap();
                                  })
  }

  ngOnDestroy() {
    this.eventSubscription.unsubscribe();
    this.loadingService.setLoader(true, "");
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
            [this.events[i]['name'], this.events[i]['place']['lat'], this.events[i]['place']['lng'], eventDate, this.events[i]['time']]
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
    if(event['lat'])  {
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
    for (let i = 0; i < this.markers.length; i++) {
      if(this.markers[i]['date'] === date || date === "All dates")  {
        this.markers[i].setVisible(true);
      } else  {
        this.markers[i].setVisible(false);
      }
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
