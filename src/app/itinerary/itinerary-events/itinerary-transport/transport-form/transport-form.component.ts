import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs/Rx';
declare var google:any;

import { Itinerary }             from '../../../itinerary';
import { ItineraryService }      from '../../../itinerary.service';
import { ItineraryEvent }        from '../../itinerary-event';
import { ItineraryEventService } from '../../itinerary-event.service';

import { UserService }         from '../../../../user';
import { FlashMessageService } from '../../../../flash-message';
import { ErrorMessageService } from '../../../../error-message';
import { PlaceService }        from '../../../../places';
import { CountryService }      from '../../../../countries';

@Component({
  selector: 'ww-transport-form',
  templateUrl: './transport-form.component.html',
  styleUrls: ['./transport-form.component.scss']
})
export class TransportFormComponent implements OnInit, OnDestroy {
  @Output() hideTransportForm = new EventEmitter();

  addTransportForm: FormGroup;
  transportOption = '';
  transportType = [
    { name:'flight', icon: 'plane' },
    { name:'train', icon: 'train' },
    { name:'bus', icon: 'bus' },
    { name:'cruise', icon: 'ship'},
    { name:'vehicle rental', icon: 'car'},
    { name:'others', icon: 'rocket'} ];


  // to influence progress bar
  searchFlight = false;
  chooseAirport = false; // to create li for select airport progress tracker for flights with multiple legs
  confirmPage = false;

  searchFlightForm: FormGroup;

  flightNotFound = false;

  flightSearchDetail;
  codeshare = false;
  selectStopOver = false;
  depAirports = [];
  arrAirports = [];

  // google search options
  cityOptions = { types: ['(cities)'] };
  depCity = '';
  arrCity = '';
  depStation = '';
  arrStation = '';

  depLocation;
  arrLocation;
  place;
  countries;
  countriesName;

  // time picker
  ats = true;
  timePickerDep = false;
  hourDep = "anytime";
  minuteDep = "00";

  timePickerArr = false;
  hourArr = "anytime";
  minuteArr = "00";

  dateSubscription: Subscription;
  dateRange = [];
  firstDay;

  currentUserSubscription: Subscription;
  currentUser;

  itinerarySubscription: Subscription;
  itinerary;

  constructor(
    private itineraryService: ItineraryService,
    private itineraryEventService: ItineraryEventService,
    private userService: UserService,
    private placeService: PlaceService,
    private countryService: CountryService,
    private flashMessageService: FlashMessageService,
    private errorMessageService: ErrorMessageService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder) {
      this.addTransportForm = this.formBuilder.group({
        'transport_type': '',
        'reference_number': '',
        'dep_terminal': '',
        'arr_terminal': '',
        'dep_station': '',
        'dep_station_location': '',
        'arr_station': '',
        'arr_station_location': '',
        'dep_city': ['', Validators.required],
        'arr_city': ['', Validators.required],
        'dep_date': ['', Validators.required],
        'dep_time': '',
        'arr_date': ['', Validators.required],
        'arr_time': '',
        'transport_company': '',
        'operating_carrier': '',
        'operating_flight': '',
        'contact_number': '',
        'note': '',
      }),
      this.searchFlightForm = this.formBuilder.group({
        'searchAirlineCode': ['', Validators.required],
        'searchFlightNumber': ['', Validators.required],
        'searchDepDate': ['', Validators.required],
      })
    }

  ngOnInit() {
    this.currentUserSubscription = this.userService.updateCurrentUser.subscribe(
      result => { this.currentUser = result; })

    this.itinerarySubscription = this.itineraryService.currentItinerary.subscribe(
      result => { this.itinerary = result; })

    this.dateSubscription = this.itineraryService.updateDate.subscribe(
      result => {
        this.dateRange  = Object.keys(result).map(key => result[key]);
        this.firstDay = this.dateRange[1];
    })

    this.countryService.getCountries().subscribe(
      result => {
        this.countries = result.countries;
        this.getCountriesName();
      }
    )
  }

