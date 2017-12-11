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

  itinerarySubscription: Subscription;
  itinerary;

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
    private element: ElementRef,
    private itineraryService: ItineraryService,
    private itineraryEventService: ItineraryEventService,
    private route: ActivatedRoute,
    private loadingService: LoadingService) { }

  ngOnInit() {
    let segments = this.route.snapshot['_urlSegment'].segments;
    if(segments[0]['path'] === 'preview') this.preview = true;

    this.eventSubscription = this.itineraryEventService.updateEvent.subscribe(
      result => {

        setTimeout(() =>  {
          this.filterEvents(result);
        }, 500)

        setTimeout(() =>  {
          this.initMap();
        }, 1000)

      })

    this.itinerarySubscription = this.itineraryService.currentItinerary.subscribe(
      result => {
        this.itinerary = result;

        let header = ''
        if(this.preview) header = "Preview : ";

        let title = header + result['name'] + " | Map";
        this.titleService.setTitle(title);
      })
  }

  ngOnDestroy() {
    if(this.itinerarySubscription) this.itinerarySubscription.unsubscribe();
    if(this.eventSubscription) this.eventSubscription.unsubscribe();

    this.loadingService.setLoader(true, "");
  }

  filterEvents(events)  {
    this.events = [];
    let index = 1;

    for (let i = 0; i < events.length; i++) {
      if(events[i]['type'] === 'transport' && events[i]['transport_type'] !== "vehicle rental") {
        if(events[i]['dep_station_location'] && events[i]['arr_station_location'])  {

          let depDate = new Date(events[i]['dep_date']);
          let dep_converted_date = depDate.getDate() + " " + this.month[depDate.getMonth()];

          let departure = {
            type: "transport",
            name: "Departs " + events[i]['dep_city'] + " (" + events[i]['dep_station'] + ")",
            place: events[i]['dep_station_location'],
            date: events[i]['dep_date'],
            time: events[i]['dep_time'],
            note: events[i]['note'],
            converted_date: dep_converted_date,
            index: index
          }

          index += 1;

          this.events.push(departure)

          let arrDate = new Date(events[i]['arr_date']);
          let converted_date = arrDate.getDate() + " " + this.month[arrDate.getMonth()];

          let arrival = {
            type: "transport",
            name: "Arrives " + events[i]['arr_city'] + " (" + events[i]['arr_station'] + ")",
            place: events[i]['arr_station_location'],
            date: events[i]['arr_date'],
            time: events[i]['arr_time'],
            note: events[i]['note'],
            converted_date: converted_date,
            index: index,
            arrival: true,
          }

          index += 1;

          this.events.push(arrival);

          setTimeout(() =>  {
            this.setTravelPath(events[i]);
          }, 1000)
        }
      }

      if(events[i]['type'] !== 'transport' && events[i]['location'])  {

        if(this.itinerary['num_days'])  {
          events[i]['converted_date'] = events[i]['date']
        } else  {
          let date = new Date(events[i]['date']);
          let converted_date = date.getDate() + " " + this.month[date.getMonth()];

          events[i]['converted_date'] = converted_date;
        }

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
          icon: "https://res.cloudinary.com/wwfileupload/image/upload/v1506913864/current_location_hdlfjj.png",
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
      // if(this.events[i]['type'] !== 'transport')  {
        if(this.events[i]['place']['lat']) {
          let date;
          let eventDate;
          let icon;
          let color;

          if(this.events[i]['date'] !== 'any day' && !this.itinerary['num_days'])  {
            date = new Date(this.events[i]['date'])
            eventDate = date.getDate() + " " + this.month[date.getMonth()];
          } else if(this.events[i]['date'] === 'any day' || this.itinerary['num_days']) {
            eventDate = this.events[i]['date'];
          }

          if(this.events[i]['type'] === 'activity') {
            icon = "https://res.cloudinary.com/wwfileupload/image/upload/v1507089951/red_marker2_vet9gn.png";
            color = "#D6101E";
          } else if(this.events[i]['type'] === 'accommodation') {
            icon = "https://res.cloudinary.com/wwfileupload/image/upload/v1507090509/purple_marker2_ohhe64.png";
            color = "#9421FF";
          } else if(this.events[i]['type'] === 'transport') {
            icon = "https://res.cloudinary.com/wwfileupload/image/upload/v1507186249/orange_marker2_ltrumz.png";
            color = "#FFA15C";
          }

          eventMarker.push(
            [ this.events[i]['name'],
              this.events[i]['place']['lat'],
              this.events[i]['place']['lng'],
              eventDate,
              this.events[i]['time'],
              this.events[i]['note'],
              icon,
              color]
          )
        } else if(!this.events[i]['place']['lat']) {
          this.events.splice(i,1)
          i--;
        }
      // }
    }

    this.setDate(eventMarker);

    for (let i = 0; i < eventMarker.length; i++) {
      let event = eventMarker[i];
      let marker = new google.maps.Marker({
        position: { lat: event[1], lng: event[2] },
        map: map,
        icon: {
          url: event[6],
          labelOrigin: new google.maps.Point(16, 16)
        },
        title: event[0],
        label: {
          text: '' + (i + 1),
          color: event[7],
          fontSize: '13px',
          fontWeight: 'bold'
        },
        date: event[3],
        zIndex: i
      })

      this.markers.push(marker);

      let infoWindow = new google.maps.InfoWindow({
        content: '<div id="iw-container">' +
                    '<h5>' + event[3] + " - " + event[4] + '</h5>' +
                    '<p style="padding: 10px 5px; font-weight: bold; text-align: center;">' + event[0] + '</p>' +
                    '<p style="padding-bottom: 15px; color: #808080; text-align: center;">' + event[5] + '</p>' +
                  '</div>'
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

  setTravelPath(event) {
    let path = [];
    path.push({ lat: event['dep_station_location']['lat'], lng: event['dep_station_location']['lng']});
    path.push({ lat: event['arr_station_location']['lat'], lng: event['arr_station_location']['lng']});

    let lineSymbol = {
      path: google.maps.SymbolPath.FORWARD_OPEN_ARROW
    };

    let travelPath = new google.maps.Polyline({
      path: path,
      geodesic: true,
      strokeColor: "#FFA15C",
      strokeOpacity: 1,
      strokeWeight: 3,
      icons: [{
        icon: lineSymbol,
        offset: '100%'
      }],
    })

    travelPath.setMap(this.itinMap);
  }



  // change center
  changeCenter(event)  {
    if(event['place']['lat'])  {
      let center = new google.maps.LatLng(event['place']['lat'], event['place']['lng']);

      this.openInfoWindow(event['place']['lat'], event['place']['lng'])
      this.itinMap.panTo(center);
      this.itinMap.setZoom(16);
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



  // filter by date

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

    if(date !== "All dates" && date !== 'any day' && this.filteredEvents.length > 1)  {
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

    if(this.element.nativeElement.offsetParent.clientWidth < 891) {
      this.showMapLegend = true;
    }
  }


  // others

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
