import React, { useEffect, useRef, useState } from "react";

import getFlightPathPrediction from "../../classes/getFlightPathPrediction";
import GeoJsonDataSource from "../mapbox/GeoJsonDataSource";
import useFlights from "../../hooks/useFlights";
import * as turf from "@turf/turf";

import { IFlight, Coordinates, TBounds, IViewState } from "../../types";
import { Feature, FeatureCollection, Point, GeoJsonProperties } from "geojson";

interface IFlightWithCoords extends IFlight {
  coordinates: Coordinates;
}

interface IFlightPredictable extends IFlight {
  coordinates: Coordinates;
  velocity: number;
  direction: number;
}

interface IFlightsPathPredictions {
  [id: string]: Feature<Point, GeoJsonProperties>[];
}

type TFlightsDataSourceProps = {
  id: string;
  view: IViewState;
  children?: React.ReactNode;
};

export default function FlightsDataSource({
  id,
  view,
  children,
}: TFlightsDataSourceProps) {
  const pathUpdateTimer = useRef<NodeJS.Timer | null>(null);
  const [previousFlights, setPreviousFlights] = useState<IFlight[]>([]);
  const { flights, updateFlights, stopFlightsRefreshTimer } = useFlights(5000);

  // update flights when bounds change
  useEffect(() => {
    updateFlights(view.bounds.toArray() as TBounds);
  }, [view, updateFlights]);

  useEffect(() => {
    if (!flights || !flights.length) return;

    if (pathUpdateTimer.current) clearInterval(pathUpdateTimer.current);

    if (flights.length >= 1000) {
      setPreviousFlights(flights);
      return;
    }

    const steps = 50;
    const duration = 10; // in seconds

    const predictableFlights = flights.filter(
      (flight) => flight.direction && flight.velocity
    ) as IFlightPredictable[];
    const pathPredictions = predictableFlights.reduce(
      (acc, flight) => ({
        ...acc,
        [flight.id]: getFlightPathPrediction(
          [flight.coordinates.longitude, flight.coordinates.latitude],
          flight.velocity,
          duration,
          flight.direction,
          steps
        ),
      }),
      {}
    ) as IFlightsPathPredictions;

    let counter = 0;
    pathUpdateTimer.current = setInterval(() => {
      if (counter < steps) {
        const updatedFlights = [...flights.map((flight) => ({ ...flight }))];

        for (let updatedFlight of updatedFlights) {
          const flightPaths = pathPredictions[updatedFlight.id];
          if (!flightPaths) continue;
          const newPath = flightPaths[counter];
          const [newLongitude, newLatitude] = newPath.geometry.coordinates;
          updatedFlight.coordinates = {
            longitude: newLongitude,
            latitude: newLatitude,
          };

          const start = counter >= steps - 1 ? counter - 1 : counter;
          const end = counter >= steps - 1 ? counter : counter + 1;
          const newBearing = turf.bearing(flightPaths[start], flightPaths[end]);

          updatedFlight.direction = newBearing;
        }

        counter += 1;
        setPreviousFlights(updatedFlights);
      } else {
        if (pathUpdateTimer.current) clearInterval(pathUpdateTimer.current);
      }
    }, (1000 * duration) / steps);

    return () => {
      if (pathUpdateTimer.current) {
        clearInterval(pathUpdateTimer.current);
        pathUpdateTimer.current = null;
      }
    };
  }, [flights]);

  useEffect(() => {
    return () => {
      stopFlightsRefreshTimer();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <GeoJsonDataSource id={id} data={flightsToGeoJson(previousFlights)}>
      {children}
    </GeoJsonDataSource>
  );
}

const flightsToGeoJson = (flights: IFlight[]): FeatureCollection => {
  const flightsWithCoords = flights.filter(
    (flight) =>
      flight.coordinates &&
      flight.coordinates?.longitude &&
      flight.coordinates?.latitude
  ) as IFlightWithCoords[];

  const flightFeatures: Feature[] = flightsWithCoords.map((flight) => ({
    type: "Feature",
    properties: {
      id: flight.id,
      direction: flight.direction,
    },
    geometry: {
      type: "Point",
      coordinates: [
        flight.coordinates.longitude as number,
        flight.coordinates.latitude as number,
      ],
    },
  }));

  return { type: "FeatureCollection", features: flightFeatures };
};
