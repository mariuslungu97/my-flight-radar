import { createContext } from "react";
import { Map } from "maplibre-gl";

export const MapContext = createContext<Map | null>(null);
