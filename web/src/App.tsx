import React, { useState, useCallback } from "react";
import { LngLat, MapLibreEvent, MapMouseEvent } from "maplibre-gl";
import { Feature, Geometry, GeoJsonProperties } from "geojson";

import Mapbox from "./components/mapbox/Mapbox";
import Header from "./components/header/Header";
import AirportsDataSource from "./components/airport/AirportsDataSource";
import AirportsLayer from "./components/airport/AirportsLayer";
import FlightInformation from "./components/flight/FlightInformation";
import AirportInformation from "./components/airport/AirportInformation";
import FlightsDataSource from "./components/flight/FlightsDataSource";
import FlightsLayer from "./components/flight/FlightsLayer";
import FlightTrajectoryDataSource from "./components/flight/FlightTrajectoryDataSource";
import FlightTrajectoryLayer from "./components/flight/FlightTrajectoryLayer";

import { IViewState, IAirportGeoJsonProperties } from "./types";

function App() {
  const [view, setView] = useState<IViewState>({
    center: new LngLat(2.3483, 48.8534),
    zoom: 7,
    bounds: new LngLat(2.3483, 48.8534).toBounds(1000 * 100),
  });
  const [selectedFlight, setSelectedFlight] = useState<string | null>(null);
  const [selectedAirport, setSelectedAirport] = useState<string | null>(null);

  const changeView = useCallback(
    (e: MapLibreEvent<TouchEvent | MouseEvent | WheelEvent | undefined>) => {
      const map = e.target;
      const center = map.getCenter();
      const zoom = map.getZoom();
      const bounds = map.getBounds();
      setView({
        center,
        zoom,
        bounds,
      });
    },
    []
  );

  const changeCenterCoord = useCallback(
    (type: string, value: number) => {
      let [longitude, latitude] = [...view.center.toArray()];
      if (type === "longitude") longitude = value;
      else if (type === "latitude") latitude = value;

      setView((view) => ({ ...view, center: new LngLat(longitude, latitude) }));
    },
    [view]
  );

  const mapOnClick = useCallback((e: MapMouseEvent & Object) => {
    setSelectedFlight(null);
    setSelectedAirport(null);
  }, []);

  // prettier-ignore
  const airportOnClick = useCallback((e: MapMouseEvent & { features?: Feature<Geometry, GeoJsonProperties>[] | undefined; } & Object) => {
    if (!e.features) return;
    const airportId = (e.features[0].properties as IAirportGeoJsonProperties).id;
    setSelectedAirport(airportId);
  }, []);

  // prettier-ignore
  const flightOnClick = useCallback((e: MapMouseEvent & { features?: Feature<Geometry, GeoJsonProperties>[] | undefined; } & Object) => {
    if (!e.features) return;
    const flightId = (e.features[0].properties as IAirportGeoJsonProperties).id;
    setSelectedFlight(flightId);
  }, []);

  return (
    <div className="w-full h-full flex flex-col">
      <Header
        center={view.center.toArray()}
        changeCoordinate={changeCenterCoord}
      />
      <Mapbox
        view={view}
        changeView={changeView}
        onClick={mapOnClick}
        withZoom={true}
        withCompass={true}
        withLatLongDisplay={true}
        mapstyle={`https://api.maptiler.com/maps/hybrid/style.json?key=${process.env.REACT_APP_MAPTILER_KEY}`}
      >
        <AirportsDataSource id="airport" bounds={view.bounds} size="large">
          <AirportsLayer
            id="airports"
            source="airport"
            onClick={airportOnClick}
          />
        </AirportsDataSource>
        <FlightsDataSource id="flight" view={view}>
          <FlightsLayer id="flights" source="flight" onClick={flightOnClick} />
        </FlightsDataSource>
        {selectedFlight && (
          <FlightTrajectoryDataSource
            id="flight-trajectory"
            flightId={selectedFlight}
          >
            <FlightTrajectoryLayer
              id="flights-trajectory"
              source="flight-trajectory"
            />
          </FlightTrajectoryDataSource>
        )}
        {selectedAirport && <AirportInformation icao={selectedAirport} />}
        {selectedFlight && <FlightInformation flightId={selectedFlight} />}
      </Mapbox>
    </div>
  );
}

export default App;
