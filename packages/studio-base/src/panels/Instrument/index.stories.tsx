// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { Story } from "@storybook/react";

// import PanelSetup from "@foxglove/studio-base/stories/PanelSetup";

import { Instrument, InstrumentProps } from "./Instrument";

export default {
  component: Instrument,
  title: 'Instrument',
};

const Template: Story<InstrumentProps> = (args: InstrumentProps) => <Instrument {...args} />;

export const Default = Template.bind({});
Default.args = {
  speed: 50,
  left: false,
  right: true,
};
