import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';

declare var google:any;

@Component({
  selector: 'ww-location-pin',
  templateUrl: './location-pin.component.html',
  styleUrls: ['./location-pin.component.scss']
})
export class LocationPinComponent implements OnInit {
  @Input() event;

  @ViewChild('map') map: ElementRef;
  itinMap;

  constructor() { }

  ngOnInit() {
    this.initMap()
  }

  initMap() {
    let mapDiv = this.map.nativeElement;
    let center = {lat: this.event['place']['lat'], lng: this.event['place']['lng'] };
    let zoom = 17;

    this.itinMap = new google.maps.Map(mapDiv, {
      center: center,
      zoom: zoom,
      mapTypeControl: false,
      streetViewControl: false,
      styles: [{"stylers": [{ "saturation": -20 }]}]
    });

    this.setMarkers(this.itinMap);
  }

  setMarkers(map) {
    let marker = new google.maps.Marker({
      position: {lat: this.event['place']['lat'], lng: this.event['place']['lng'] },
      map: map,
    })
  }

}
