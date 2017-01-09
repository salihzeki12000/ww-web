export class Itinerary {
  constructor(
    name: string,
    dateFrom: string,
    dateTo: string,
    members: [{
      username: string,
      userId: number }],
    accommodations: [{
      name: string,
      formatted_address: string,
      website: string,
      international_phone_number: string,
      checkInDate: string,
      checkOutDate: string,
      note: string,
      user: {
        _Id: number,
        username: string
      },
      editing: boolean}],
    transports: [{
      transportType: string,
      referenceNumber: string,
      stationFrom: string,
      stationTo: string,
      cityFrom: string,
      cityTo: string,
      depterminal: string,
      arrterminal: string,
      depDate: string,
      depTime: string,
      arrDate: string,
      arrTime: string,
      rentalCompany: string,
      contactNumber: string,
      note: string,
      user: {
        _Id: number,
        username: string
      },
      editing: boolean}],
    activities: [string]
  ) {}
}
