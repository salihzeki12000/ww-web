import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Renderer2 } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';

declare var google:any;

import { CountryService } from '../../countries';
import { LoadingService } from '../../loading';

@Component({
  selector: 'ww-admin-countries',
  templateUrl: './admin-countries.component.html',
  styleUrls: ['./admin-countries.component.scss']
})
export class AdminCountriesComponent implements OnInit {
  @ViewChild('map') map: ElementRef;
  cMap;

  newCountryForm: FormGroup;
  countries;
  marker;
  center;

  constructor(
    private loadingService: LoadingService,
    private countryService: CountryService,
    private formBuilder: FormBuilder) {
      this.newCountryForm = this.formBuilder.group({
        'name': ['', Validators.compose([ Validators.required ])],
        'lat': ['', Validators.compose([ Validators.required ])],
        'lng': ['', Validators.compose([ Validators.required ])],
        'place_id': ['', Validators.compose([ Validators.required ])],
        'continent': ['', Validators.compose([ Validators.required ])],
        'zoom': ['', Validators.compose([ Validators.required ])],
      })
     }

  ngOnInit() {
    this.initMap();

    this.loadingService.setLoader(false, "");

    this.countryService.getCountries().subscribe(
      result => { this.countries = result.countries }
    )
  }

  initMap() {
    let mapDiv = this.map.nativeElement;

    this.cMap = new google.maps.Map(mapDiv, {
      center: {lat: 0, lng: 0},
      zoom: 2,
      styles: [{"stylers": [{ "saturation": -20 }]}]
    })
  }

  getCountryDetails(value) {
    this.newCountryForm.patchValue({
      name: value['name'],
      lat: value['geometry'].location.lat(),
      lng: value['geometry'].location.lng(),
      place_id: value['place_id']
    })


    this.setMarker(value);
  }

  setMarker(value)  {
    let lat = value['geometry'].location.lat();
    let lng = value['geometry'].location.lng();

    this.marker = new google.maps.Marker({
      position: { lat: lat, lng: lng},
      map: this.cMap
    })

    this.center = new google.maps.LatLng(lat, lng);
    this.cMap.panTo(this.center);
  }

  setZoom(zoom) {
    let z = +zoom
    this.cMap.setZoom(z);
    this.cMap.panTo(this.center);
  }

  onSubmit()  {
    this.loadingService.setLoader(true, "Saving country...");

    this.countryService.addCountry(this.newCountryForm.value).subscribe(
      result => {
        this.countries.push(result.country);

        this.loadingService.setLoader(false, "");
        this.newCountryForm.reset();
      }
    )
  }


  sortNameA()  {
    this.countries.sort((a,b)  =>  {
      if(a['name'] < b['name']) return -1;
      if(a['name'] > b['name']) return 1;
      return 0;
    })
  }

  sortNameD()  {
    this.countries.sort((a,b)  =>  {
      if(a['name'] < b['name']) return 1;
      if(a['name'] > b['name']) return -1;
      return 0;
    })
  }

  routeToCountry(country) {

  }

}
