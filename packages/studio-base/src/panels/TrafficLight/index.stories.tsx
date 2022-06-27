// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { Story, StoryContext } from "@storybook/react";

import PanelSetup from "@foxglove/studio-base/stories/PanelSetup";

import TrafficLightPanel from "./index";
import { Config, TrafficLightStateArray } from "./types";

export default {
  title: "panels/TrafficLight",
  component: TrafficLightPanel,
  decorators: [
    (StoryComponent: Story, { parameters }: StoryContext): JSX.Element => {
      return (
        <PanelSetup fixture={parameters.panelSetup?.fixture}>
          <StoryComponent />
        </PanelSetup>
      );
    },
  ],
};

function makeTrafficLightStateFixture(data: number) {
  return {
    topics: [{ name: "/data", datatype: "foo_msgs/Bar" }],
    frame: {
      "/data": [
        {
          topic: "/data",
          receiveTime: { sec: 123, nsec: 456 },
          message: { data },
        },
      ],
    },
  };
}

function makeTrafficLightStatesFixture(data: TrafficLightStateArray) {
  return {
    topics: [{ name: "/data", datatype: "foo_msgs/Bar" }],
    frame: {
      "/data": [
        {
          topic: "/data",
          receiveTime: { sec: 123, nsec: 456 },
          message: data
        },
      ],
    },
  };
}

export const TrafficLight = (props: Config): JSX.Element => {
  return (
    <TrafficLightPanel
      overrideConfig={props}
    />
  );
};

export const TrafficLightRed = (): JSX.Element => <TrafficLight topicName="/data" trafficLightId={0} />;
TrafficLightRed.parameters = { panelSetup: { fixture: makeTrafficLightStateFixture(1) } };

export const TrafficLightGreen = (): JSX.Element => <TrafficLight topicName="/data" trafficLightId={0} />;
TrafficLightGreen.parameters = { panelSetup: { fixture: makeTrafficLightStateFixture(2) } };

export const TrafficLightYellow = (): JSX.Element => <TrafficLight topicName="/data" trafficLightId={0} />;
TrafficLightYellow.parameters = { panelSetup: { fixture: makeTrafficLightStateFixture(3) } };

export const TrafficLightById = (): JSX.Element => <TrafficLight topicName="/data" trafficLightId={1} />;
TrafficLightById.parameters = { panelSetup: { fixture: makeTrafficLightStatesFixture(
  {
    header: null,
    states: [
      { id: 1, lamp_states: [ { type: 1, confidence: 100.0 } ] },
      { id: 2, lamp_states: [ { type: 2, confidence: 100.0 } ] },
      { id: 3, lamp_states: [ { type: 1, confidence: 100.0 } ] },
    ]
  }
) } };

export const TrafficLightByUnknownId = (): JSX.Element => <TrafficLight topicName="/data" trafficLightId={5} />;
TrafficLightByUnknownId.parameters = { panelSetup: { fixture: makeTrafficLightStatesFixture(
  {
    header: null,
    states: [
      { id: 1, lamp_states: [ { type: 1, confidence: 100.0 } ] },
      { id: 2, lamp_states: [ { type: 2, confidence: 100.0 } ] },
      { id: 3, lamp_states: [ { type: 1, confidence: 100.0 } ] },
    ]
  }
) } };
