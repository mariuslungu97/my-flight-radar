import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import FlightProgressBar from "./FlightProgressBar";

import { IFlight } from "../../types";
import useApi from "../../hooks/useApi";

dayjs.extend(relativeTime);

type FlightInformationProps = {
  flightId: string;
};

export default function FlightInformation({
  flightId,
}: FlightInformationProps) {
  const [flight, setFlight] = useState<IFlight | null>(null);
  const { getFlight } = useApi();

  useEffect(() => {
    getFlight(flightId).then((flight) => {
      if (!flight) return;
      setFlight(flight);
    });
  }, [flightId, getFlight]);

  if (!flight) return null;

  return (
    <div className="absolute z-10 bottom-2 left-1 h-fit w-72 p-4 bg-gray-800 rounded border-2 border-gray-600 text-sm text-white flex flex-col">
      <p className="font-bold my-4">{flight.callsign}</p>
      {flight.route && (
        <FlightProgressBar
          departure={flight.route.departure}
          destination={flight.route.arrival}
          progress={50}
        />
      )}
      <div className="w-full h-fit flex justify-between items-center my-1">
        <p className="text-gray-500">Last Contact</p>
        <p>{dayjs(flight.lastContact).fromNow()}</p>
      </div>
      <div className="w-full h-fit flex justify-between items-center my-1">
        <p className="text-gray-500">Origin Country</p>
        <p>{flight.originCountry}</p>
      </div>
      {flight.velocity && (
        <div className="w-full h-fit flex justify-between items-center my-1">
          <p className="text-gray-500">Speed</p>
          <p>{`${flight.velocity} m/s (${(3.6 * flight.velocity).toFixed(
            2
          )} km/h)`}</p>
        </div>
      )}
      {flight.altitude && (
        <>
          <div className="w-full h-fit flex justify-between items-center my-1">
            <p className="text-gray-500">Geometric Altitude</p>
            <p>{`${flight.altitude.geometric} m`}</p>
          </div>
          <div className="w-full h-fit flex justify-between items-center my-1">
            <p className="text-gray-500">Barometric Altitude</p>
            <p>{`${flight.altitude.barometric} m`}</p>
          </div>
        </>
      )}
      {flight.direction && (
        <div className="w-full h-fit flex justify-between items-center my-1">
          <p className="text-gray-500">Direction</p>
          <p>{flight.direction}&deg;</p>
        </div>
      )}
      {flight.verticalRate && (
        <div className="w-full h-fit flex justify-between items-center my-1">
          <p className="text-gray-500">Vertical Rate</p>
          <p>{`${flight.verticalRate} m/s`}</p>
        </div>
      )}
      {flight.squawk && (
        <div className="w-full h-fit flex justify-between items-center my-1">
          <p className="text-gray-500">Squawk</p>
          <p>{flight.squawk}</p>
        </div>
      )}
      <div className="w-full h-fit flex justify-between items-center my-1">
        <p className="text-gray-500">ICAO24</p>
        <p>{flight.id}</p>
      </div>
      <div className="w-full h-fit flex justify-between items-center my-1">
        <p className="text-gray-500">Position Source</p>
        <p>{flight.positionSource}</p>
      </div>
    </div>
  );
}
