import { GeoJsonProperties } from "geojson";
import { LngLat, LngLatBounds } from "maplibre-gl";

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type Route = {
  departure: string;
  arrival: string;
};

/**
 * Flight(s)
 */

type Altitude = {
  barometric: number | null;
  geometric: number | null;
};

type TrajectoryPath = {
  time: number;
  coordinates: Partial<Coordinates>;
  altitude: Altitude | null;
  direction: number | null;
  grounded: boolean | null;
};

type Trajectory = {
  startTime: number;
  endTime: number;
  paths: TrajectoryPath[];
};

export interface IFlight {
  id: string;
  callsign: string | null;
  originCountry: string;
  timePosition: number | null;
  lastContact: number;
  coordinates: Partial<Coordinates> | null;
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

export interface IFlightGeoJsonProperties {
  type: string;
  id: string;
  direction: number;
}

export interface IFlightWithArrival {
  id: string;
  coordinates: Coordinates;
  route: {
    departure: string;
    arrival: IExtendedAirport;
  };
}

export type TFlightsApiResponse = {
  error: any;
  data: IFlight[];
};

export type TFlightApiResponse = {
  error: any;
  data: IFlight;
};

/**
 * Airport(s)
 */

export interface IAirport {
  icao: string;
  iata: string;
  name: string;
  type: string | null;
  coordinates: Coordinates;
}

export interface IExtendedAirport extends IAirport {
  continent: string;
  country: string;
  region: string;
  municipality: string;
  gpsCode: string;
  homepage: string;
  wikipedia: string;
}

export interface IAirportGeoJsonProperties {
  id: string;
  source: string;
}

export type TAirportsApiResponse = {
  error: any;
  data: IAirport[];
};

export type TAirportApiResponse = {
  error: any;
  data: IExtendedAirport;
};

/**
 * Globals
 */

export interface IViewState {
  center: LngLat;
  zoom: number;
  bounds: LngLatBounds;
}

export type TBounds = [[number, number], [number, number]];
export type TAirportsLayerIcon = "pulsing-dot" | "regular-dot";
export type TAirportsLayerSize = "small" | "medium" | "large";
