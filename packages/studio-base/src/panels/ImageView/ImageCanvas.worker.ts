// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/
//
// This file incorporates work covered by the following copyright and
// permission notice:
//
//   Copyright 2018-2021 Cruise LLC
//
//   This source code is licensed under the Apache License, Version 2.0,
//   found at http://www.apache.org/licenses/LICENSE-2.0
//   You may not use this file except in compliance with the License.

import { MessageEvent } from "@foxglove/studio-base/players/types";
import {
  Image,
  CompressedImage,
  ImageMarker,
  ImageMarkerArray,
} from "@foxglove/studio-base/types/Messages";
import Rpc, { Channel } from "@foxglove/studio-base/util/Rpc";
import { setupWorker } from "@foxglove/studio-base/util/RpcWorkerUtils";

import { renderImage } from "./renderImage";
import {
  Dimensions,
  idColorToIndex,
  flattenImageMarkers,
  RawMarkerData,
  RenderOptions,
} from "./util";

class ImageCanvasWorker {
  private readonly _renderState: Record<
    string,
    { canvas: OffscreenCanvas; hitmap: OffscreenCanvas; markers: ImageMarker[] }
  > = {};

  constructor(rpc: Rpc) {
    setupWorker(rpc);

    rpc.receive("initialize", async ({ id, canvas }: { id: string; canvas: OffscreenCanvas }) => {
      this._renderState[id] = {
        canvas,
        hitmap: new OffscreenCanvas(canvas.width, canvas.height),
        markers: [],
      };
    });

    rpc.receive("mouseMove", async ({ id, x, y }: { id: string; x: number; y: number }) => {
      const pixel = this._renderState[id]?.canvas?.getContext("2d")?.getImageData(x, y, 1, 1);
      const hit = this._renderState[id]?.hitmap?.getContext("2d")?.getImageData(x, y, 1, 1);
      const markerIndex = hit ? idColorToIndex(hit?.data) : undefined;
      if (pixel) {
        return {
          color: { r: pixel.data[0], g: pixel.data[1], b: pixel.data[2], a: pixel.data[3] },
          position: { x, y },
          markerIndex,
          marker:
            markerIndex != undefined ? this._renderState[id]?.markers[markerIndex] : undefined,
        };
      } else {
        return undefined;
      }
    });

    rpc.receive(
      "renderImage",
      // Potentially performance-sensitive; await can be expensive
      // eslint-disable-next-line @typescript-eslint/promise-function-async
      (args: {
        id: string;
        zoomMode: "fit" | "fill" | "other";
        panZoom: { x: number; y: number; scale: number };
        viewport: { width: number; height: number };
        imageMessage?: Image | CompressedImage;
        imageMessageDatatype?: string;
        rawMarkerData: RawMarkerData;
        options: RenderOptions;
      }): Promise<Dimensions | undefined> => {
        const {
          id,
          zoomMode,
          panZoom,
          viewport,
          imageMessage,
          imageMessageDatatype,
          rawMarkerData,
          options,
        } = args;

        const render = this._renderState[id];
        if (!render) {
          return Promise.resolve(undefined);
        }

        if (render.canvas.width !== viewport.width) {
          render.canvas.width = viewport.width;
          render.hitmap.width = viewport.width;
        }

        if (render.canvas.height !== viewport.height) {
          render.canvas.height = viewport.height;
          render.hitmap.height = viewport.height;
        }

        // Flatten markers because we need to be able to index into them for hitmapping.
        render.markers = flattenImageMarkers(
          rawMarkerData.markers as MessageEvent<ImageMarker | ImageMarkerArray>[],
        );

        return renderImage({
          canvas: render.canvas,
          hitmapCanvas: render.hitmap,
          zoomMode,
          panZoom,
          imageMessage,
          imageMessageDatatype,
          rawMarkerData,
          options,
        });
      },
    );
  }
}

if ((global as unknown as Partial<Channel>).postMessage && !global.onmessage) {
  // not yet using TS Worker lib: FG-64
  new ImageCanvasWorker(new Rpc(global as unknown as Channel));
}
