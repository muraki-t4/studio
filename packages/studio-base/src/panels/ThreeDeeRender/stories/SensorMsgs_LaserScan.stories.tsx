// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import * as THREE from "three";

import { fromSec } from "@foxglove/rostime";
import { MessageEvent, Topic } from "@foxglove/studio";
import PanelSetup from "@foxglove/studio-base/stories/PanelSetup";

import ThreeDeeRender from "../index";
import { LaserScan, TransformStamped } from "../ros";
import { QUAT_IDENTITY } from "./common";
import useDelayedFixture from "./useDelayedFixture";

export default {
  title: "panels/ThreeDeeRender/LaserScan",
  component: ThreeDeeRender,
  parameters: { colorScheme: "dark" },
};

function SensorMsgs_LaserScan({
  time = 0,
  rangeMin = 0,
  rangeMax = 6,
  settings,
}: {
  time?: number;
  rangeMin?: number;
  rangeMax?: number;
  settings: Record<string, unknown>;
}): JSX.Element {
  const topics: Topic[] = [
    { name: "/scan", datatype: "sensor_msgs/LaserScan" },
    { name: "/tf", datatype: "geometry_msgs/TransformStamped" },
  ];
  const tf1: MessageEvent<TransformStamped> = {
    topic: "/tf",
    receiveTime: { sec: 10, nsec: 0 },
    message: {
      header: { seq: 0, stamp: { sec: 0, nsec: 0 }, frame_id: "map" },
      child_frame_id: "base_link",
      transform: {
        translation: { x: 1e7, y: 0, z: 0 },
        rotation: QUAT_IDENTITY,
      },
    },
    sizeInBytes: 0,
  };
  const tf2: MessageEvent<TransformStamped> = {
    topic: "/tf",
    receiveTime: { sec: 10, nsec: 0 },
    message: {
      header: { seq: 0, stamp: { sec: 0, nsec: 0 }, frame_id: "base_link" },
      child_frame_id: "sensor",
      transform: {
        translation: { x: 0, y: 0, z: 1 },
        rotation: new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2),
      },
    },
    sizeInBytes: 0,
  };
  const tf3: MessageEvent<TransformStamped> = {
    topic: "/tf",
    receiveTime: { sec: 10, nsec: 0 },
    message: {
      header: { seq: 0, stamp: { sec: 10, nsec: 0 }, frame_id: "base_link" },
      child_frame_id: "sensor",
      transform: {
        translation: { x: 0, y: 5, z: 1 },
        rotation: QUAT_IDENTITY,
      },
    },
    sizeInBytes: 0,
  };

  const count = 100;

  const ranges = new Float32Array(count);
  const intensities = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const t = i / (count + 1);
    ranges[i] = 1 + 3 * t;
    intensities[i] = Math.cos(2 * Math.PI * 4 * t);
  }

  const laserScan: MessageEvent<LaserScan> = {
    topic: "/scan",
    receiveTime: { sec: 10, nsec: 0 },
    message: {
      header: { seq: 0, stamp: { sec: 0, nsec: 0 }, frame_id: "sensor" },
      angle_min: 0,
      angle_max: 2 * Math.PI,
      angle_increment: (2 * Math.PI) / (count - 1),
      time_increment: 0,
      scan_time: 0,
      range_min: rangeMin,
      range_max: rangeMax,
      ranges,
      intensities,
    },
    sizeInBytes: 0,
  };

  const fixture = useDelayedFixture({
    topics,
    frame: {
      "/scan": [laserScan],
      "/tf": [tf1, tf2, tf3],
    },
    capabilities: [],
    activeData: {
      currentTime: fromSec(time),
    },
  });

  return (
    <PanelSetup fixture={fixture}>
      <ThreeDeeRender
        overrideConfig={{
          followTf: "base_link",
          scene: { enableStats: false },
          topics: {
            "/scan": {
              pointSize: 10,
              colorMode: "colormap",
              colorMap: "turbo",
              colorField: "intensity",
              ...settings,
            },
          },
          layers: {
            grid: { layerId: "foxglove.Grid" },
          },
          cameraState: {
            distance: 13.5,
            perspective: true,
            phi: 1.22,
            targetOffset: [0.25, -0.5, 0],
            thetaOffset: -0.33,
            fovy: 0.75,
            near: 0.01,
            far: 5000,
            target: [0, 0, 0],
            targetOrientation: [0, 0, 0, 1],
          },
        }}
      />
    </PanelSetup>
  );
}

export const Square = Object.assign(SensorMsgs_LaserScan.bind({}), {
  args: {
    settings: {
      pointShape: "square",
    },
  },
});

export const Size20 = Object.assign(SensorMsgs_LaserScan.bind({}), {
  args: {
    settings: {
      pointSize: 20,
    },
  },
});

export const FlatColor = Object.assign(SensorMsgs_LaserScan.bind({}), {
  args: {
    settings: {
      colorMode: "flat",
      flatColor: "#ff00ff",
    },
  },
});

export const CustomGradient = Object.assign(SensorMsgs_LaserScan.bind({}), {
  args: {
    settings: {
      colorMode: "gradient",
      gradient: ["#00ffff", "#0000ff"],
    },
  },
});

export const RangeLimits = Object.assign(SensorMsgs_LaserScan.bind({}), {
  args: {
    rangeMin: 2,
    rangeMax: 3,
  },
});

export const Time0 = Object.assign(SensorMsgs_LaserScan.bind({}), {
  args: {
    time: 0,
  },
});

export const Time5 = Object.assign(SensorMsgs_LaserScan.bind({}), {
  args: {
    time: 5,
  },
});

export const Time10 = Object.assign(SensorMsgs_LaserScan.bind({}), {
  args: {
    time: 10,
  },
});
