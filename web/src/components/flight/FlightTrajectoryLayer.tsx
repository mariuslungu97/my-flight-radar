import { useEffect } from "react";

import useMapContext from "../../hooks/useMapContext";

type TFlightTrajectoryLayerProps = {
  id: string;
  source: string;
};

export default function FlightTrajectoryLayer({
  id,
  source,
}: TFlightTrajectoryLayerProps) {
  const mapInstance = useMapContext();

  useEffect(() => {
    mapInstance.addLayer({
      id,
      source,
      type: "line",
      layout: {
        "line-cap": "round",
      },
      paint: {
        "line-width": 2,
        "line-color": "#d4ae6c",
        "line-dasharray": [0, 2],
      },
    });

    return () => {
      if (mapInstance.getLayer(id)) mapInstance.removeLayer(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
