import { useCallback, useRef } from "react";
import axios, { AxiosInstance } from "axios";

import {
  IAirport,
  IExtendedAirport,
  IFlight,
  TBounds,
  TFlightsApiResponse,
  TAirportsApiResponse,
  TFlightApiResponse,
  TAirportApiResponse,
} from "../types";

export default function useApi() {
  if (!process.env.REACT_APP_API_URL)
    throw new Error(
      "[useApi] Set 'REACT_APP_API_URL' key in your .env file before using!"
    );

  const axiosInstanceRef = useRef<AxiosInstance>(
    axios.create({
      baseURL: process.env.REACT_APP_API_URL,
    })
  );

  const printApiError = useCallback((error: any) => {
    if (axios.isAxiosError(error)) {
      console.log(`Axios Error: ${JSON.stringify(error.toJSON())}`);
    } else {
      console.log(
        `Unknown Error; Message: ${JSON.stringify(error.message)}; Code: ${
          error.code
        }`
      );
    }
  }, []);

  const getFlights = useCallback(
    async (bounds: TBounds, predict?: boolean): Promise<IFlight[]> => {
      const [longitudeMin, latitudeMin] = bounds[0];
      const [longitudeMax, latitudeMax] = bounds[1];

      let urlPath = `flights?latitudeMin=${latitudeMin.toFixed(
        6
      )}&longitudeMin=${longitudeMin.toFixed(
        6
      )}&latitudeMax=${latitudeMax.toFixed(
        6
      )}&longitudeMax=${longitudeMax.toFixed(6)}`;
      if (predict) urlPath += `&predict=${predict}`;

      try {
        const response =
          await axiosInstanceRef.current.get<TFlightsApiResponse>(urlPath);
        if (response.data.error) throw new Error(response.data.error);
        return response.data.data;
      } catch (error: any) {
        printApiError(error);
        return [];
      }
    },
    [printApiError]
  );

  const getAirports = useCallback(
    async (bounds: TBounds): Promise<IAirport[]> => {
      const [longitudeMin, latitudeMin] = bounds[0];
      const [longitudeMax, latitudeMax] = bounds[1];

      const urlPath = `airports?latitudeMin=${latitudeMin.toFixed(
        6
      )}&longitudeMin=${longitudeMin.toFixed(
        6
      )}&latitudeMax=${latitudeMax.toFixed(
        6
      )}&longitudeMax=${longitudeMax.toFixed(6)}`;

      try {
        const response =
          await axiosInstanceRef.current.get<TAirportsApiResponse>(urlPath);
        if (response.data.error) throw new Error(response.data.error);
        return response.data.data;
      } catch (error: any) {
        printApiError(error);

        return [];
      }
    },
    [printApiError]
  );

  const getFlight = useCallback(
    async (id: string, predict?: boolean): Promise<IFlight | null> => {
      let urlPath = `flights/${id}`;
      if (predict) urlPath += `?predict=${predict}`;
      try {
        const response = await axiosInstanceRef.current.get<TFlightApiResponse>(
          urlPath
        );
        if (response.data.error) throw new Error(response.data.error);
        return response.data.data;
      } catch (error: any) {
        printApiError(error);
        return null;
      }
    },
    [printApiError]
  );

  const getAirport = useCallback(
    async (icao: string): Promise<IExtendedAirport | null> => {
      const urlPath = `airports/${icao}`;
      try {
        const response =
          await axiosInstanceRef.current.get<TAirportApiResponse>(urlPath);
        if (response.data.error) throw new Error(response.data.error);
        return response.data.data;
      } catch (error: any) {
        printApiError(error);
        return null;
      }
    },
    [printApiError]
  );

  return { getFlights, getFlight, getAirports, getAirport };
}
