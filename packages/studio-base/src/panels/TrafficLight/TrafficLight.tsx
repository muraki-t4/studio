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

import { PanelExtensionContext, SettingsTreeAction, SettingsTreeNodes } from "@foxglove/studio";
import Stack from "@foxglove/studio-base/components/Stack";

import { Config } from './types';
import GreenLight from './svg/Green.svg';
import YellowLight from './svg/Yellow.svg';
import RedLight from './svg/Red.svg';
import UnknownLight from './svg/Unknown.svg';


type TrafficLightProps = {
  type: number;
};

function TrafficLight(props: TrafficLightProps) {
  return (
    props.type === 2 ? <GreenLight /> :
    props.type === 3 ? <YellowLight /> :
    props.type === 1 ? <RedLight /> :
    <UnknownLight />
  );
}

type TrafficLightPanelProps = {
  context: PanelExtensionContext;
};

function buildSettingsTree(config: Config): SettingsTreeNodes {
  return {
    general: {
      label: "General",
      icon: "Settings",
      fields: {
        topicName: { label: "Topic Name", input: "string", value: config.topicName },
        trafficLightId: { label: "Traffic Light Id", input: "number", value: config.trafficLightId },
      },
    },
  };
}


function TrafficLightPanel({ context }: TrafficLightPanelProps): React.ReactElement {

  const [config, setConfig] = useState<Config>(() => {
    const partialConfig = context.initialState as Partial<Config>;
    return {
      trafficLightId: partialConfig.trafficLightId ?? 0,
      topicName: partialConfig.topicName ?? "",
    };
  });

  const [renderDone, setRenderDone] = useState<() => void>(() => () => {});
  const [trafficLightType, setTrafficLightType] = useState<number>(0);

  const actionHandler = useCallback((action: SettingsTreeAction) => {
    if (action.action !== "update") {
      return;
    }
    const { path, input, value } = action.payload;
    if (path[1] === "topicName" && input === "string") {
      setConfig((prev) => ({ ...prev, topicName: String(value) }));
    }
    if (path[1] === "trafficLightId" && input === "number") {
      setConfig((prev) => ({ ...prev, trafficLightId: Number(value) }));
    }
  }, []);

  useEffect(() => {
    context.onRender = (renderState, done) => {
      setRenderDone(() => done);
      const message = last(renderState.currentFrame);
      if (message != undefined && message.topic === config?.topicName) {
        // FIXME: Change topic type std_msgs/UInt32 to autoware_perception_msgs/TrafficLightState.msg
        const lastMessage: any = message.message;
        if (config?.trafficLightId > 0) {
          const state = lastMessage.states.find((state: any) => state.id === config.trafficLightId);
          if (state && state.lamp_states.length > 0) {
            setTrafficLightType(state.lamp_states[0].type);
          }
        } else {
          setTrafficLightType(lastMessage.data);
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

    if (config.topicName != undefined) {
      context.subscribe([config.topicName]);
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
        <TrafficLight type={trafficLightType} />
      </Stack>
    </Stack>
  );
}

export default TrafficLightPanel;
