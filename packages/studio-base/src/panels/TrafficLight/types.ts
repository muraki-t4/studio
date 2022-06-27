// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

export type Config = {
  trafficLightId: number;
  topicName: string;
};

export type LampState = {
  type: number;
  confidence: number;
}

export type TrafficLightState = {
  id: number;
  lamp_states: LampState[];
}

export type TrafficLightStateArray = {
  header: unknown;
  states: TrafficLightState[];
}
