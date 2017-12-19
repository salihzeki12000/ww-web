import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
declare var google:any;

import { LoadingService } from '../../../loading';
import { PlaceService }   from '../../../places';
import { CountryService } from '../../../countries';
import { CityService }    from '../../../cities';

@Component({
  selector: 'ww-admin-place-form',
  templateUrl: './admin-place-form.component.html',
  styleUrls: ['./admin-place-form.component.scss']
})
export class AdminPlaceFormComponent implements OnInit {
  @ViewChild('map') map: ElementRef;
  mapPosition;
  lat;
  lng;

  newAttractionForm: FormGroup;
  formatted_hours = '';
  pictureOptions = [];
  displayPic;
  placeID;
  reviews = [];
  openingHoursRaw;

  showContactDetails6 = false;
  showContactDetails3 = false;

  details = true;
  country;
  countries;
  countriesName;
  countryID;
  cities;
  citiesName;

  constructor(
    private countryService: CountryService,
    private cityService: CityService,
    private loadingService: LoadingService,
    private placeService: PlaceService,
    private formBuilder: FormBuilder) {
    this.newAttractionForm = this.formBuilder.group({
      'name': '',
      'country': '',
      'city': '',
      'description': '',
      'long_description': '',
      'tips': '',
      'opening_hours': '',
      'entry_fee': '',
      'website': '',
      'formatted_address': '',
      'lat': '',
      'lng': '',
      'international_phone_number':'',
      'place_id': '',
      'getting_there':'',
    })
  }

  ngOnInit() {
    this.countryService.getCountries().subscribe(
      result => {
        this.countries = result.countries;
        this.getCountriesName();
      })

    this.cityService.getCities().subscribe(
      result => {
        this.cities = result.cities;
        this.getCitiesName();
      })
  }

  getCountriesName()  {
    this.countriesName = [];

    for(let i = 0; i < this.countries.length; i++) {
      this.countriesName.push(this.countries[i]['name']);
    }
  }

  getCitiesName() {
    this.citiesName = [];

    for (let i = 0; i < this.cities.length; i++) {
      this.citiesName.push(this.cities[i]['name'] + ', ' + this.cities[i]['country']['name']);
    }
  }

  getAttractionDetails(value)  {
    this.details = true;
    this.resetAttractionForm();

    let address_components = value['address_components'];
    let country = '';
    let city = '';

    for (let i = 0; i < address_components.length; i++) {
      if(address_components[i]['types'][0] === 'country')  {
        country = address_components[i]['long_name'];
        this.getCountryLatLng(country);
      }
      if(address_components[i]['types'][0] === 'administrative_area_level_1') {
        city += ', ' + address_components[i]['long_name'];
      }
    }

    this.lat = value['geometry'].location.lat();
    this.lng = value['geometry'].location.lng();
    this.placeID = value['place_id'];

    if(this.details['opening_hours'])  {
      this.openingHoursRaw = this.details['opening_hours']['periods'];
    }

    let opening_hours = this.getOpeningHours(value.opening_hours);

    this.reviews = value.reviews;
    if(this.reviews) this.formatReviews();

    if(value.photos) {
      let credit = value.photos[0].html_attributions[0];

      this.displayPic = {
        url: value.photos[0].getUrl({'maxWidth': 300, 'maxHeight': 250}),
        credit: credit.slice(0,3) + 'target="_blank" ' + credit.slice(3,credit.length)
      };

      this.pictureOptions = [];
      for (let i = 0; i < value.photos.length; i++) {
        let c = value.photos[i].html_attributions[0]
        this.pictureOptions.push({
          url: value.photos[i].getUrl({'maxWidth': 300, 'maxHeight': 250}),
          credit: c.slice(0,3) + 'target="_blank" ' + c.slice(3,c.length),
          status: true
        });
      }
    }

    this.newAttractionForm.patchValue({
      name: value.name,
      description: '',
      formatted_address: value.formatted_address,
      country: country,
      // city: city,
      lat: this.lat,
      lng: this.lng,
      international_phone_number: value.international_phone_number,
      website: value.website,
      opening_hours: opening_hours,
      url: value.url,
      place_id: value.place_id,
    })

    this.initMap();
  }

