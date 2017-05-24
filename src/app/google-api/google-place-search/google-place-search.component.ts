import { Component, OnInit, Input, AfterViewInit, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
declare var google:any;

@Component({
  selector: 'ww-google-place-search',
  template: `
    <input type="text" #ggPlaceSearch (dblclick)="getDetails()" placeholder="">
  `,
  styleUrls: ['./google-place-search.component.scss']
})
export class GooglePlaceSearchComponent implements OnInit, AfterViewInit {
  @ViewChild('ggPlaceSearch') ggPlaceSearch: ElementRef;
  place;
  @Input() options;
  @Output() placeDetail = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    let search = this.ggPlaceSearch.nativeElement;
    let autocomplete;

    if(!this.options) {
      autocomplete = new google.maps.places.Autocomplete(search);
    } else if(this.options)  {
      autocomplete = new google.maps.places.Autocomplete(search, this.options);
    }

    let event = new MouseEvent('dblclick');

    autocomplete.addListener('place_changed', () => {
      this.place = autocomplete.getPlace();
      this.ggPlaceSearch.nativeElement.dispatchEvent(event);
    })

    google.maps.event.addDomListener(search, 'keydown', function(e) {
      if (e.keyCode == 13) {
          e.preventDefault();
      }
    });
  }

  getDetails()  {
    this.placeDetail.emit(this.place)
  }

}
