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

import { useEffect, useState } from "react";
import { last } from "lodash";

import { PanelExtensionContext } from "@foxglove/studio";
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

type Props = {
  context: PanelExtensionContext;
};


function TrafficLightPanel({ context }: Props): React.ReactElement {

  const topicName = "/traffic_light_time_manager/traffic_light_states";
  const trafficLightId = 531;

  const [renderDone, setRenderDone] = useState<() => void>(() => () => {});
  const [trafficLightType, setTrafficLightType] = useState<number>(0);

  useEffect(() => {
    context.onRender = (renderState, done) => {
      setRenderDone(() => done);
      const message = last(renderState.currentFrame);
      if (message != undefined && message.topic === topicName) {
        if (trafficLightId) {
          const lastMessage: any = message.message;
          const state = lastMessage.states.find((state: any) => state.id === trafficLightId);
          if (state && state.lamp_states.length > 0) {
            setTrafficLightType(state.lamp_states[0].type);
          }
        }
      }
    };
    context.watch("currentFrame");
    context.watch("didSeek");

    return () => {
      context.onRender = undefined;
    };
  }, [context, topicName, trafficLightId]);


  useEffect(() => {
    if (topicName != undefined) {
      context.subscribe([topicName]);
    }
    return () => context.unsubscribeAll();
  }, [context, topicName]);

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