  getOpeningHours(hours)  {
    let openingHours = [];
    let openingHoursGroup = {};
    let output = '';

    if (hours === undefined) return '';

    //to handle 24hrs establishments
    if(hours.periods.length === 1) return "Open 24hrs";

    //reorgnise each day to open-close time
    for (let i = 0; i < hours.periods.length; i++) {
      openingHours.push(hours.periods[i].open.time + "hrs" + " - " + hours.periods[i].close.time + "hrs");
    }

    //group similar timings
    for (let i = 0; i < openingHours.length; i++) {
      if(openingHoursGroup[openingHours[i]])  {
        openingHoursGroup[openingHours[i]].push([i]);
      } else  {
        openingHoursGroup[openingHours[i]] = [];
        openingHoursGroup[openingHours[i]].push([i]);
      }
    }

    //to handle daily same timing
    for (let time in openingHoursGroup) {
      if(openingHoursGroup[time].length === 7 && Object.keys(openingHoursGroup).length === 1) return "Daily: " + time;
    }

    //to handle different timings
    for (let i = 0; i < hours.weekday_text.length; i++) {
      output += hours.weekday_text[i] + " \n";
    }
    return output;
  }

  getCountryLatLng(country)  {
    let geocoder = new google.maps.Geocoder;

    geocoder.geocode({address: country}, (result, status) =>  {
      if(status === 'OK') {
        let lat = result[0]['geometry'].location.lat();
        let lng = result[0]['geometry'].location.lng();

        this.country = {
          name: country,
          lat: lat,
          lng: lng
        }

        this.checkCountry();
      }
    })
  }

  checkCountry() {
    let index = this.countriesName.indexOf(this.country['name'])

    if(index > -1)  {
      this.countryID = this.countries[index];
    } else {
      this.countryService.addCountry(this.country).subscribe(
        result => {
          this.countryID = result.country;

          this.countries.push(this.countryID);
          this.countriesName.push(this.countryID['name']);
        })
    }
  }

  formatReviews() {
    for (let i = 0; i < this.reviews.length; i++) {
      this.reviews[i]['author'] = "<a href='" + this.reviews[i]['author_url'] + "' target='_blank'>" + this.reviews[i]['author_name'] + "</a>";
    }
  }

  logHours(h) {
    this.formatted_hours = h.replace(/\r?\n/g, '<br/> ');
  }

  reposition(i, j)  {
    this.pictureOptions.splice(j - 1, 0, this.pictureOptions.splice(i, 1)[0]);
  }

  resetAttractionForm() {
    this.newAttractionForm.reset([{
      'name': '',
      'description': '',
      'long_description': '',
      'tips': '',
      'opening_hours': '',
      'entry_fee': '',
      'website': '',
      'formatted_address': '',
      'lat': '',
      'lng': '',
      'international_phone_number':'',
      'place_id': '',
      'getting_there':'',
    }])
  }


  initMap() {
    setTimeout(() =>  {

      let mapDiv = this.map.nativeElement;

      this.mapPosition = new google.maps.Map(mapDiv, {
        center: {lat: this.lat, lng: this.lng },
        zoom: 17,
        styles: [{"stylers": [{ "saturation": -20 }]}]
      });

      let marker = new google.maps.Marker({
        position: {lat: this.lat, lng: this.lng },
        map: this.mapPosition
      })

    }, 1000)
  }

  onSubmit()  {
    this.loadingService.setLoader(true, "Saving attraction...");

    let place = this.newAttractionForm.value;

    let index = this.citiesName.indexOf(place['city']);
    place['city'] = this.cities[index];

    place['country'] = this.countryID;
    place['opening_hours_raw'] = this.openingHoursRaw;

    for (let i = 0; i < this.pictureOptions.length; i++) {
      if(!this.pictureOptions[i]['status'])  {
        this.pictureOptions.splice(i,1);
        i--;
      }
    }

    place['photos'] = this.pictureOptions;

    this.placeService.addPlace(place).subscribe(
      result => {
        this.resetAttractionForm();
        this.pictureOptions = [];
        this.reviews = [];
        this.loadingService.setLoader(false, "");
      }
    )
  }

  getDetails()  {
    this.details = true;

    if(this.lat)  {
      this.initMap()
    }
  }


}
