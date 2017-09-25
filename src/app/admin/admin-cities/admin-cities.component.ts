import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';

import { LoadingService } from '../../loading';
import { CountryService } from '../../countries';
import { CityService }    from '../../cities';

@Component({
  selector: 'ww-admin-cities',
  templateUrl: './admin-cities.component.html',
  styleUrls: ['./admin-cities.component.scss']
})
export class AdminCitiesComponent implements OnInit {
  newCityForm: FormGroup;

  cities;
  countries;
  countriesName;
  countryID;

  constructor(
    private loadingService: LoadingService,
    private cityService: CityService,
    private countryService: CountryService,
    private formBuilder: FormBuilder) {
      this.newCityForm = this.formBuilder.group({
        'name': ['', Validators.compose([ Validators.required ])],
        'lat': ['', Validators.compose([ Validators.required ])],
        'lng': ['', Validators.compose([ Validators.required ])],
        'place_id': ['', Validators.compose([ Validators.required ])],
        'country': ['', Validators.compose([ Validators.required ])],
      })
     }

  ngOnInit() {
    this.loadingService.setLoader(false, "");

    this.cityService.getCities().subscribe(
      result => {
        this.cities = result.cities;
      })

    this.countryService.getCountries().subscribe(
      result => {
        this.countries = result.countries;
        this.getCountriesName();
      })
  }

  getCountriesName()  {
    this.countriesName = [];

    for(let i = 0; i < this.countries.length; i++) {
      this.countriesName.push(this.countries[i]['name']);
    }
  }

  getCityDetails(value) {
    console.log(value)
    let address = value['address_components'];
    let country = '';

    for (let i = 0; i < address.length; i++) {
      if(address[i]['types'][0] === 'country')  {
        country = address[i]['long_name'];
        this.checkCountry(country);
      }
    }

    this.newCityForm.patchValue({
      name: value['name'],
      lat: value['geometry'].location.lat(),
      lng: value['geometry'].location.lng(),
      place_id: value['place_id'],
      country: country
    })
  }

  checkCountry(country) {
    let index = this.countriesName.indexOf(country)
    if(index > -1)  {
      this.countryID = this.countries[index];
    } else {
      this.countryService.addCountry(country).subscribe(
        result => {
          this.countryID = result.country;
        })
    }
  }

  onSubmit()  {
    this.loadingService.setLoader(true, "Saving city...");

    let newCity = this.newCityForm.value;
    newCity['country'] = this.countryID;

    this.cityService.addCity(newCity).subscribe(
      result => {
        this.cities.unshift(result.city);

        this.loadingService.setLoader(false, "");
        this.newCityForm.reset();
      })
  }



  sortNameA()  {
    this.cities.sort((a,b)  =>  {
      if(a['name'] < b['name']) return -1;
      if(a['name'] > b['name']) return 1;
      return 0;
    })
  }

  sortNameD()  {
    this.cities.sort((a,b)  =>  {
      if(a['name'] < b['name']) return 1;
      if(a['name'] > b['name']) return -1;
      return 0;
    })
  }

  sortCountryA()  {
    this.cities.sort((a,b)  =>  {
      if(a['name'] < b['name']) return -1;
      if(a['name'] > b['name']) return 1;
      return 0;
    })
  }

  sortCountryD()  {
    this.cities.sort((a,b)  =>  {
      if(a['country']['name'] < b['country']['name']) return 1;
      if(a['country']['name'] > b['country']['name']) return -1;
      return 0;
    })
  }
}
