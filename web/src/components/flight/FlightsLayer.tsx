import { useEffect } from "react";
import { MapMouseEvent } from "maplibre-gl";
import { Feature, Geometry, GeoJsonProperties } from "geojson";
import planeIcon from "../../assets/plane-up-solid.svg";

import useMapContext from "../../hooks/useMapContext";

type TAirportsLayer = {
  id: string;
  source: string;
  onClick?: (
    e: MapMouseEvent & {
      features?: Feature<Geometry, GeoJsonProperties>[] | undefined;
    } & Object
  ) => void;
};

export default function FlightsLayer({ id, source, onClick }: TAirportsLayer) {
  const mapInstance = useMapContext();

  useEffect(() => {
    const imageId = "airplane-icon";
    const planeImage = new Image();
    planeImage.src = planeIcon;

    planeImage.decode().then(async () => {
      mapInstance.addImage(imageId, planeImage, { sdf: true });

      mapInstance.addLayer({
        id,
        source,
        type: "symbol",
        layout: {
          "icon-size": 0.1,
          "icon-image": imageId,
          "icon-rotate": ["get", "direction"],
          "icon-rotation-alignment": "map",
          "icon-overlap": "always",
          "icon-ignore-placement": true,
        },
        paint: {
          "icon-color": "#03a5fc",
        },
      });

      if (onClick) {
        mapInstance.on("click", id, onClick);
        // prettier-ignore
        mapInstance.on("mouseenter", id, () => mapInstance.getCanvas().style.cursor = "pointer");
        // prettier-ignore
        mapInstance.on("mouseleave", id, () => mapInstance.getCanvas().style.cursor = "");
      }
    });

    return () => {
      if (mapInstance.hasImage(imageId)) mapInstance.removeImage(imageId);
      if (mapInstance.getLayer(id)) mapInstance.removeLayer(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
