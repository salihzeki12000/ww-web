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

  @Input() width;
  @Input() height;

  @ViewChild('map') map: ElementRef;
  itinMap;

  constructor() { }

  ngOnInit() {
    setTimeout(() =>  {
      this.initMap()
    }, 2000)
  }

  initMap() {
    let mapDiv = this.map.nativeElement;
    let center = {lat: this.lat, lng: this.lng };
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
      position: {lat: this.lat, lng: this.lng },
      map: map,
    })
  }

}