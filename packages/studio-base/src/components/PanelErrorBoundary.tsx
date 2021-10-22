// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { Button } from "@mui/material";
import { captureException } from "@sentry/core";
import { Component, ErrorInfo, PropsWithChildren, ReactNode } from "react";

import { AppError } from "@foxglove/studio-base/util/errors";

import ErrorDisplay from "./ErrorDisplay";

type Props = {
  onRemovePanel: () => void;
};

type State = {
  currentError: { error: Error; errorInfo: ErrorInfo } | undefined;
};

export default class PanelErrorBoundary extends Component<PropsWithChildren<Props>, State> {
  override state: State = {
    currentError: undefined,
  };

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    captureException(new AppError(error, errorInfo));
    this.setState({ currentError: { error, errorInfo } });
  }

  override render(): ReactNode {
    if (this.state.currentError) {
      return (
        <ErrorDisplay
          title="The panel encountered an unexpected error"
          error={this.state.currentError?.error}
          errorInfo={this.state.currentError?.errorInfo}
          onDismiss={() => this.setState({ currentError: undefined })}
          actions={
            <Button variant="outlined" color="error" onClick={this.props.onRemovePanel}>
              Remove Panel
            </Button>
          }
        />
      );
    }
    return this.props.children;
  }
}
