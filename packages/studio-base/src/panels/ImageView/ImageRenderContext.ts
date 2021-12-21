// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { ImageMarker } from "@foxglove/studio-base/types/Messages";

function toPaddedHexString(n: number, length: number) {
  const str = n.toString(16);
  return "0".repeat(length - str.length) + str;
}

/**
 * This wraps a canvas rendering context to also render a hit map for
 * shapes drawn into that context.
 */
export class ImageRenderContext {
  private _currentMarkerIndex: number = 0;
  private _currentMarker: ImageMarker | undefined;
  private readonly _offscreenCanvas: OffscreenCanvas;
  private readonly _hctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | undefined;

  constructor(
    private readonly _ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    private readonly _width: number,
    private readonly _height: number,
  ) {
    this._offscreenCanvas = new OffscreenCanvas(_width, _height);
    this._hctx = this._offscreenCanvas.getContext("2d", { alpha: false }) ?? undefined;
    if (this._hctx) {
      this._hctx.imageSmoothingEnabled = false;
    }
  }

  async getImageData(): Promise<ImageBitmap | undefined> {
    return await createImageBitmap(this._offscreenCanvas);
  }

  startMarker(marker: ImageMarker): void {
    this._currentMarkerIndex++;
    this._currentMarker = marker;
    if (this._hctx) {
      const colorString = toPaddedHexString(this._currentMarkerIndex, 6);
      this._hctx.fillStyle = `#${colorString}ff`;
      this._hctx.strokeStyle = `#${colorString}ff`;
    }
  }

  // eslint-disable-next-line no-restricted-syntax
  get lineWidth(): number {
    return this._ctx.lineWidth;
  }

  // eslint-disable-next-line no-restricted-syntax
  set lineWidth(width: number) {
    this._ctx.lineWidth = width;
    if (this._hctx) {
      this._hctx.lineWidth = width;
    }
  }

  // eslint-disable-next-line no-restricted-syntax
  get fillStyle(): CanvasRenderingContext2D["fillStyle"] {
    return this._ctx.fillStyle;
  }

  // eslint-disable-next-line no-restricted-syntax
  set fillStyle(style: CanvasRenderingContext2D["fillStyle"]) {
    this._ctx.fillStyle = style;
  }

  // eslint-disable-next-line no-restricted-syntax
  get font(): string {
    return this._ctx.font;
  }

  // eslint-disable-next-line no-restricted-syntax
  set font(font: string) {
    this._ctx.fillStyle = font;
    if (this._hctx) {
      this._hctx.fillStyle = font;
    }
  }

  // eslint-disable-next-line no-restricted-syntax
  get strokeStyle(): CanvasRenderingContext2D["strokeStyle"] {
    return this._ctx.strokeStyle;
  }

  // eslint-disable-next-line no-restricted-syntax
  set strokeStyle(style: CanvasRenderingContext2D["strokeStyle"]) {
    this._ctx.strokeStyle = style;
  }

  // eslint-disable-next-line no-restricted-syntax
  get textBaseline(): CanvasRenderingContext2D["textBaseline"] {
    return this._ctx.textBaseline;
  }

  // eslint-disable-next-line no-restricted-syntax
  set textBaseline(baseline: CanvasRenderingContext2D["textBaseline"]) {
    this._ctx.textBaseline = baseline;
    if (this._hctx) {
      this._hctx.textBaseline = baseline;
    }
  }

  arc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    // eslint-disable-next-line @foxglove/no-boolean-parameters
    counterclockwise?: boolean,
  ): void {
    this._ctx.arc(x, y, radius, startAngle, endAngle, counterclockwise);
    this._hctx?.arc(x, y, radius, startAngle, endAngle, counterclockwise);
  }

  beginPath(): void {
    this._ctx.beginPath();
    this._hctx?.beginPath();
  }

  clearRect(x: number, y: number, w: number, h: number): void {
    this._ctx.clearRect(x, y, w, h);
    this._hctx?.clearRect(x, y, w, h);
  }

  closePath(): void {
    this._ctx.closePath();
    this._hctx?.closePath();
  }

  drawImage(image: CanvasImageSource, dx: number, dy: number): void {
    // Don't draw into hit context.
    this._ctx.drawImage(image, dx, dy);
  }

  fill(): void {
    this._ctx.fill();
    this._hctx?.fill();
  }

  fillRect(x: number, y: number, w: number, h: number): void {
    this._ctx.fillRect(x, y, w, h);
    this._hctx?.fillRect(x, y, w, h);
  }

  fillText(text: string, x: number, y: number): void {
    this._ctx.fillText(text, x, y);
    this._hctx?.fillText(text, x, y);
  }

  lineTo(x: number, y: number): void {
    this._ctx.lineTo(x, y);
    this._hctx?.lineTo(x, y);
  }

  measureText(text: string): TextMetrics {
    return this._ctx.measureText(text);
  }

  moveTo(x: number, y: number): void {
    this._ctx.moveTo(x, y);
    this._hctx?.moveTo(x, y);
  }

  restore(): void {
    this._ctx.restore();
    this._hctx?.restore();
  }

  save(): void {
    this._ctx.save();
    this._hctx?.save();
  }

  scale(x: number, y: number): void {
    this._ctx.scale(x, y);
    this._hctx?.scale(x, y);
  }

  stroke(): void {
    this._ctx.stroke();
    this._hctx?.stroke();
  }

  translate(x: number, y: number): void {
    this._ctx.translate(x, y);
    this._hctx?.translate(x, y);
  }
}
