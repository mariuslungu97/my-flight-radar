import React, { useRef, useEffect, useState } from "react";
import {
  Map,
  NavigationControl,
  AttributionControl,
  LngLat,
  MapLibreEvent,
  MapMouseEvent,
} from "maplibre-gl";

import { MapContext } from "../../context/MapContext";
import LatLongControl from "../../classes/LatLongControl";

import { IViewState } from "../../types";

type MapboxProps = {
  mapstyle: string;
  withCompass: boolean;
  withZoom: boolean;
  withLatLongDisplay: boolean;
  view: IViewState;
  changeView: (
    e: MapLibreEvent<TouchEvent | MouseEvent | WheelEvent | undefined>
  ) => void;
  onClick: (e: MapMouseEvent & Object) => void;
  children?: React.ReactNode;
};

export default function Mapbox({
  mapstyle,
  view,
  changeView,
  onClick,
  withCompass,
  withZoom,
  withLatLongDisplay,
  children,
}: MapboxProps) {
  const [ready, setReady] = useState(false);
  const mapRef = useRef<Map | null>(null);
  const mapContainer = useRef<string | HTMLElement>("");

  useEffect(() => {
    if (mapRef.current) return;

    const map = new Map({
      container: mapContainer.current,
      style: mapstyle,
      center: view.center,
      zoom: view.zoom,
      attributionControl: false,
      fadeDuration: 0,
    });

    // event handlers
    map.on("dragend", (e) => changeView(e));
    map.on("zoomend", (e) => changeView(e));
    map.on("click", (e) => onClick(e));

    // add controls
    if (withZoom || withCompass) {
      const navControl = new NavigationControl({
        showCompass: withCompass,
        showZoom: withZoom,
      });

      map.addControl(navControl, "top-right");
    }

    if (withLatLongDisplay) map.addControl(new LatLongControl(), "top-left");

    map.addControl(new AttributionControl(), "bottom-right");

    mapRef.current = map;

    map.on("load", () => setReady(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready || !mapRef.current) return;

    const mapInstance = mapRef.current;
    mapInstance.setCenter(view.center);
    mapInstance.setZoom(view.zoom);
  }, [ready, view]);

  return (
    <MapContext.Provider value={mapRef.current}>
      <div
        ref={mapContainer as React.LegacyRef<HTMLDivElement> | undefined}
        className="w-full h-full relative"
      >
        {ready && children}
      </div>
    </MapContext.Provider>
  );
}
