import { IControl, Map } from "maplibre-gl";

export default class LatLongControl implements IControl {
  private _map: Map | null = null;
  private _container: HTMLElement | null = null;

  onAdd(map: Map): HTMLElement {
    this._map = map;
    this._container = document.createElement("div");
    this._container.className =
      "absolute top-0 left-0 w-56 h-fit flex items-center p-2 text-xs text-white bg-gray-800 bg-opacity-50";

    const [lng, lat] = this._map.getCenter().toArray();
    this._container.textContent = `Latitude: ${lat.toFixed(
      4
    )} | Longitude: ${lng.toFixed(4)}`;

    this._map.on("drag", () => {
      if (!this._map || !this._container) return;
      const [lng, lat] = this._map.getCenter().toArray();
      this._container.textContent = `Latitude: ${lat.toFixed(
        4
      )} | Longitude: ${lng.toFixed(4)}`;
    });

    return this._container;
  }

  onRemove(): void {
    if (!this._container) return;
    this._container.parentNode?.removeChild(this._container);
    this._map = null;
  }
}
