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

import { isEqual } from "lodash";
import { useCallback, useMemo, useState } from "react";

import { ReglClickInfo, Vec3 } from "@foxglove/regl-worldview";
import { Point } from "@foxglove/studio-base/types/Messages";

type MeasureState = "idle" | "place-start" | "place-finish";

type MeasureInfo = {
  measureState: MeasureState;
  measurePoints: { start?: Point; end?: Point };
};

type MouseEventHandler = (ev: MouseEvent, clickInfo: ReglClickInfo) => void;

export interface IMeasuringTool {
  measureActive: boolean;
  measureDistance: string;
  measureInfo: MeasureInfo;
  onMouseMove: MouseEventHandler;
  onMouseUp: MouseEventHandler;
  onMouseDown: MouseEventHandler;
  toggleMeasureState(): void;
  reset(): void;
}

/* eslint-disable no-restricted-syntax */
function arrayToPoint(v?: Vec3 | null): { x: number; y: number; z: number } | undefined {
  if (!v) {
    return undefined;
  }
  return { x: v[0], y: v[1], z: v[2] };
}

export default function useMeasuringTool(): IMeasuringTool {
  const [measureInfo, setMeasureInfo] = useState<MeasureInfo>({
    measureState: "idle",
    measurePoints: {},
  });

  const toggleMeasureState = useCallback(() => {
    setMeasureInfo((oldMeasureInfo) => {
      const newMeasureState = oldMeasureInfo.measureState === "idle" ? "place-start" : "idle";

      return {
        measureState: newMeasureState,
        measurePoints: {},
      };
    });
  }, []);

  const reset = useCallback(() => {
    setMeasureInfo({
      measureState: "idle",
      measurePoints: {},
    });
  }, []);

  const measureDistance = useMemo(() => {
    const { start, end } = measureInfo.measurePoints;
    let dist_string = "";
    if (start && end) {
      const dist = Math.hypot(end.x - start.x, end.y - start.y, end.z - start.z);
      dist_string = `${dist.toFixed(2)}m`;
    }

    return dist_string;
  }, [measureInfo.measurePoints]);

  return useMemo(() => {
    let mouseDownCoords: number[] = [-1, -1];

    const measureState = measureInfo.measureState;
    const measureActive = measureState === "place-start" || measureState === "place-finish";

    const onMouseDown = (e: MouseEvent, _clickInfo: ReglClickInfo): void => {
      mouseDownCoords = [e.clientX, e.clientY];
    };

    const onMouseUp = (e: MouseEvent, _clickInfo: ReglClickInfo): void => {
      const mouseUpCoords = [e.clientX, e.clientY];

      if (!isEqual(mouseUpCoords, mouseDownCoords)) {
        return;
      }

      setMeasureInfo((prevInfo) => {
        if (prevInfo.measureState === "place-start") {
          return { measureState: "place-finish", measurePoints: measureInfo.measurePoints };
        } else if (prevInfo.measureState === "place-finish") {
          return { measureState: "idle", measurePoints: measureInfo.measurePoints };
        }

        return prevInfo;
      });
    };

    // fixme - debounce...
    const onMouseMove = (_e: MouseEvent, clickInfo: ReglClickInfo): void => {
      setMeasureInfo((prevInfo) => {
        switch (prevInfo.measureState) {
          case "place-start":
            return {
              measureState,
              measurePoints: {
                start: arrayToPoint(clickInfo.ray.planeIntersection([0, 0, 0], [0, 0, 1])),
                end: undefined,
              },
            };
          case "place-finish": {
            return {
              measureState,
              measurePoints: {
                ...prevInfo.measurePoints,
                end: arrayToPoint(clickInfo.ray.planeIntersection([0, 0, 0], [0, 0, 1])),
              },
            };
          }
          default:
            return prevInfo;
        }
      });
    };

    return {
      measureActive,
      measureDistance,
      measureInfo,
      onMouseDown,
      onMouseUp,
      onMouseMove,
      toggleMeasureState,
      reset,
    };
  }, [measureDistance, measureInfo, reset, toggleMeasureState]);
}
