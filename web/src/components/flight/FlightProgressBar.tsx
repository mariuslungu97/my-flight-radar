import React from "react";

type FlightProgressBarProps = {
  departure: string;
  destination: string;
  progress: number; // percentage
};

export default function FlightProgressBar({
  departure,
  destination,
  progress,
}: FlightProgressBarProps) {
  return (
    <div className="flex justify-around items-center my-4">
      <p className="text-lg text-white font-bold mr-2">{departure}</p>
      <div className="w-4/5 bg-gray-200 rounded-full h-1.5 dark:bg-gray-600">
        <div
          className="bg-blue-600 h-1.5 rounded-full"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-lg text-white font-bold ml-2">{destination}</p>
    </div>
  );
}
