import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
declare var google:any;

import { LoadingService } from '../../../loading';
import { PlaceService }   from '../../../places';

@Component({
  selector: 'ww-admin-attraction-form',
  templateUrl: './admin-attraction-form.component.html',
  styleUrls: ['./admin-attraction-form.component.scss']
})
export class AdminAttractionFormComponent implements OnInit {
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

  showContactDetails6 = false;
  showContactDetails3 = false;

  details = true;

  constructor(
    private loadingService: LoadingService,
    private placeService: PlaceService,
    private formBuilder: FormBuilder) {
    this.newAttractionForm = this.formBuilder.group({
      'name': '',
      'country': '',
      'city': '',
      'description': '',
      'sub_description': '',
      'opening_hours': '',
      'entryFee': '',
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
  }

  getAttractionDetails(value)  {
    this.details = true;
    console.log(value);
    this.resetAttractionForm();

    let address_components = value['address_components'];
    let country = '';
    let city = '';

    for (let i = 0; i < address_components.length; i++) {
      if(address_components[i]['types'][0] === 'country')  {
        country = address_components[i]['long_name'];
      }
      if(address_components[i]['types'][0] === 'administrative_area_level_1') {
        city += ', ' + address_components[i]['long_name'];
      }
    }

    this.lat = value['geometry'].location.lat();
    this.lng = value['geometry'].location.lng();
    this.placeID = value['place_id'];

    let opening_hours = this.getOpeningHours(value.opening_hours);
    this.formatted_hours = opening_hours.replace(/\r?\n/g, '<br/> ');

    this.reviews = value.reviews;
    this.formatReviews();

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
          credit: c.slice(0,3) + 'target="_blank" ' + c.slice(3,c.length)
        });
      }
    }

    this.newAttractionForm.patchValue({
      name: value.name,
      formatted_address: value.formatted_address,
      country: country,
      city: city,
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

  formatReviews() {
    for (let i = 0; i < this.reviews.length; i++) {
      this.reviews[i]['author'] = "<a href='" + this.reviews[i]['author_url'] + "' target='_blank'>" + this.reviews[i]['author_name'] + "</a>";

      // if(this.reviews[i]['rating'] >= 1) this.reviews[i]['rating1'] = true;
      // if(this.reviews[i]['rating'] >= 2) this.reviews[i]['rating2'] = true;
      // if(this.reviews[i]['rating'] >= 3) this.reviews[i]['rating3'] = true;
      // if(this.reviews[i]['rating'] >= 4) this.reviews[i]['rating4'] = true;
      // if(this.reviews[i]['rating'] >= 5) this.reviews[i]['rating5'] = true;
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
      'sub_description': '',
      'opening_hours': '',
      'entryFee': '',
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

    this.placeService.addPlace(place).subscribe(
      result => {
        this.resetAttractionForm();
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
