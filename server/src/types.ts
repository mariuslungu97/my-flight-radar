import { ValidationError } from "express-validator";

/**
 * OpenSkyNetworkApi Service
 */

export interface IFlightState {
  [0]: string; // icao24
  [1]: string | null; // callsign
  [2]: string; // origin country
  [3]: number | null; // time position
  [4]: number; // last contact
  [5]: number | null; // longitude
  [6]: number | null; // latitude
  [7]: number | null; // baro altitude
  [8]: boolean; // on ground
  [9]: number | null; // velocity
  [10]: number | null; // true track
  [11]: number | null; // vertical rate
  [12]: number[]; // sensors
  [13]: number | null; // geo altitude
  [14]: string | null; // squawk
  [15]: boolean; // spi
  [16]: number; // position source
  [17]: number; // category
}

export interface ITrajectoryPath {
  [0]: number; // time
  [1]: number; // latitude
  [2]: number; // longitude
  [3]: number; // baro altitude
  [4]: number; // true track
  [5]: boolean; // on ground
}

export interface ITrajectoryState {
  icao24: string;
  callsign: string;
  startTime: number;
  endTime: number;
  path: ITrajectoryPath[];
}

export interface IAirportState {
  icao: string;
  iata: string;
  name: string;
  city: string | null;
  type: string | null;
  position: {
    longitude: number;
    latitude: number;
    altitude: number;
    reasonable: boolean;
  };
}

export interface IAirportExtendedState extends IAirportState {
  continent: string;
  country: string;
  region: string;
  municipality: string;
  gpsCode: string;
  homepage: string;
  wikipedia: string;
}

export interface IAirportPastFlight {
  icao24: string;
  firstSeen: number;
  lastSeen: number;
  estDepartureAirport: string;
  estArrivalAirport: string;
  callsign: string;
  estDepartureAirportHorizDistance: number;
  estDepartureAirportVertDistance: number;
  estArrivalAirportHorizDistance: number;
  estArrivalAirportVertDistance: number;
  departureAirportCandidatesCount: number;
  arrivalAirportCandidatesCount: number;
}

export interface IRouteState {
  callsign: string;
  route: [string, string];
  updateTime: number;
  operatorIata: string;
  flightNumber: number;
}

export type TBounds = [[string, string], [string, string]];

export interface IOpenSkyNetworkApi {
  getFlights(bounds: TBounds): Promise<IFlightState[]>;
  getFlight(icao24: string): Promise<IFlightState | null>;
  getAirports(bounds: TBounds): Promise<IAirportState[]>;
  getAirport(icao: string): Promise<IAirportExtendedState | null>;
  getTrajectory(icao24: string): Promise<ITrajectoryState | null>;
  getRoute(callsign: string): Promise<IRouteState | null>;
  getArrivals(
    icao: string,
    begin: number,
    end: number
  ): Promise<IAirportPastFlight[]>;
  getDepartures(
    icao: string,
    begin: number,
    end: number
  ): Promise<IAirportPastFlight[]>;
}

/**
 * Api
 */

export interface IBoundsQueryParams {
  latitudeMin: string;
  latitudeMax: string;
  longitudeMin: string;
  longitudeMax: string;
}

export interface IApiResponse<TData> {
  error: ValidationError[] | null;
  data: TData | null;
}

/**
 * Api - Flight(s)
 */

export type Altitude = {
  barometric: number | null;
  geometric: number | null;
};

export type Coordinates = {
  latitude: number | null;
  longitude: number | null;
};

export type TrajectoryPath = {
  time: number;
  coordinates: Coordinates;
  altitude: Altitude | null;
  direction: number | null;
  grounded: boolean | null;
};

type Trajectory = {
  startTime: number;
  endTime: number;
  paths: TrajectoryPath[];
};

type Route = {
  departure: string;
  arrival: string;
};

export interface Flight {
  id: string; // icao24
  callsign: string | null;
  originCountry: string;
  timePosition: number | null;
  lastContact: number;
  coordinates: Coordinates | null;
  altitude: Altitude | null;
  grounded: boolean;
  velocity: number | null;
  direction: number | null;
  verticalRate: number | null;
  squawk: string | null;
  spi: boolean;
  sensors: number[];
  positionSource: number;
  trajectory: Trajectory | null;
  route: Route | null;
}

export interface FlightsQuery extends IBoundsQueryParams {
  predict: boolean;
}

export interface FlightQuery {
  predict: boolean;
}

export interface FlightParams {
  icao24: string;
}

/**
 * Api - Airport(s)
 */

type AirportCoordinates = {
  latitude: number;
  longitude: number;
};

export type AirportPastFlight = {
  icao24: string;
  callsign: string;
  estDepartureAirport: string;
  estArrivalAirport: string;
  firstSeen: number;
  lastSeen: number;
};

type AirportPastFlights = {
  begin: number;
  end: number;
  flights: AirportPastFlight[];
};

export interface Airport {
  icao: string;
  iata: string;
  name: string;
  type: string | null;
  coordinates: AirportCoordinates | null;
  city: string | null;
  country: string | null;
  wikipedia: string | null;
  recentDepartures: AirportPastFlights | null;
  recentArrivals: AirportPastFlights | null;
}

export interface SuccintAirport {
  icao: string;
  iata: string;
  name: string;
  type: string | null;
  coordinates: AirportCoordinates;
}

export interface AirportParams {
  icao: string;
}
