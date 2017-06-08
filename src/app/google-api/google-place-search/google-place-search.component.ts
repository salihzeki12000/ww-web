import { Component, OnInit, Input, AfterViewInit, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
declare var google:any;

@Component({
  selector: 'ww-google-place-search',
  template: `
    <input type="text" #ggPlaceSearch placeholder="" [value]="populate" (dblclick)="getDetails()" (keyup.enter)="$event.preventDefault()" (keyup.enter)="logSearch(ggPlaceSearch.value)" [class.settings]="settings === 'true'">
  `,
  styleUrls: ['./google-place-search.component.scss']
})
export class GooglePlaceSearchComponent implements OnInit, AfterViewInit {
  @ViewChild('ggPlaceSearch') ggPlaceSearch: ElementRef;
  place;
  @Input() options;
  @Input() populate = "";
  @Input() settings; //to display input field without border

  @Output() placeDetail = new EventEmitter();
  @Output() searching = new EventEmitter();


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
      if(autocomplete.getPlace().place_id)  {
        this.place = autocomplete.getPlace();
        this.ggPlaceSearch.nativeElement.dispatchEvent(event);
        this.getDetails();
      }
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

  logSearch(text) {
    this.searching.emit(text);
  }


}
