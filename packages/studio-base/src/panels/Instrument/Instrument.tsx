// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/
//
// This file incorporates work covered by the following copyright and
// permission notice:
//
//   Copyright 2019-2021 Cruise LLC
//
//   This source code is licensed under the Apache License, Version 2.0,
//   found at http://www.apache.org/licenses/LICENSE-2.0
//   You may not use this file except in compliance with the License.

import { useEffect, useState, useCallback } from "react";
import { last } from "lodash";
import { Stack as MuiStack, Typography } from "@mui/material";
import { keyframes } from '@mui/system';
import ForwardIcon from '@mui/icons-material/Forward';

import { PanelExtensionContext, SettingsTreeAction, SettingsTreeNodes } from "@foxglove/studio";
import Stack from "@foxglove/studio-base/components/Stack";

import { Config } from './types';

const blinkAnimation = keyframes`
  from: {
    opacity: 1,
  },
  to: {
    opacity: 0,
  },
`;

type SpeedProps = {
  value: number;
  unit: string;
};

export function Speed({ value, unit }: SpeedProps) {
  return (
    <MuiStack
      direction="column"
      justifyContent="center"
      alignItems="center"
      spacing={0}
    >
      <Typography variant="h1">{Math.floor(value)}</Typography>
      <Typography>{unit}</Typography>
    </MuiStack>
  );
}

type BlinkerProps = {
  on: boolean;
  direction: string;
};

export function Blinker({ on, direction }: BlinkerProps) {
  return (
    <ForwardIcon
      sx={{
        color: on ? "yellow" : "white",
        animation: `${blinkAnimation} 0.5s linear infinite`,
        transform: (direction === "left") ? "scaleX(-1)" : null,
        fontSize: "3.5rem",
     }}
    />
  );
}

export type InstrumentProps = {
  speed: number;
  left: boolean;
  right: boolean;
};

export function Instrument({ speed, left, right } : InstrumentProps) {

  return (
    <MuiStack direction="row" spacing={2}>
      <Blinker on={left} direction="left" />
      <Speed value={speed} unit="km/h" />
      <Blinker on={right} direction="right" />
    </MuiStack>
  )
}


type InstrumentPanelProps = {
  context: PanelExtensionContext;
};

function buildSettingsTree(config: Config): SettingsTreeNodes {
  return {
    speed: {
      label: "Speed",
      icon: "Settings",
      fields: {
        topicName: { label: "Topic Name", input: "string", value: config.speed.topic },
      },
    },
    blinker: {
      label: "Blinker",
      icon: "Settings",
      fields: {
        topicName: { label: "Topic Name", input: "string", value: config.blinker.topic },
        leftValue: { label: "Left Value", input: "number", value: config.blinker.left },
        rightValue: { label: "Right Value", input: "number", value: config.blinker.right },
        bothValue: { label: "Both Value", input: "number", value: config.blinker.both },
      },
    },
  };
}


function InstrumentPanel({ context }: InstrumentPanelProps): React.ReactElement {

  const [config, setConfig] = useState<Config>(() => {
    const partialConfig = context.initialState as Partial<Config>;
    return {
      speed: {
        topic: partialConfig.speed?.topic ?? ""
      },
      blinker: {
        topic: partialConfig.blinker?.topic ?? "",
        left: partialConfig.blinker?.left ?? 0,
        right: partialConfig.blinker?.right ?? 0,
        both: partialConfig.blinker?.both ?? 0,
      },
    };
  });

  const [renderDone, setRenderDone] = useState<() => void>(() => () => {});
  const [speed, setSpeed] = useState<number>(0);
  const [leftBlinker, setLeftBlinker] = useState<boolean>(false);
  const [rightBlinker, setRightBlinker] = useState<boolean>(false);

  const actionHandler = useCallback((action: SettingsTreeAction) => {
    if (action.action !== "update") {
      return;
    }
    const { path, value } = action.payload;
    if (path[0] === "speed" && path[1] === "topic") {
      setConfig((prev) => ({ ...prev, blinker: { ...prev.blinker, topic: String(value) } }));
    }
    if (path[0] === "blinker" && path[1] === "topic") {
      setConfig((prev) => ({ ...prev, blinker: { ...prev.blinker, topic: String(value) } }));
    }
    if (path[0] === "blinker" && path[1] === "left") {
      setConfig((prev) => ({ ...prev, blinker: { ...prev.blinker, left: Number(value) } }));
    }
    if (path[0] === "blinker" && path[1] === "right") {
      setConfig((prev) => ({ ...prev, blinker: { ...prev.blinker, right: Number(value) } }));
    }
    if (path[0] === "blinker" && path[1] === "both") {
      setConfig((prev) => ({ ...prev, blinker: { ...prev.blinker, both: Number(value) } }));
    }

  }, []);

  useEffect(() => {
    context.onRender = (renderState, done) => {
      setRenderDone(() => done);
      const message = last(renderState.currentFrame);
      if (message != undefined) {
        const lastMessage: any = message.message;
        if (message.topic === config.speed.topic) {
          setSpeed(lastMessage.speed);
        }
        if (message.topic === config.blinker.topic) {
          setLeftBlinker(lastMessage.strmode in [config.blinker.left, config.blinker.both]);
          setRightBlinker(lastMessage.strmode in [config.blinker.right, config.blinker.both]);
        }
      }
    };
    context.watch("currentFrame");
    context.watch("didSeek");

    return () => {
      context.onRender = undefined;
    };
  }, [context, config]);

  useEffect(() => {
    context.updatePanelSettingsEditor({
      actionHandler,
      nodes: buildSettingsTree(config),
    });

    if (config.speed.topic != undefined && config.blinker.topic != undefined) {
      const topics = [config.speed.topic, config.blinker.topic];
      context.subscribe([... new Set(topics)]);
    }
    return () => context.unsubscribeAll();
  }, [config, context, actionHandler]);


  useEffect(() => {
    renderDone();
  }, [renderDone]);

  return (
    <Stack fullHeight>
      <Stack
        flex="auto"
        alignItems="center"
        justifyContent="center"
        fullHeight
        gap={2}
        paddingY={2}
        paddingX={3}
      >
        <Instrument
          speed={speed}
          left={leftBlinker}
          right={rightBlinker}
        />
      </Stack>
    </Stack>
  );
}

export default InstrumentPanel;
