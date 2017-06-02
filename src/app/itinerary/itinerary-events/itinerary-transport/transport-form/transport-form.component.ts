import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs/Rx';

import { Itinerary }             from '../../../itinerary';
import { ItineraryService }      from '../../../itinerary.service';
import { ItineraryEvent }        from '../../itinerary-event';
import { ItineraryEventService } from '../../itinerary-event.service';

import { UserService }         from '../../../../user';
import { FlashMessageService } from '../../../../flash-message';

@Component({
  selector: 'ww-transport-form',
  templateUrl: './transport-form.component.html',
  styleUrls: ['./transport-form.component.scss']
})
export class TransportFormComponent implements OnInit, OnDestroy {
  @Output() hideTransportForm = new EventEmitter();

  addTransportForm: FormGroup;
  transportType = [
    { name:'flight', icon: 'plane' },
    { name:'train', icon: 'train' },
    { name:'bus', icon: 'bus' },
    { name:'cruise', icon: 'ship'},
    { name:'vehicle rental', icon: 'car'},
    { name:'others', icon: 'rocket'} ];
  transportOption = '';

  // to influence progress bar
  populateFlightDetails = false;
  chooseAirport = false;// for flights with multiple legs
  airportsChoosen = false;

  searchFlightForm: FormGroup;

  fetchFlightDetails = false;
  flightNotFound = false;

  flightSearchDetail;
  codeshare = false;
  selectStopOver = false;
  depAirports = [];
  arrAirports = [];

  itinDateSubscription: Subscription;
  itinDateRange = [];
  firstDay;

  currentUserSubscription: Subscription;
  currentUser;

  currentItinerarySubscription: Subscription;
  currentItinerary;

  constructor(
    private itineraryService: ItineraryService,
    private itineraryEventService: ItineraryEventService,
    private userService: UserService,
    private flashMessageService: FlashMessageService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder) {
      this.addTransportForm = this.formBuilder.group({
        'transport_type': '',
        'reference_number': '',
        'dep_terminal': '',
        'arr_terminal': '',
        'dep_station': '',
        'arr_station': '',
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

    this.currentItinerarySubscription = this.itineraryService.currentItinerary.subscribe(
                                             result => { this.currentItinerary = result; })

    this.itinDateSubscription = this.itineraryService.updateDate.subscribe(
                                      result => {
                                        this.itinDateRange  = Object.keys(result).map(key => result[key]);
                                        this.itinDateRange.splice(0,1);
                                        this.firstDay = this.itinDateRange[0];
                                    })
  }

  ngOnDestroy() {
    this.currentItinerarySubscription.unsubscribe();
    this.itinDateSubscription.unsubscribe();
    this.currentUserSubscription.unsubscribe();
  }
  // progress bar
  selectTransport() {
    this.transportOption = '';
    this.codeshare = false;
    this.selectStopOver = false;
    this.chooseAirport = false;
    this.airportsChoosen = false;
    this.populateFlightDetails = false;
  }

  flightSearch()  {
    this.codeshare = false;
    this.selectStopOver = false;
    this.chooseAirport = false;
    this.airportsChoosen = false;
    this.populateFlightDetails = false;
  }

  selectAirport() {
    this.selectStopOver = true;
    this.airportsChoosen = false;
  }

  // skipSearch()  {
  //   this.selectDone = true;
  // }

  selectTransportType(transport)  {
    this.transportOption = transport;
    this.addTransportForm.patchValue({
      dep_date: this.firstDay,
      arr_date: this.firstDay,
    })
  }

  // get flight details from flightstats.com
  searchFlightDetails()  {
    this.fetchFlightDetails = true;

    let airlineCode = (this.searchFlightForm.value.searchAirlineCode).toUpperCase();
    let flightNumber = this.searchFlightForm.value.searchFlightNumber;

    let dep_date = new Date(this.searchFlightForm.value.searchDepDate);
    let year = dep_date.getFullYear();
    let month = dep_date.getMonth() + 1;
    let day = dep_date.getDate();

    let criteria = 'flight/' + airlineCode + '/' + flightNumber + '/departing/' + year + '/' + month + '/' + day;

    this.itineraryEventService.getFlightDetails(criteria)
        .subscribe(
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
                let departureCountry;
                let departureStationLocation;

                for (let i = 0; i < appendix.airports.length; i++) {
                  if (appendix.airports[i].fs === departureAirportCode) {
                    departureAirport = appendix.airports[i].name;
                    departureCity = appendix.airports[i].city;
                    departureCountry = appendix.airports[i].countryName;
                    departureStationLocation = {
                      lat: appendix.airports[i].latitude,
                      lng: appendix.airports[i].longitude,
                    }
                  }
                }

                let arrivalAirport;
                let arrivalCity;
                let arrivalCountry;
                let arrivalStationLocation;

                for (let i = 0; i < appendix.airports.length; i++) {
                  if (appendix.airports[i].fs === arrivalAirportCode) {
                    arrivalAirport = appendix.airports[i].name;
                    arrivalCity = appendix.airports[i].city;
                    arrivalCountry = appendix.airports[i].countryName;
                    arrivalStationLocation = {
                      lat: appendix.airports[i].latitude,
                      lng: appendix.airports[i].longitude,
                    }
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
                  depCountry: departureCountry,
                  dep_terminal: departureTerminal,
                  dep_date: departureDate,
                  dep_time: departureTime,
                  dep_station_location: departureStationLocation,
                  arr_station: arrivalAirport,
                  arrAirportCode: arrivalAirportCode,
                  arr_city: arrivalCity,
                  arrCountry: arrivalCountry,
                  arr_date: arrivalDate,
                  arr_time: arrivalTime,
                  arr_station_location: arrivalStationLocation,
                  operating_carrier: operatingCarrier,
                  operating_flight: operatingCarrierCode + operatingFlightNumber
                };
                this.populateFlightDetails = true;
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

                this.populateFlightDetails = true;
              }//end of if more than 01 flight

            }
          }
        )//end of subscribe

    this.fetchFlightDetails = false;

    this.searchFlightForm.reset({
      'searchAirlineCode': '',
      'searchFlightNumber': '',
      'searchDepDate': '',
    })
  }//end of flight search


