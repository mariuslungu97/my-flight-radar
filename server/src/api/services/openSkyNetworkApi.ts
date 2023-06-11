import axios, { AxiosError } from "axios";

import {
  IFlightState,
  IOpenSkyNetworkApi,
  IAirportState,
  IAirportExtendedState,
  TBounds,
  IRouteState,
  ITrajectoryState,
  ITrajectoryPath,
  IAirportPastFlight,
} from "../../types";
// https://openskynetwork.github.io/opensky-api/rest.html

interface IGetFlightsApiResponse {
  time: string;
  states: any[][];
}

interface IGetTrajectoryApiResponse extends ITrajectoryState {
  path: any[];
}

const checkNested = (obj: object, field: string) => {
  if (!field) return true;

  // nested fields are separated by .
  // e.g: test1.test2.test3
  const fields = field.split(".");

  for (let i = 0; i < fields.length; i++) {
    if (!obj || !obj.hasOwnProperty(fields[i])) return false;

    obj = obj[fields[i] as keyof typeof obj];
  }

  return true;
};

class OpenSkyNetworkApi implements IOpenSkyNetworkApi {
  private static readonly baseURL = "https://opensky-network.org/api";
  private static readonly username = process.env.OPENSKY_USERNAME;
  private static readonly password = process.env.OPENSKY_PASSWORD;
  private readonly axiosInstance = this.prepareAxiosInstance();

  private prepareAxiosInstance() {
    const headers =
      OpenSkyNetworkApi.username && OpenSkyNetworkApi.password
        ? {
            Authorization: `Basic ${Buffer.from(
              `${OpenSkyNetworkApi.username}:${OpenSkyNetworkApi.password}`,
              "base64"
            )}`,
          }
        : {};

    const instance = axios.create({
      headers,
      baseURL: OpenSkyNetworkApi.baseURL,
    });

    return instance;
  }

  private handleApiErrors(error: AxiosError) {
    const { cause, code, request, response } = error;
    if (cause) console.log(`CAUSE: ${cause}`);
    if (code) console.log(`CODE ${code}`);

    if (response) {
      console.log(
        `Error after response was received!\nRESPONSE: ${JSON.stringify({
          status: response.status,
          headers: response.headers,
          data: response.data || [],
        })}`
      );
    } else if (request) {
      console.log(
        `Response was not received!\nREQUEST: ${JSON.stringify({
          status: request.status,
          headers: request.headers,
        })}`
      );
    } else {
      console.log(
        `Error before request was made!\nERROR: ${JSON.stringify(
          error.toJSON()
        )}`
      );
    }
  }

  public async getFlights(bounds: TBounds): Promise<IFlightState[]> {
    const [[lamin, lomin], [lamax, lomax]] = bounds;

    try {
      const response = await this.axiosInstance.get<IGetFlightsApiResponse>(
        `/states/all?lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}`
      );
      if (!checkNested(response, "data.states")) return [];

      const data = response.data.states.map(
        (fState) => fState as unknown as IFlightState
      );
      return data;
    } catch (error) {
      if (error instanceof AxiosError) this.handleApiErrors(error);
      else console.log(`[getFlights] Unknown error: ${error}!`);
      return [];
    }
  }

  public async getFlight(
    icao24: string,
    time?: number
  ): Promise<IFlightState | null> {
    try {
      let path = `/states/all?icao24=${icao24}`;
      if (time) path += `&time=${time}`;

      const response = await this.axiosInstance.get<IGetFlightsApiResponse>(
        path
      );
      if (
        !checkNested(response, "data.states") ||
        response.data.states.length === 0
      )
        return null;
      const flight = response.data.states[0] as unknown as IFlightState;

      return flight;
    } catch (error) {
      if (error instanceof AxiosError) this.handleApiErrors(error);
      else console.log(`[getFlights] Unknown error: ${error}!`);
      return null;
    }
  }

  public async getAirports(bounds: TBounds): Promise<IAirportState[]> {
    try {
      const [[lamin, lomin], [lamax, lomax]] = bounds;
      const response = await this.axiosInstance.get<IAirportState[]>(
        `/airports/region?lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}`
      );

      const airports = response.data;
      return airports;
    } catch (error) {
      if (error instanceof AxiosError) this.handleApiErrors(error);
      else console.log(`[getFlights] Unknown error: ${error}!`);
      return [];
    }
  }

  public async getAirport(icao: string): Promise<IAirportExtendedState | null> {
    try {
      const response = await this.axiosInstance.get<IAirportExtendedState>(
        `/airports?icao=${icao}`
      );

      const airport = response.data;
      return airport;
    } catch (error) {
      if (error instanceof AxiosError) this.handleApiErrors(error);
      else console.log(`[getFlights] Unknown error: ${error}!`);
      return null;
    }
  }

  public async getRoute(callsign: string): Promise<IRouteState | null> {
    try {
      const response = await this.axiosInstance.get<IRouteState>(
        `/routes?callsign=${callsign}`
      );

      const route = response.data;
      return route;
    } catch (error) {
      if (error instanceof AxiosError) this.handleApiErrors(error);
      else console.log(`[getFlights] Unknown error: ${error}!`);
      return null;
    }
  }

  public async getTrajectory(icao24: string): Promise<ITrajectoryState | null> {
    try {
      const response = await this.axiosInstance.get<IGetTrajectoryApiResponse>(
        `/tracks/all?icao24=${icao24}&time=0`
      );

      const trajectory: ITrajectoryState = {
        ...response.data,
        path: response.data.path
          ? response.data.path.map((p) => p as unknown as ITrajectoryPath)
          : [],
      };
      return trajectory;
    } catch (error) {
      if (error instanceof AxiosError) this.handleApiErrors(error);
      else console.log(`[getFlights] Unknown error: ${error}!`);
      return null;
    }
  }

  public async getArrivals(
    icao: string,
    begin: number,
    end: number
  ): Promise<IAirportPastFlight[]> {
    try {
      const path = `/flights/arrival?airport=${icao}&begin=${begin}&end=${end}`;

      const response = await this.axiosInstance.get<IAirportPastFlight[]>(path);

      const arrivals = response.data;
      return arrivals;
    } catch (error) {
      if (error instanceof AxiosError) this.handleApiErrors(error);
      else console.log(`[getFlights] Unknown error: ${error}!`);
      return [];
    }
  }

  public async getDepartures(
    icao: string,
    begin: number,
    end: number
  ): Promise<IAirportPastFlight[]> {
    try {
      const path = `/flights/departure?airport=${icao}&begin=${begin}&end=${end}`;

      const response = await this.axiosInstance.get<IAirportPastFlight[]>(path);

      const departures = response.data;
      return departures;
    } catch (error) {
      if (error instanceof AxiosError) this.handleApiErrors(error);
      else console.log(`[getFlights] Unknown error: ${error}!`);
      return [];
    }
  }
}

const openSkyApi = new OpenSkyNetworkApi();

export { openSkyApi };
