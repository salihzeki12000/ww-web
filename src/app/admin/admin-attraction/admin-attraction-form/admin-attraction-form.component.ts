import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
declare var google:any;

import { LoadingService } from '../../../loading';

@Component({
  selector: 'ww-admin-attraction-form',
  templateUrl: './admin-attraction-form.component.html',
  styleUrls: ['./admin-attraction-form.component.scss']
})
export class AdminAttractionFormComponent implements OnInit {
  @ViewChild('map') map: ElementRef;
  mapPosition;

  newAttractionForm: FormGroup;
  attractionDetail;

  showContactDetails = false;
  showMenu = false;

  constructor(
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
      'date': '',
      'time': '',
      'note': '',
      'locationCheckedIn': '',
    })
  }

  ngOnInit() {
  }

  getAttractionDetails(value)  {
    console.log(value);
    this.resetAttractionForm();

    this.attractionDetail = value;

    let address_components = value['address_components'];

    for (let i = 0; i < address_components.length; i++) {
      if(address_components[i]['types'][0] === 'country')  {
        this.attractionDetail['country'] = address_components[i]['long_name'];
      }
      if(address_components[i]['types'][0] === 'administrative_area_level_1') {
        this.attractionDetail['city'] += ', ' + address_components[i]['long_name'];
      }
    }
    this.attractionDetail['lat'] = this.attractionDetail['geometry'].location.lat();
    this.attractionDetail['lng'] = this.attractionDetail['geometry'].location.lng();

    this.attractionDetail['opening_hours'] = this.getOpeningHours(this.attractionDetail.opening_hours);

    this.initMap(this.attractionDetail['lat'], this.attractionDetail['lng']);
  }

  getOpeningHours(hours)  {
    let openingHours = [];
    let openingHoursGroup = {};
    let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let output = '';

    if (hours === undefined) {
      return ''
    }

    //to handle 24hrs establishments
    if(hours.periods.length === 1)  {
      return "Open 24hrs"
    }

    //reorgnise to open-close time
    for (let i = 0; i < hours.periods.length; i++) {
      openingHours.push(hours.periods[i].open.time + "hrs" + " - " + hours.periods[i].close.time + "hrs");
    }

    //group similar timings
    for (let i = 0; i < openingHours.length; i++) {
      if(openingHoursGroup[openingHours[i]])  {
        openingHoursGroup[openingHours[i]].push([days[i], i])
      } else  {
        openingHoursGroup[openingHours[i]] = [];
        openingHoursGroup[openingHours[i]].push([days[i], i])
      }
    }

    //to handle open daily same timing
    for (let time in openingHoursGroup) {
      let groupLength = Object.keys(openingHoursGroup).length;
      if( groupLength === 1 && openingHoursGroup[time].length === 7)  {
        return "Daily: " + time
      }
    }

    //to handle different timings
    for (let i = 0; i < hours.weekday_text.length; i++) {
      output += hours.weekday_text[i] + " \n";
    }
    return output;
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
      'date': '',
      'time': '',
      'note': '',
      'locationCheckedIn': '',
    }])
  }

  onSubmit()  {

  }

  toggleContactDetails()  {
    this.showContactDetails = !this.showContactDetails;
  }

  showMenuOptions() {
    this.showMenu = true;
  }

  initMap(lat, lng) {
    let mapDiv = this.map.nativeElement;

    this.mapPosition = new google.maps.Map(mapDiv, {
      center: {lat: lat, lng: lng },
      zoom: 13,
      styles: [{"stylers": [{ "saturation": -20 }]}]
    });

    let marker = new google.maps.Marker({
      position: {lat: lat, lng: lng },
      map: this.mapPosition
    })

  }


}
