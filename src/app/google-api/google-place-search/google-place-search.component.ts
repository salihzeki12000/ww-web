import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, Output, EventEmitter, Renderer } from '@angular/core';
declare var google:any;

@Component({
  selector: 'ww-google-place-search',
  template: `
    <div class="form-group">
      <input type="text" #ggPlaceSearch class="form-control" (dblclick)="getDetails()" placeholder="">
    </div>
  `,
  styleUrls: ['./google-place-search.component.scss']
})
export class GooglePlaceSearchComponent implements OnInit, AfterViewInit {
  @ViewChild('ggPlaceSearch') ggPlaceSearch: ElementRef;
  place;

  @Output() placeDetail = new EventEmitter();

  constructor(private renderer: Renderer) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    let search = this.ggPlaceSearch.nativeElement;
    let autocomplete = new google.maps.places.Autocomplete(search);
    let event = new MouseEvent('dblclick');

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
    this.placeDetail.emit(this.place)
  }

}