  exitError() {
    this.flightNotFound = false;
  }

  // show flight details after selected airport
  getFlightDetails()  {
    this.airportsChoosen = true;
    this.selectStopOver = false;
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
        currentFlightSearch['depCountry'] = appendix.airports[i].countryName;
        currentFlightSearch['dep_station_location'] = {
          lat: appendix.airports[i].latitude,
          lng: appendix.airports[i].longitude,
        }
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
        currentFlightSearch['arrCountry'] = appendix.airports[i].countryName;
        currentFlightSearch['arr_station_location'] = {
          lat: appendix.airports[i].latitude,
          lng: appendix.airports[i].longitude,
        }
      }
    }

    this.addTransportForm.patchValue({
      arr_city: currentFlightSearch['arr_city'],
      arr_date: currentFlightSearch['arr_date'],
    })
  }

  saveNew()  {
    let newTransport = this.addTransportForm.value;

    if(this.flightSearchDetail)  {
      for (var value in newTransport) {
        if(newTransport[value] === '' && this.flightSearchDetail[value]) {
          newTransport[value] = this.flightSearchDetail[value];
        }
      }
      newTransport['dep_station_location'] = this.flightSearchDetail['dep_station_location'];
      newTransport['arr_station_location'] = this.flightSearchDetail['arr_station_location'];
      newTransport['reference_number'] = this.flightSearchDetail['carrierCode'] + this.flightSearchDetail['reference_number'];
    }

    if(newTransport['dep_time'] === '')  {
      newTransport['dep_time'] = 'anytime';
    }

    if(newTransport['arr_time'] === '')  {
      newTransport['arr_time'] = 'anytime';
    }

    let depYear = newTransport['dep_date'].slice(1,5);
    let depMonth = newTransport['dep_date'].slice(6,8);
    let depDay = newTransport['dep_date'].slice(9,11);
    let time = 'T00:00:00.000Z';

    // let date = new Date(depYear + "-" + depMonth + "-" + depDay + "T00:00:00.000Z").toISOString();
    let date = new Date(newTransport['dep_date']).toISOString();

    newTransport['date'] = date;
    newTransport['time'] = newTransport['dep_time'];
    newTransport['type'] = 'transport';
    newTransport['transport_type'] = this.transportOption;
    newTransport['user'] =  {
      _Id: this.currentUser['id'],
      username: this.currentUser['username'],
    }
    newTransport['created_at'] = new Date();

    this.itineraryEventService.addEvent(newTransport, this.currentItinerary)
        .subscribe(
          result => {
            if(this.route.snapshot['_urlSegment'].segments[3].path !== 'transport') {
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
