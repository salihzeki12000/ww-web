import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';

import { CountryService } from '../../countries';
import { LoadingService } from '../../loading';

@Component({
  selector: 'ww-admin-countries',
  templateUrl: './admin-countries.component.html',
  styleUrls: ['./admin-countries.component.scss']
})
export class AdminCountriesComponent implements OnInit {
  newCountryForm: FormGroup;
  countries;

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
      })
     }

  ngOnInit() {
    this.loadingService.setLoader(false, "");

    this.countryService.getCountries().subscribe(
      result => { this.countries = result.countries }
    )
  }

  getCountryDetails(value) {
    this.newCountryForm.patchValue({
      name: value['name'],
      lat: value['geometry'].location.lat(),
      lng: value['geometry'].location.lng(),
      place_id: value['place_id']
    })
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

}
