import React, { useCallback, useEffect, useState } from "react";
import { FeatureCollection, Feature } from "geojson";

import useApi from "../../hooks/useApi";
import GeoJsonDataSource from "../mapbox/GeoJsonDataSource";

import { IAirport, TAirportsLayerSize, TBounds } from "../../types";
import { LngLatBounds } from "maplibre-gl";

type TAirportsDataSourceProps = {
  id: string;
  bounds: LngLatBounds;
  size?: TAirportsLayerSize;
  children?: React.ReactNode;
};

export default function AirportsDataSource({
  id,
  bounds,
  size,
  children,
}: TAirportsDataSourceProps) {
  const [airports, setAirports] = useState<IAirport[]>([]);
  const { getAirports } = useApi();

  const updateAirports = useCallback(async () => {
    const newAirports = await getAirports(bounds.toArray() as TBounds);
    if (!newAirports || !newAirports.length) return;

    const filteredAirports = newAirports.filter((airport) => {
      if (!size) return airport;
      return airport.type === `${size}_airport`;
    });
    setAirports(filteredAirports);
  }, [size, bounds, getAirports]);

  useEffect(() => {
    updateAirports();
  }, [updateAirports]);

  return (
    <GeoJsonDataSource id={id} data={airportsToGeoJSON(airports, id)}>
      {children}
    </GeoJsonDataSource>
  );
}

const airportsToGeoJSON = (
  airports: IAirport[],
  sourceId: string
): FeatureCollection => {
  const features: Feature[] = airports.map((airport) => ({
    type: "Feature",
    properties: {
      id: airport.icao,
      source: sourceId,
    },
    geometry: {
      type: "Point",
      coordinates: [
        airport.coordinates.longitude,
        airport.coordinates.latitude,
      ],
    },
  }));

  return { type: "FeatureCollection", features };
};
