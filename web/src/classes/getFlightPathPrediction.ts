import * as turf from "@turf/turf";
import { Feature, LineString, Point, GeoJsonProperties } from "geojson";

function getFlightPathPrediction(
  origin: number[],
  velocity: number,
  duration: number,
  bearing: number,
  steps: number
): Feature<Point, GeoJsonProperties>[] {
  const destination = turf.destination(origin, velocity * duration, bearing, {
    units: "meters",
  });

  const route: Feature<LineString> = {
    type: "Feature",
    properties: {},
    geometry: {
      type: "LineString",
      coordinates: [origin, destination.geometry.coordinates],
    },
  };

  const distance = turf.distance(origin, destination, { units: "meters" });

  let arc = [];
  for (let i = 0; i < distance; i += distance / steps) {
    arc.push(turf.along(route, i, { units: "meters" }));
  }

  return arc;
}

export default getFlightPathPrediction;
