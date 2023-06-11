import { useContext } from "react";
import { MapContext } from "../context/MapContext";

function useMapContext() {
  const mapContext = useContext(MapContext);
  if (mapContext === null) {
    throw new Error("useMapContext must be within TodoProvider");
  }

  return mapContext;
}

export default useMapContext;