  @HostListener('document:click', ['$event'])
  checkClick(event) {
    if(!event.target.classList.contains("time-picker-dropdown") &&
      !event.target.classList.contains("time") &&
      !event.target.classList.contains("time-select") &&
      !event.target.classList.contains("selected-time")) {
      this.timePickerDep = false;
      this.timePickerArr = false;
    }
  }

  ngOnDestroy() {
    if(this.itinerarySubscription) this.itinerarySubscription.unsubscribe();
    if(this.dateSubscription) this.dateSubscription.unsubscribe();
    if(this.currentUserSubscription) this.currentUserSubscription.unsubscribe();
  }

  getCountriesName()  {
    this.countriesName = [];

    for(let i = 0; i < this.countries.length; i++) {
      this.countriesName.push(this.countries[i]['name']);
    }
  }


  // progress bar
  selectTransport() {
    this.transportOption = '';
    this.confirmPage = false;

    this.searchFlight = false;
    this.codeshare = false;
    this.chooseAirport = false;
    this.selectStopOver = false;
  }

  flightSearch()  {
    this.searchFlight = true;

    this.codeshare = false;
    this.chooseAirport = false;
    this.selectStopOver = false;
    this.confirmPage = false;
  }

  selectAirport() {
    this.selectStopOver = true;
    this.confirmPage = false;
  }


  // step 1
  selectTransportType(transport)  {
    this.transportOption = transport;

    if(transport !== 'flight') this.confirmPage = true;
    if(transport === 'flight') this.searchFlight = true;

    this.addTransportForm.patchValue({
      dep_date: this.firstDay,
      arr_date: this.firstDay,
    })
  }


