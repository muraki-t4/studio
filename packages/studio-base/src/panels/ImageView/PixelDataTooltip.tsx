// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { Stack, Typography } from "@mui/material";
import { ReactElement } from "react";

import { PixelData } from "@foxglove/studio-base/panels/ImageView/util";

export function PixelDataTooltip({ data }: { data: PixelData }): ReactElement {
  return (
    <Stack
      spacing={1}
      style={{
        backgroundColor: "#333",
        position: "absolute",
        left: data.position.x / devicePixelRatio + 16,
        top: data.position.y / devicePixelRatio + 16,
        pointerEvents: "none",
        padding: "1rem",
      }}
    >
      <div>
        <Typography variant="subtitle2">Marker Index</Typography>
        {data.markerIndex ?? "-"}
      </div>
      <div>
        <Typography variant="subtitle2">Position</Typography>
        <Stack direction="row" spacing={1}>
          <div>X:{data.position.x}</div>
          <div>Y:{data.position.y}</div>
        </Stack>
      </div>
      <div>
        <Typography variant="subtitle2">Color</Typography>
        <Stack direction="row" spacing={1}>
          <div>R:{data.color.r}</div>
          <div>G:{data.color.g}</div>
          <div>B:{data.color.b}</div>
          <div>A:{data.color.a}</div>
        </Stack>
      </div>
      <div>{JSON.stringify(data.marker, undefined, 2)}</div>
    </Stack>
  );
}
