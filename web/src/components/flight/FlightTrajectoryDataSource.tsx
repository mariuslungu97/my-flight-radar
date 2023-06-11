import React, { useCallback, useEffect, useState } from "react";
import { Feature } from "geojson";
import * as turf from "@turf/turf";

import GeoJsonDataSource from "../mapbox/GeoJsonDataSource";
import useApi from "../../hooks/useApi";

import { Coordinates, IFlightWithArrival } from "../../types";

type TFlightTrajectoryDataSourceProps = {
  id: string;
  flightId: string;
  children?: React.ReactNode;
};

export default function FlightTrajectoryDataSource({
  id,
  flightId,
  children,
}: TFlightTrajectoryDataSourceProps) {
  const [flight, setFlight] = useState<IFlightWithArrival | null>(null);
  const { getFlight, getAirport } = useApi();

  const getFlightWithArrival = useCallback(async () => {
    const flight = await getFlight(flightId);
    if (!flight || !flight.route) return;
    else if (
      !flight.coordinates ||
      !flight.coordinates.longitude ||
      !flight.coordinates.latitude
    )
      return;
    const arrivalAirport = await getAirport(flight.route.arrival);
    if (!arrivalAirport) return;

    const flightWithArrival: IFlightWithArrival = {
      id: flight.id,
      coordinates: flight.coordinates as Coordinates,
      route: {
        ...flight.route,
        arrival: arrivalAirport,
      },
    };
    setFlight(flightWithArrival);
  }, [flightId, getFlight, getAirport]);

  useEffect(() => {
    getFlightWithArrival();
  }, [getFlightWithArrival]);

  if (!flight) return null;

  return (
    <GeoJsonDataSource id={id} data={flightToTrajectoryGeoJson(flight)}>
      {children}
    </GeoJsonDataSource>
  );
}

const flightToTrajectoryGeoJson = (flight: IFlightWithArrival): Feature =>
  turf.greatCircle(
    [flight.coordinates.longitude, flight.coordinates.latitude],
    [
      flight.route.arrival.coordinates.longitude,
      flight.route.arrival.coordinates.latitude,
    ]
  );