  // get flight details from flightstats.com
  searchFlightDetails()  {
    this.searchFlight = false;

    let airlineCode = (this.searchFlightForm.value.searchAirlineCode).toUpperCase();
    let flightNumber = this.searchFlightForm.value.searchFlightNumber;

    let dep_date = new Date(this.searchFlightForm.value.searchDepDate);
    let year = dep_date.getFullYear();
    let month = dep_date.getMonth() + 1;
    let day = dep_date.getDate();

    let criteria = 'flight/' + airlineCode + '/' + flightNumber + '/departing/' + year + '/' + month + '/' + day;

    this.itineraryEventService.getFlightDetails(criteria).subscribe(
          data => {
            if(data['scheduledFlights'].length === 0) {
              this.flightNotFound = true;
            } else  {
              let scheduledFlights = data['scheduledFlights'];
              let appendix = data['appendix'];

              let flightNumber = scheduledFlights[0].flightNumber;
              let carrierCode = scheduledFlights[0].carrierFsCode;
              let carrier;

              for (let i = 0; i < appendix.airlines.length; i++) {
                if (appendix.airlines[i].fs === carrierCode)  {
                  carrier = appendix.airlines[i].name;
                }
              }

              // code share details
              let operatingCarrier;
              let operatingCarrierCode;
              let operatingFlightNumber;

              if(scheduledFlights[0].isCodeshare) {
                this.codeshare = true;
                operatingCarrierCode = scheduledFlights[0].operator.carrierFsCode;
                operatingFlightNumber = scheduledFlights[0].operator.flightNumber;

                for (let i = 0; i < appendix.airlines.length; i++) {
                  if (appendix.airlines[i].fs === operatingCarrierCode)  {
                    operatingCarrier = appendix.airlines[i].name;
                  }
                }
              }

              // flight details
              if(scheduledFlights.length === 1) {
                let departureAirportCode = scheduledFlights[0].departureAirportFsCode;
                let arrivalAirportCode = scheduledFlights[0].arrivalAirportFsCode;
                let departureTerminal;

                if(scheduledFlights[0].departureTerminal !== '')  {
                  departureTerminal = "Terminal " + scheduledFlights[0].departureTerminal;
                }


                let departureTime = scheduledFlights[0].departureTime.slice(11,16);
                let arrivalTime = scheduledFlights[0].arrivalTime.slice(11,16);

                let departureYear = scheduledFlights[0].departureTime.slice(0,4);
                let departureMonth = scheduledFlights[0].departureTime.slice(5,7);
                let departureDay = scheduledFlights[0].departureTime.slice(8,10);
                let departureDate = departureYear + "-" + departureMonth + "-" + departureDay + "T00:00:00.000Z";

                let arrivalYear = scheduledFlights[0].arrivalTime.slice(0,4);
                let arrivalMonth = scheduledFlights[0].arrivalTime.slice(5,7);
                let arrivalDay = scheduledFlights[0].arrivalTime.slice(8,10);
                let arrivalDate = arrivalYear + "-" + arrivalMonth + "-" + arrivalDay + "T00:00:00.000Z";



                let departureAirport;
                let departureCity;

                for (let i = 0; i < appendix.airports.length; i++) {
                  if (appendix.airports[i].fs === departureAirportCode) {
                    departureAirport = appendix.airports[i].name;
                    departureCity = appendix.airports[i].city;

                    let place = {
                      name: appendix.airports[i].name,
                      lat: appendix.airports[i].latitude,
                      lng: appendix.airports[i].longitude,
                    }
                    this.getLocation(place, "dep");
                  }
                }

                let arrivalAirport;
                let arrivalCity;

                for (let i = 0; i < appendix.airports.length; i++) {
                  if (appendix.airports[i].fs === arrivalAirportCode) {
                    arrivalAirport = appendix.airports[i].name;
                    arrivalCity = appendix.airports[i].city;

                    let place = {
                      name: appendix.airports[i].name,
                      lat: appendix.airports[i].latitude,
                      lng: appendix.airports[i].longitude,
                    }
                    this.getLocation(place, "arr");
                  }
                }

                this.addTransportForm.patchValue({
                  dep_city: departureCity,
                  dep_date: departureDate,
                  arr_city: arrivalCity,
                  arr_date: arrivalDate,
                })

                this.flightSearchDetail = {
                  transport_company: carrier,
                  carrierCode: carrierCode,
                  reference_number: flightNumber,
                  dep_station: departureAirport,
                  depAirportCode: departureAirportCode,
                  dep_city: departureCity,
                  dep_terminal: departureTerminal,
                  dep_date: departureDate,
                  dep_time: departureTime,
                  arr_station: arrivalAirport,
                  arrAirportCode: arrivalAirportCode,
                  arr_city: arrivalCity,
                  arr_date: arrivalDate,
                  arr_time: arrivalTime,
                  operating_carrier: operatingCarrier,
                  operating_flight: operatingCarrierCode + operatingFlightNumber
                };
                this.confirmPage = true;
              }//end of section where there is only 01 flight

              if (scheduledFlights.length > 1)  {
                this.selectStopOver = true;
                this.chooseAirport = true;

                //convert departureTime to timestamp to sort by time
                for (let i = 0; i < scheduledFlights.length; i++) {
                  scheduledFlights[i]['convertedDepartureTime'] = (new Date(scheduledFlights[i].departureTime)).getTime();
                }
                //sort the scheduledFlights array by time
                scheduledFlights.sort((a,b) =>  {
                  return a['convertedDepartureTime'] - b['convertedDepartureTime'];
                })

                this.flightSearchDetail = data;
                this.flightSearchDetail['transport_company'] = carrier;
                this.flightSearchDetail['carrierCode'] = carrierCode;
                this.flightSearchDetail['reference_number'] = flightNumber;
                this.flightSearchDetail['operating_carrier'] = operatingCarrier;
                this.flightSearchDetail['operating_flight'] = operatingCarrierCode + operatingFlightNumber;

                //create list of airports for user to choose
                let airportBySchedule = [];

                for (let i = 0; i < scheduledFlights.length; i++) {
                  airportBySchedule.push(scheduledFlights[i].departureAirportFsCode);
                }

                for (let i = 0; i < scheduledFlights.length; i++) {
                  let arrivalAirport = scheduledFlights[i].arrivalAirportFsCode;
                  if(airportBySchedule.indexOf(arrivalAirport) < 0) {
                    airportBySchedule.push(arrivalAirport);
                  }
                }

                this.depAirports = [];
                for (let i = 0; i < airportBySchedule.length - 1; i++) {
                  for (let j = 0; j < appendix.airports.length; j++) {
                    if (airportBySchedule[i] === appendix.airports[j].fs) {
                      this.depAirports.push({
                        city: appendix.airports[j].city,
                        airportName: appendix.airports[j].name,
                        airportCode: appendix.airports[j].fs
                      })
                    }
                  }
                }

                this.arrAirports = [];
                for (let i = 1; i < airportBySchedule.length; i++) {
                  for (let j = 0; j < appendix.airports.length; j++) {
                    if (airportBySchedule[i] === appendix.airports[j].fs) {
                      this.arrAirports.push({
                        city: appendix.airports[j].city,
                        airportName: appendix.airports[j].name,
                        airportCode: appendix.airports[j].fs
                      })
                    }
                  }
                }
              }//end of if more than 01 flight

            }
          }
        )//end of subscribe

    this.searchFlightForm.reset({
      'searchAirlineCode': '',
      'searchFlightNumber': '',
      'searchDepDate': '',
    })
  }//end of flight search

