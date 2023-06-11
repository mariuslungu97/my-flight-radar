import React, { useLayoutEffect } from "react";
import { GeoJSONSource, LayerSpecification } from "maplibre-gl";
import { GeoJSON } from "geojson";

import useMapContext from "../../hooks/useMapContext";

type TGeoJsonDataSource = {
  id: string;
  data: GeoJSON;
  children: React.ReactNode;
};

export default function GeoJsonDataSource({
  id,
  data,
  children,
}: TGeoJsonDataSource) {
  const mapInstance = useMapContext();

  useLayoutEffect(() => {
    mapInstance.addSource(id, {
      type: "geojson",
      data,
    });

    return () => {
      for (const layer of mapInstance.getStyle().layers) {
        const layerWithSource = layer as LayerSpecification & {
          source?: string;
        };
        if (layerWithSource.source && layerWithSource.source === id)
          mapInstance.removeLayer(layerWithSource.id);
      }
      mapInstance.removeSource(id);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    const source = mapInstance.getSource(id) as GeoJSONSource | null;
    if (source && mapInstance.isSourceLoaded(id)) source.setData(data);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return <React.Fragment>{children}</React.Fragment>;
}
