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

import { Stack, Text, useTheme } from "@fluentui/react";

import { MouseEventObject } from "@foxglove/regl-worldview";
import { Time } from "@foxglove/rostime";
import CameraInfo from "@foxglove/studio-base/panels/ThreeDimensionalViz/CameraInfo";
import Crosshair from "@foxglove/studio-base/panels/ThreeDimensionalViz/Crosshair";
import FollowTFControl from "@foxglove/studio-base/panels/ThreeDimensionalViz/FollowTFControl";
import Interactions from "@foxglove/studio-base/panels/ThreeDimensionalViz/Interactions";
import { TabType } from "@foxglove/studio-base/panels/ThreeDimensionalViz/Interactions/Interactions";
import MainToolbar from "@foxglove/studio-base/panels/ThreeDimensionalViz/MainToolbar";
import MeasureMarker from "@foxglove/studio-base/panels/ThreeDimensionalViz/MeasureMarker";
import SearchText, {
  SearchTextProps,
} from "@foxglove/studio-base/panels/ThreeDimensionalViz/SearchText";
import { LayoutToolbarSharedProps } from "@foxglove/studio-base/panels/ThreeDimensionalViz/TopicTree/Layout";
import { IMeasuringTool } from "@foxglove/studio-base/panels/ThreeDimensionalViz/TopicTree/useMeasuringTool";
import { fonts } from "@foxglove/studio-base/util/sharedStyleConstants";

type Props = LayoutToolbarSharedProps &
  SearchTextProps & {
    autoSyncCameraState: boolean;
    debug: boolean;
    interactionsTabType?: TabType;
    measuringTool: IMeasuringTool;
    onToggleCameraMode: () => void;
    onToggleDebug: () => void;
    renderFrameId?: string;
    currentTime: Time;
    selectedObject?: MouseEventObject;
    setInteractionsTabType: (arg0?: TabType) => void;
    showCrosshair?: boolean;
  };

function LayoutToolbar({
  autoSyncCameraState,
  cameraState,
  debug,
  followOrientation,
  followTf,
  interactionsTabType,
  isPlaying,
  measuringTool,
  onAlignXYAxis,
  onCameraStateChange,
  onFollowChange,
  onToggleCameraMode,
  onToggleDebug,
  renderFrameId,
  searchInputRef,
  searchText,
  searchTextMatches,
  searchTextOpen,
  selectedMatchIndex,
  selectedObject,
  setInteractionsTabType,
  setSearchText,
  setSearchTextMatches,
  setSelectedMatchIndex,
  showCrosshair = false,
  targetPose,
  toggleSearchTextOpen,
  transforms,
  currentTime,
}: Props) {
  const theme = useTheme();
  return (
    <>
      <Stack
        styles={{
          root: {
            position: "absolute",
            top: `calc(${theme.spacing.l2} + ${theme.spacing.s1})`,
            right: theme.spacing.m,
            zIndex: 101,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            // allow mouse events to pass through the empty space in this container element
            pointerEvents: "none",
          },
        }}
        tokens={{ childrenGap: theme.spacing.s1 }}
      >
        <FollowTFControl
          transforms={transforms}
          tfToFollow={typeof followTf === "string" && followTf.length > 0 ? followTf : undefined}
          followOrientation={followOrientation}
          onFollowChange={onFollowChange}
        />
        <SearchText
          searchTextOpen={searchTextOpen}
          toggleSearchTextOpen={toggleSearchTextOpen}
          searchText={searchText}
          setSearchText={setSearchText}
          setSearchTextMatches={setSearchTextMatches}
          searchTextMatches={searchTextMatches}
          searchInputRef={searchInputRef}
          setSelectedMatchIndex={setSelectedMatchIndex}
          selectedMatchIndex={selectedMatchIndex}
          onCameraStateChange={onCameraStateChange}
          cameraState={cameraState}
          transforms={transforms}
          renderFrameId={renderFrameId}
          currentTime={currentTime}
        />
        <Stack
          horizontal
          verticalAlign="center"
          styles={{ root: { position: "relative" } }}
          tokens={{ childrenGap: theme.spacing.s1 }}
        >
          <Text variant="small" styles={{ root: { fontFamily: fonts.MONOSPACE } }}>
            {measuringTool?.measureDistance}
          </Text>
          <MainToolbar
            measuringTool={measuringTool}
            perspective={cameraState.perspective}
            debug={debug}
            onToggleCameraMode={onToggleCameraMode}
            onToggleDebug={onToggleDebug}
          />
        </Stack>
        <Interactions
          selectedObject={selectedObject}
          interactionsTabType={interactionsTabType}
          setInteractionsTabType={setInteractionsTabType}
        />
        <CameraInfo
          cameraState={cameraState}
          targetPose={targetPose}
          followOrientation={followOrientation}
          followTf={followTf}
          isPlaying={isPlaying}
          onAlignXYAxis={onAlignXYAxis}
          onCameraStateChange={onCameraStateChange}
          showCrosshair={showCrosshair}
          autoSyncCameraState={autoSyncCameraState}
        />
      </Stack>
      {!cameraState.perspective && showCrosshair && <Crosshair cameraState={cameraState} />}
      <MeasureMarker measurePoints={measuringTool.measureInfo.measurePoints} />
    </>
  );
}

export default React.memo<Props>(LayoutToolbar);
