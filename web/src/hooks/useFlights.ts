import { useState, useRef, useEffect, useCallback } from "react";
import useApi from "./useApi";

import { IFlight, TBounds, Coordinates } from "../types";

interface IFlightWithCoords extends IFlight {
  coordinates: Coordinates;
}

function useFlights(refreshFlightsTimer = 0) {
  const [flights, setFlights] = useState<IFlight[] | null>(null);
  const refreshFlightsFc = useRef<NodeJS.Timer | null>(null);

  const { getFlights } = useApi();

  // timer cleanup
  useEffect(() => {
    return () => {
      if (refreshFlightsFc.current) clearInterval(refreshFlightsFc.current);
    };
  }, []);

  const processFlights = (flights: IFlight[]): IFlightWithCoords[] => {
    const filteredFlights = flights.filter(
      (flight) =>
        flight.coordinates &&
        flight.coordinates.latitude &&
        flight.coordinates.longitude
    ) as IFlightWithCoords[];
    const exactFlights = filteredFlights.map((flight) => ({
      ...flight,
      coordinates: {
        longitude: parseFloat(flight.coordinates.longitude.toFixed(10)),
        latitude: parseFloat(flight.coordinates.latitude.toFixed(10)),
      },
    }));

    return exactFlights;
  };
  const updateFlights = useCallback(
    async (bounds: TBounds) => {
      const newFlights = await getFlights(bounds, true);
      if (!newFlights) return;
      const processedFlights = processFlights(newFlights);

      // set flights refresh timer function
      if (refreshFlightsTimer) {
        if (refreshFlightsFc.current) clearInterval(refreshFlightsFc.current);
        refreshFlightsFc.current = setInterval(async () => {
          const updatedFlights = await getFlights(bounds, true);
          if (!updatedFlights) return;
          const processedFlights = processFlights(updatedFlights);
          setFlights(processedFlights);
        }, refreshFlightsTimer);
      }

      setFlights(processedFlights);
    },
    [refreshFlightsTimer, getFlights]
  );

  const stopFlightsRefreshTimer = useCallback(() => {
    if (refreshFlightsFc.current) clearInterval(refreshFlightsFc.current);
    refreshFlightsFc.current = null;
  }, []);

  return {
    flights,
    updateFlights,
    stopFlightsRefreshTimer,
  };
}

export default useFlights;
