import { useEffect } from "react";
import {
  CircleLayerSpecification,
  MapMouseEvent,
  SymbolLayerSpecification,
} from "maplibre-gl";
import { Feature, Geometry, GeoJsonProperties } from "geojson";

import PulsingDot from "../../classes/PulsingDot";
import useMapContext from "../../hooks/useMapContext";

import { TAirportsLayerIcon } from "../../types";

type TAirportsLayer = {
  id: string;
  source: string;
  icon?: TAirportsLayerIcon;
  onClick?: (
    e: MapMouseEvent & {
      features?: Feature<Geometry, GeoJsonProperties>[] | undefined;
    } & Object
  ) => void;
};

export default function AirportsLayer({
  id,
  source,
  icon,
  onClick,
}: TAirportsLayer) {
  const mapInstance = useMapContext();

  useEffect(() => {
    let layer: SymbolLayerSpecification | CircleLayerSpecification;

    if (icon === "pulsing-dot") {
      mapInstance.addImage(icon, new PulsingDot(mapInstance, 25));
      layer = { id, source, type: "symbol", layout: { "icon-image": icon } };
    } else {
      // prettier-ignore
      layer = { id, source, type: "circle", paint: { "circle-radius": 6, "circle-color": "#B42222" } };
    }

    mapInstance.addLayer(layer);

    if (onClick) {
      mapInstance.on("click", id, onClick);
      // prettier-ignore
      mapInstance.on("mouseenter", id, () => mapInstance.getCanvas().style.cursor = "pointer");
      // prettier-ignore
      mapInstance.on("mouseleave", id, () => mapInstance.getCanvas().style.cursor = "");
    }

    return () => {
      if (icon === "pulsing-dot") mapInstance.removeImage(icon);
      if (mapInstance.getLayer(id)) mapInstance.removeLayer(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
