export class Itinerary {
  constructor(
    name: string,
    date_from: string,
    date_to: string,
    members: [{
      username: string,
      userId: number
    }],
    admin: [{
      username: string,
      userId: number
    }],
    created_by: {
      username: string,
      userId: number
    }
  ) {}
}
