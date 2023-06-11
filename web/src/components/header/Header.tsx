import React from "react";

type THeaderProps = {
  center: number[];
  changeCoordinate: (type: string, value: number) => void;
};

export default function Header({ center, changeCoordinate }: THeaderProps) {
  const valueOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();

    const { id, value } = event.target;
    const floatValue = parseFloat(value);
    if (isNaN(floatValue)) return;

    changeCoordinate(id, floatValue);
  };

  return (
    <div className="w-full h-24 px-6 py-2 flex items-center justify-between bg-slate-800">
      <h1 className="text-lg font-bold text-white">My Flight Tracker</h1>
      <form className="w-72 h-full flex flex-col justify-between">
        <label className="block w-full flex items-center justify-between">
          <span className="inline-block text-sm text-white">Longitude</span>
          <input
            id="longitude"
            type="number"
            className="w-48 h-full p-2 bg-slate-600 rounded-md text-sm text-white placeholder-slate-400 outline-0"
            value={parseFloat(center[0].toFixed(4))}
            onChange={valueOnChange}
          />
        </label>
        <label className="block w-full flex items-center justify-between">
          <span className="inline-block text-sm text-white">Latitude</span>
          <input
            id="latitude"
            type="number"
            className="w-48 h-full p-2 bg-slate-600 rounded-md text-sm text-white placeholder-slate-400 outline-0"
            value={parseFloat(center[1].toFixed(4))}
            onChange={valueOnChange}
          />
        </label>
      </form>
      <div></div>
    </div>
  );
}
