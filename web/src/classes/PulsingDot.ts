import { Map, StyleImageInterface } from "maplibre-gl";

class PulsingDot implements StyleImageInterface {
  private _size: number;
  public width: number;
  public height: number;
  public data: Uint8ClampedArray;
  private _map: Map;
  private _context: CanvasRenderingContext2D | null = null;

  constructor(map: Map, size: number) {
    this._size = size;
    this.width = size;
    this.height = size;
    this._map = map;
    this.data = new Uint8ClampedArray(size * size * 4);
  }

  onAdd() {
    const canvas = document.createElement("canvas");
    canvas.width = this.width;
    canvas.height = this.height;
    this._context = canvas.getContext("2d");
  }

  render(): boolean {
    const duration = 1000;
    const t = (performance.now() % duration) / duration;

    const radius = (this._size / 2) * 0.3;
    const outerRadius = (this._size / 2) * 0.7 * t + radius;
    const context = this._context;
    if (!context) return false;

    // draw outer circle
    context.clearRect(0, 0, this.width, this.height);
    context.beginPath();
    context.arc(this.width / 2, this.height / 2, outerRadius, 0, Math.PI * 2);
    context.fillStyle = "rgba(255, 200, 200," + (1 - t) + ")";
    context.fill();

    // draw inner circle
    context.beginPath();
    context.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2);
    context.fillStyle = "rgba(255, 100, 100, 1)";
    context.strokeStyle = "white";
    context.lineWidth = 2 + 4 * (1 - t);
    context.fill();
    context.stroke();

    // update this image's data with data from the canvas
    this.data = context.getImageData(0, 0, this.width, this.height).data;

    // continuously repaint the map, resulting in the smooth animation of the dot
    this._map.triggerRepaint();

    // return `true` to let the map know that the image was updated
    return true;
  }
}

export default PulsingDot;
