import { Request, Response } from "express";
import { validationResult } from "express-validator";
import destination from "@turf/destination";

import {
  IFlightState,
  IOpenSkyNetworkApi,
  ITrajectoryPath,
  IApiResponse,
  TBounds,
  Flight,
  Coordinates,
  FlightsQuery,
  FlightQuery,
  FlightParams,
  Altitude,
  TrajectoryPath,
} from "../../types";

export default class FlightController {
  private readonly openSkyApi: IOpenSkyNetworkApi;

  constructor(api: IOpenSkyNetworkApi) {
    this.openSkyApi = api;
  }

  private flightStateToObject(flight: IFlightState): Flight {
    const {
      "0": id,
      "1": callsign,
      "2": originCountry,
      "3": timePosition,
      "4": lastContact,
      "5": longitude,
      "6": latitude,
      "7": baroAltitude,
      "8": grounded,
      "9": velocity,
      "10": direction,
      "11": verticalRate,
      "12": sensors,
      "13": geoAltitude,
      "14": squawk,
      "15": spi,
      "16": positionSource,
    } = flight;

    const coordinates =
      longitude || latitude ? ({ longitude, latitude } as Coordinates) : null;
    const altitude =
      geoAltitude || baroAltitude
        ? ({ geometric: geoAltitude, barometric: baroAltitude } as Altitude)
        : null;

    return {
      id,
      callsign,
      originCountry,
      timePosition,
      lastContact,
      grounded,
      velocity,
      direction,
      verticalRate,
      squawk,
      spi,
      sensors,
      positionSource,
      coordinates,
      altitude,
      trajectory: null,
      route: null,
    };
  }

  private trajectoryStateToObject(trajectory: ITrajectoryPath): TrajectoryPath {
    const {
      "0": time,
      "1": latitude,
      "2": longitude,
      "3": baroAltitude,
      "4": direction,
      "5": grounded,
    } = trajectory;

    return {
      time,
      grounded,
      direction,
      coordinates: { latitude, longitude },
      ...(baroAltitude
        ? { altitude: { barometric: baroAltitude, geometric: null } }
        : { altitude: null }),
    };
  }

  private async processFlightStates(
    flightStates: IFlightState[],
    processTrajectory = false,
    processRoute = false
  ): Promise<Flight[]> {
    const flights = [];

    for (const flightState of flightStates) {
      let flight = this.flightStateToObject(flightState);

      if (processTrajectory) {
        const trajectory = await this.openSkyApi.getTrajectory(flight.id);
        flight = {
          ...flight,
          ...(trajectory &&
            trajectory.path && {
              trajectory: {
                startTime: trajectory.startTime,
                endTime: trajectory.endTime,
                paths: trajectory.path.map(this.trajectoryStateToObject),
              },
            }),
        };
      }

      if (processRoute && flight.callsign) {
        const route = await this.openSkyApi.getRoute(flight.callsign);
        flight = {
          ...flight,
          ...(route && {
            route: { departure: route.route[0], arrival: route.route[1] },
          }),
        };
      }

      flights.push(flight);
    }

    return flights;
  }

  private predictNextFlightCoordinates(flight: Flight): Flight {
    const { timePosition, velocity, direction } = flight;
    if (!timePosition || !velocity || !direction) return flight;
    else if (
      !flight.coordinates ||
      !flight.coordinates.longitude ||
      !flight.coordinates.latitude
    )
      return flight;

    const { longitude, latitude } = flight.coordinates;
    const now = Math.floor(Date.now() / 1000);

    if (now <= timePosition) return flight;
    const nextPosition = destination(
      [longitude, latitude],
      velocity * (now - timePosition),
      direction,
      {
        units: "meters",
      }
    );

    return {
      ...flight,
      coordinates: {
        longitude: nextPosition.geometry.coordinates[0],
        latitude: nextPosition.geometry.coordinates[1],
      },
    };
  }

  public async flights(
    req: Request<any, IApiResponse<Flight[]>, any, FlightsQuery>,
    res: Response<IApiResponse<Flight[]>>
  ) {
    const validationRes = validationResult(req);
    if (!validationRes.isEmpty())
      return res.json({ error: validationRes.array(), data: [] });

    const { latitudeMax, latitudeMin, longitudeMax, longitudeMin, predict } =
      req.query;
    const bounds: TBounds = [
      [latitudeMin, longitudeMin],
      [latitudeMax, longitudeMax],
    ];

    const flightsStates = await this.openSkyApi.getFlights(bounds);
    const flights = await this.processFlightStates(flightsStates);
    const notGroundedFlights = flights.filter((flight) => !flight.grounded);
    const flightsInFuture = notGroundedFlights.map(
      this.predictNextFlightCoordinates
    );

    res.json({
      error: null,
      data: predict ? flightsInFuture : notGroundedFlights,
    });
  }

  public async flight(
    req: Request<FlightParams, IApiResponse<Flight>, any, FlightQuery>,
    res: Response<IApiResponse<Flight>>
  ) {
    const validationRes = validationResult(req);
    if (!validationRes.isEmpty())
      return res.json({ error: validationRes.array(), data: null });

    const { predict } = req.query;
    const { icao24 } = req.params;
    const flightState = await this.openSkyApi.getFlight(icao24);
    if (!flightState) return res.json({ error: null, data: null });
    const flight = (
      await this.processFlightStates([flightState], true, true)
    )[0];
    const flightInFuture = this.predictNextFlightCoordinates(flight);

    res.json({ error: null, data: predict ? flightInFuture : flight });
  }
}