  // show flight details after selected airport
  getFlightDetails()  {
    this.selectStopOver = false;
    this.confirmPage = true;
  }

  selectedDepAirport(airportCode)  {
    let currentFlightSearch = this.flightSearchDetail;
    let scheduledFlights = currentFlightSearch['scheduledFlights'];
    let appendix = currentFlightSearch['appendix'];

    for (let i = 0; i < scheduledFlights.length; i++) {
      if(scheduledFlights[i]['departureAirportFsCode'] === airportCode) {
        currentFlightSearch['depAirportCode'] = scheduledFlights[i].departureAirportFsCode;

        if(scheduledFlights[i].departureTerminal !== '')  {
          currentFlightSearch['dep_terminal'] = "Terminal " + scheduledFlights[i].departureTerminal;
        }

        currentFlightSearch['dep_time'] = scheduledFlights[i].departureTime.slice(11,16);

        let departureYear = scheduledFlights[i].departureTime.slice(0,4);
        let departureMonth = scheduledFlights[i].departureTime.slice(5,7);
        let departureDay = scheduledFlights[i].departureTime.slice(8,10);
        currentFlightSearch['dep_date'] = departureYear + "-" + departureMonth + "-" + departureDay + "T00:00:00.000Z";
      }
    }

    for (let i = 0; i < appendix.airports.length; i++) {
      if (appendix.airports[i].fs === airportCode) {
        currentFlightSearch['dep_station'] = appendix.airports[i].name;
        currentFlightSearch['dep_city'] = appendix.airports[i].city;

        let place = {
          name: appendix.airports[i].name,
          lat: appendix.airports[i].latitude,
          lng: appendix.airports[i].longitude,
        }
        this.getLocation(place, "dep");
      }
    }

    this.addTransportForm.patchValue({
      dep_city: currentFlightSearch['dep_city'],
      dep_date: currentFlightSearch['dep_date'],
    })
  }

