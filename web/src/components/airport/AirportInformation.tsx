import React, { useEffect, useState } from "react";

import useApi from "../../hooks/useApi";
import Spinner from "../shared/Spinner";

import { IExtendedAirport } from "../../types";

type TAirportInformationProps = {
  icao: string;
};

export default function AirportInformation({ icao }: TAirportInformationProps) {
  const [airport, setAirport] = useState<IExtendedAirport | null>(null);
  const { getAirport } = useApi();

  useEffect(() => {
    getAirport(icao).then((airport) => {
      if (!airport) return;
      setAirport(airport);
    });
  }, [icao, getAirport]);

  return (
    <div className="absolute z-10 bottom-2 left-1 h-fit w-96 p-4 bg-gray-800 rounded border-2 border-gray-600 text-sm text-white flex flex-col">
      {!airport ? (
        <div className="w-full h-full flex justify-center items-center">
          <Spinner />
        </div>
      ) : (
        <React.Fragment>
          <p className="font-bold my-4">{airport.iata}</p>
          <div className="w-full h-fit flex justify-between items-center my-1">
            <p className="text-gray-500">ICAO</p>
            <p>{airport.icao}</p>
          </div>
          <div className="w-full h-fit flex justify-between items-center my-1">
            <p className="text-gray-500">Name</p>
            <p>{airport.name}</p>
          </div>
          <div className="w-full h-fit flex justify-between items-center my-1">
            <p className="text-gray-500">Country</p>
            <p>{airport.country}</p>
          </div>
          <div className="w-full h-fit flex justify-between items-center my-1">
            <p className="text-gray-500">Longitude</p>
            <p>{airport.coordinates.longitude.toFixed(4)}</p>
          </div>
          <div className="w-full h-fit flex justify-between items-center my-1">
            <p className="text-gray-500">Latitude</p>
            <p>{airport.coordinates.latitude.toFixed(4)}</p>
          </div>
          {airport.homepage && (
            <div className="w-full h-fit flex justify-between items-center my-1">
              <a className="text-gray-500" href={airport.homepage}>
                Homepage Link
              </a>
            </div>
          )}
          {airport.wikipedia && (
            <div className="w-full h-fit flex justify-between items-center my-1">
              <a className="text-sky-500" href={airport.wikipedia}>
                Wikipedia Link
              </a>
            </div>
          )}
          {airport.gpsCode && (
            <div className="w-full h-fit flex justify-between items-center my-1">
              <p className="text-sky-500">GPS Code</p>
              <p>{airport.gpsCode}</p>
            </div>
          )}
        </React.Fragment>
      )}
    </div>
  );
}
