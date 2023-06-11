import { Request, Response } from "express";
import { validationResult } from "express-validator";

import {
  IBoundsQueryParams,
  IOpenSkyNetworkApi,
  IApiResponse,
  TBounds,
  SuccintAirport,
  Airport,
  AirportParams,
  AirportPastFlight,
} from "../../types";

export default class AirportController {
  private readonly openSkyApi: IOpenSkyNetworkApi;

  constructor(api: IOpenSkyNetworkApi) {
    this.openSkyApi = api;
  }

  public async airports(
    req: Request<any, IApiResponse<SuccintAirport[]>, any, IBoundsQueryParams>,
    res: Response<IApiResponse<SuccintAirport[]>>
  ) {
    const validationRes = validationResult(req);
    if (!validationRes.isEmpty())
      return res.json({ error: validationRes.array(), data: [] });

    const { latitudeMin, latitudeMax, longitudeMin, longitudeMax } = req.query;
    const bounds: TBounds = [
      [latitudeMin, longitudeMin],
      [latitudeMax, longitudeMax],
    ];
    const airports = await this.openSkyApi.getAirports(bounds);
    const succintAirports: SuccintAirport[] = airports.map((airport) => ({
      iata: airport.iata,
      icao: airport.icao,
      name: airport.name,
      type: airport.type,
      coordinates: {
        latitude: airport.position.latitude,
        longitude: airport.position.longitude,
      },
    }));

    res.json({ error: null, data: succintAirports });
  }

  public async airport(
    req: Request<AirportParams, IApiResponse<Airport>>,
    res: Response<IApiResponse<Airport>>
  ) {
    const validationRes = validationResult(req);
    if (!validationRes.isEmpty())
      return res.json({ error: validationRes.array(), data: null });

    const { icao } = req.params;
    const airport = await this.openSkyApi.getAirport(icao);
    if (!airport) return res.json({ error: null, data: null });

    // grab recent departures from airport (past 24 hours)
    // let recentDeparturesBeginDate = new Date();
    // recentDeparturesBeginDate.setDate(recentDeparturesBeginDate.getDate() - 1);
    // const recentDeparturesEndDate = new Date();
    // const departures = await this.openSkyApi.getDepartures(
    //   icao,
    //   Math.round(recentDeparturesBeginDate.getTime() / 1000),
    //   Math.round(recentDeparturesEndDate.getTime() / 1000)
    // );
    // const recentDepartures = departures.map<AirportPastFlight>((departure) => ({
    //   icao24: departure.icao24,
    //   callsign: departure.callsign,
    //   firstSeen: departure.firstSeen,
    //   lastSeen: departure.lastSeen,
    //   estArrivalAirport: departure.estArrivalAirport,
    //   estDepartureAirport: departure.estDepartureAirport,
    // }));

    // grab recent arrivals to airport (past 3 days)
    // let recentArrivalsBeginDate = new Date();
    // recentArrivalsBeginDate.setDate(recentArrivalsBeginDate.getDate() - 1);
    // const recentArrivalsEndDate = new Date();
    // const arrivals = await this.openSkyApi.getArrivals(
    //   icao,
    //   Math.round(recentArrivalsBeginDate.getTime() / 1000),
    //   Math.round(recentArrivalsEndDate.getTime() / 1000)
    // );
    // const recentArrivals = arrivals.map<AirportPastFlight>((arrival) => ({
    //   icao24: arrival.icao24,
    //   callsign: arrival.callsign,
    //   firstSeen: arrival.firstSeen,
    //   lastSeen: arrival.lastSeen,
    //   estArrivalAirport: arrival.estArrivalAirport,
    //   estDepartureAirport: arrival.estDepartureAirport,
    // }));

    const completeAirport: Airport = {
      icao: airport.icao,
      iata: airport.iata,
      name: airport.name,
      city: airport.city,
      country: airport.country,
      type: airport.type,
      wikipedia: airport.wikipedia,
      coordinates: {
        latitude: airport.position.latitude,
        longitude: airport.position.longitude,
      },
      recentDepartures: null,
      recentArrivals: null,
    };

    res.json({ error: null, data: completeAirport });
  }
}