  selectedArrAirport(airportCode) {
    let currentFlightSearch = this.flightSearchDetail;
    let scheduledFlights = currentFlightSearch['scheduledFlights'];
    let appendix = currentFlightSearch['appendix'];

    for (let i = 0; i < scheduledFlights.length; i++) {
      if(scheduledFlights[i]['arrivalAirportFsCode'] === airportCode) {
        currentFlightSearch['arrAirportCode'] = scheduledFlights[i].arrivalAirportFsCode;
        currentFlightSearch['arr_time'] = scheduledFlights[i].arrivalTime.slice(11,16);

        let arrivalYear = scheduledFlights[i].arrivalTime.slice(0,4);
        let arrivalMonth = scheduledFlights[i].arrivalTime.slice(5,7);
        let arrivalDay = scheduledFlights[i].arrivalTime.slice(8,10);
        currentFlightSearch['arr_date'] = arrivalYear + "-" + arrivalMonth + "-" + arrivalDay + "T00:00:00.000Z";
      }
    }

    for (let i = 0; i < appendix.airports.length; i++) {
      if (appendix.airports[i].fs === airportCode) {
        currentFlightSearch['arr_station'] = appendix.airports[i].name;
        currentFlightSearch['arr_city'] = appendix.airports[i].city;

        let place = {
          name: appendix.airports[i].name,
          lat: appendix.airports[i].latitude,
          lng: appendix.airports[i].longitude,
        }
        this.getLocation(place, "arr");
      }
    }

    this.addTransportForm.patchValue({
      arr_city: currentFlightSearch['arr_city'],
      arr_date: currentFlightSearch['arr_date'],
    })
  }



  // add place as station location
  getLocation(place, type) {
    this.placeService.searchPlace(place).subscribe(
      result => {
        if(type === "dep")  {
          console.log(result['place'])
          this.depLocation = result['place'];

          if(result['place']['city']) {
            this.addTransportForm.patchValue({
              dep_city: result['place']['city']['name']
            })
          }
        }

        if(type === "arr")  {
          this.arrLocation = result['place'];

          if(result['place']['city']) {
            this.addTransportForm.patchValue({
              arr_city: result['place']['city']['name']
            })
          }
        }

        if(!result['place']['country']) {
          this.getLocationAddress(result['place'])
        }
      }
    )
  }

  getLocationAddress(place)  {
    let geocoder = new google.maps.Geocoder;
    let lat = place['lat'];
    let lng = place['lng'];

    geocoder.geocode({location: {lat:lat, lng:lng}}, (result, status) =>  {
      if(status === 'OK') {
        if(result[0]) {
          place['formatted_address'] = result[0]['formatted_address'];
          place['place_id'] = result[0]['place_id'];
          place['address'] = result[0]['address_components'];

          this.getCountry(place);
        }
      }
    })
  }

  getCountry(place)  {
    let address = place['address'];

    for (let i = 0; i < address.length; i++) {
      if(address[i]['types'][0] === 'country')  {
        let country = address[i]['long_name'];
        this.getCountryLatLng(country, place)
      }
    }
  }

  getCountryLatLng(country, place)  {
    let geocoder = new google.maps.Geocoder;

    geocoder.geocode({address: country}, (result, status) =>  {
      if(status === 'OK') {
        let lat = result[0]['geometry'].location.lat();
        let lng = result[0]['geometry'].location.lng();

        let rCountry = {
          name: country,
          lat: lat,
          lng: lng
        }

        this.checkCountry(rCountry, place);
      }
    })
  }

  checkCountry(country, place)  {
    let index = this.countriesName.indexOf(country['name'])

    if(index > -1)  {
      place['country'] = this.countries[index];
      this.savePlace(place);
    } else {
      this.countryService.addCountry(country).subscribe(
        result => {
          place['country'] = result.country;
          this.savePlace(place);
        })
    }
  }

  savePlace(place)  {
    this.placeService.editPlace(place).subscribe(
      result => {console.log(result)})
  }




  // google search
  searchingDepStation(event) {
    setTimeout(() =>  {
      if(!this.depStation)  {
        this.errorMessageService.handleErrorMessage({
          title: "Error while selecting departure station",
          error:  {
            message: "You have pressed the enter key without selecting a station/terminal from the dropdown. Please try again."
          }
        })
      }
    }, 1000)

  }

  setDepStation(data) {
    this.depStation = data['name'];

    let address_components = data['address_components'];

    for (let i = 0; i < address_components.length; i++) {
      if(address_components[i]['types'][0] === 'locality')  {
        data['city'] = address_components[i]['long_name'];
      } else if(address_components[i]['types'][0] === 'administrative_area_level_1') {
        data['city'] += ', ' + address_components[i]['long_name'];
      }
    }

    this.addTransportForm.patchValue({
      dep_station: this.depStation,
      dep_city: data['city'],
    })

    let place = {
      name: data['name'],
      lat: data['geometry'].location.lat(),
      lng: data['geometry'].location.lng(),
    }
    this.getLocation(place, "dep");
  }

