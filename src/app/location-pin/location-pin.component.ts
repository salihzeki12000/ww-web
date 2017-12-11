import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';

declare var google:any;

@Component({
  selector: 'ww-location-pin',
  templateUrl: './location-pin.component.html',
  styleUrls: ['./location-pin.component.scss']
})
export class LocationPinComponent implements OnInit {
  @Input() lat;
  @Input() lng;

  @Input() locations;
  @Input() width;
  @Input() height;

  @ViewChild('map') map: ElementRef;
  displayMap;

  constructor() { }

  ngOnInit() {
    setTimeout(() =>  {
      this.initMap()
    }, 2500)
  }

  initMap() {
    let mapDiv = this.map.nativeElement;
    let center = {lat: 0, lng: 0 };
    let zoom = 17;

    this.displayMap = new google.maps.Map(mapDiv, {
      center: center,
      zoom: zoom,
      mapTypeControl: false,
      streetViewControl: false,
      styles: [{"stylers": [{ "saturation": -20 }]}]
    });

    this.setMarkers(this.displayMap);
  }

  setMarkers(map) {
    let eventMarker = [];
    let icon = "https://res.cloudinary.com/wwfileupload/image/upload/v1507186249/orange_marker2_ltrumz.png";
    let color = "#FFA15C";
    let path = [];
    let bounds  = new google.maps.LatLngBounds();

    for (let i = 0; i < this.locations.length; i++) {
      let marker = new google.maps.Marker({
        position: {lat: this.locations[i]['lat'], lng: this.locations[i]['lng'] },
        map: map,
        icon: {
          url: icon,
          labelOrigin: new google.maps.Point(16, 16)
        },
        title: this.locations[i]['name'],
        label: {
          text: this.locations[i]['name'].charAt(0),
          color: color
        }
      })

      path.push({lat: this.locations[i]['lat'], lng: this.locations[i]['lng']})

      let loc = new google.maps.LatLng(this.locations[i]['lat'], this.locations[i]['lng']);
      bounds.extend(loc);
    }

    let lineSymbol = {
      path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW
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

    travelPath.setMap(map);
    map.fitBounds(bounds);
    map.panToBounds(bounds);
  }

}
