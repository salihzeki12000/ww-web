export class Itinerary {
  constructor(
    name: string,
    date_from: string,
    date_to: string,
    members: [{
      username: string,
      _id: number
    }],
    admin: [{
      username: string,
      _id: number
    }],
    created_by: {
      username: string,
      _id: number
    }
  ) {}
}