  searchingArrStation(event) {
    setTimeout(() =>  {
      if(!this.arrStation)  {
        this.errorMessageService.handleErrorMessage({
          title: "Error while selecting arrival station",
          error:  {
            message: "You have pressed the enter key without selecting a station/terminal from the dropdown. Please try again."
          }
        })
      }
    }, 1000)
  }

  setArrStation(data) {
    this.arrStation = data['name'];

    let address_components = data['address_components'];

    for (let i = 0; i < address_components.length; i++) {
      if(address_components[i]['types'][0] === 'locality')  {
        data['city'] = address_components[i]['long_name'];
      } else if(address_components[i]['types'][0] === 'administrative_area_level_1') {
        data['city'] += ', ' + address_components[i]['long_name'];
      }
    }

    this.addTransportForm.patchValue({
      arr_station: this.arrStation,
      arr_city: data['city']
    })

    let place = {
      name: data['name'],
      lat: data['geometry'].location.lat(),
      lng: data['geometry'].location.lng(),
    }
    this.getLocation(place, "arr");
  }



  // select departure time
  selectPickerDep()  {
    this.timePickerDep = true;
  }

  selectHourDep(h) {
    this.hourDep = h;
  }

  selectMinuteDep(m) {
    this.minuteDep = m;
  }

  // select arrival time
  selectPickerArr()  {
    this.timePickerArr = true;
  }

  selectHourArr(h) {
    this.hourArr = h;
  }

  selectMinuteArr(m) {
    this.minuteArr = m;
  }


  saveNew()  {
    let newTransport = this.addTransportForm.value;

    if(this.flightSearchDetail)  {
      for (var value in newTransport) {
        if(newTransport[value] === '' && this.flightSearchDetail[value]) {
          newTransport[value] = this.flightSearchDetail[value];
        }
      }

      newTransport['reference_number'] = this.flightSearchDetail['carrierCode'] + this.flightSearchDetail['reference_number'];
    }

    if(this.transportOption !== 'flight')  {
      if(this.hourDep === 'anytime')  {
        newTransport['dep_time'] = 'anytime';
      } else  {
        newTransport['dep_time'] = this.hourDep + ':' + this.minuteDep;
      }

      if(this.hourArr === 'anytime')  {
        newTransport['arr_time'] = 'anytime';
      } else  {
        newTransport['arr_time'] = this.hourArr + ':' + this.minuteArr;
      }
    }

    let date;
    if(newTransport['dep_date'] !== "any day")  {
      date = new Date(newTransport['dep_date']).toISOString();
    } else  {
      date = newTransport['dep_date'];
    }

    newTransport['dep_station_location'] = this.depLocation;
    newTransport['arr_station_location'] = this.arrLocation;
    newTransport['date'] = date;
    newTransport['time'] = newTransport['dep_time'];
    newTransport['type'] = 'transport';
    newTransport['transport_type'] = this.transportOption;
    newTransport['user'] =  {
      _id: this.currentUser['_id'],
      username: this.currentUser['username'],
    }
    newTransport['created_at'] = new Date();

    this.itineraryEventService.addEvent(newTransport, this.itinerary).subscribe(
      result => {
        if(this.route.snapshot['_urlSegment'].segments[3].path !== 'summary' &&
           this.route.snapshot['_urlSegment'].segments[3].path !== 'transport') {
          let id = this.route.snapshot['_urlSegment'].segments[2].path;
          this.router.navigateByUrl('/me/itinerary/' + id + '/transport');
        }
        this.flashMessageService.handleFlashMessage(result.message);
      })

    this.hideTransportForm.emit(false)
  }

  cancelForm()  {
    this.hideTransportForm.emit(false)
  }
}
