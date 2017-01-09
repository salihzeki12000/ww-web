import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, Output, EventEmitter, Renderer } from '@angular/core';
declare var google:any;

@Component({
  selector: 'ww-google-checkin',
  template:`
    <div class="form-group">
      <label>Search for your check in location</label>
      <input type="text" #checkinSearch class="form-control" (blur)="getDetails()">
    </div>
  `,
  styleUrls: ['./google-checkin.component.scss']
})
export class GoogleCheckinComponent implements OnInit, AfterViewInit {
  @ViewChild('checkinSearch') checkinSearch: ElementRef;
  place;

  @Output() checkinDetail = new EventEmitter();

  constructor(private renderer: Renderer) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    let search = this.checkinSearch.nativeElement;
    let autocomplete = new google.maps.places.Autocomplete(search);
    let event = new MouseEvent('blur');

    autocomplete.addListener('place_changed', () => {
      this.place = autocomplete.getPlace();
      this.renderer.invokeElementMethod(search, 'dispatchEvent', [event]);
    })

    google.maps.event.addDomListener(search, 'keydown', function(e) {
      if (e.keyCode == 13) {
          e.preventDefault();
      }
    });
  }

  getDetails()  {
    this.checkinDetail.emit(this.place)
  }

}
