// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { Alert, AlertTitle, Theme, Typography, Link } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { ErrorInfo, useMemo, useState } from "react";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    padding: theme.spacing(2),
  },
  errorDetailHeader: {
    fontWeight: "bold",
  },
  errorDetailStack: {
    fontSize: theme.typography.body2.fontSize,
    lineHeight: "1.3em",
    paddingLeft: theme.spacing(2),
  },
  errorDetailContainer: {
    flexGrow: 2,
    overflowY: "auto",
    marginTop: 0,
    padding: theme.spacing(1),
  },
  actions: {
    textAlign: "right",
  },
}));

function sanitizeStack(stack: string) {
  return stack
    .replace(/\s+\(.+\)$/gm, " (some location)")
    .replace(/\s+https?:\/\/.+$/gm, " some location");
}

function ErrorStacktrace({ stack }: { stack: string }) {
  const styles = useStyles();
  const lines = sanitizeStack(stack)
    .trim()
    .replace(/^\s*at /gm, "")
    .split("\n")
    .map((line) => line.trim());
  return (
    <pre className={styles.errorDetailStack}>
      {lines.map((line, i) => {
        const match = /^(.+)\s(\(.+$)/.exec(line);
        if (!match) {
          return line + "\n";
        }
        return (
          <span key={i}>
            <span>{match[1]} </span>
            <span>{match[2]}</span>
            {"\n"}
          </span>
        );
      })}
    </pre>
  );
}

type ErrorDisplayProps = {
  title?: string;
  error?: Error;
  errorInfo?: ErrorInfo;
  actions?: JSX.Element;
  onDismiss?: () => void;
};

function ErrorDisplay(props: ErrorDisplayProps): JSX.Element {
  const styles = useStyles();
  const { error, errorInfo } = props;

  const [showErrorDetails, setShowErrorDetails] = useState(false);

  const errorDetails = useMemo(() => {
    if (!showErrorDetails) {
      return ReactNull;
    }

    let stackWithoutMessage = error?.stack ?? "";
    const errorString = error?.toString() ?? "";
    if (stackWithoutMessage.startsWith(errorString)) {
      stackWithoutMessage = stackWithoutMessage.substring(errorString.length);
    }

    return (
      <div>
        <Typography className={styles.errorDetailHeader}>Error stack:</Typography>
        <ErrorStacktrace stack={stackWithoutMessage} />
        {errorInfo && (
          <>
            <Typography className={styles.errorDetailHeader}>Component stack:</Typography>
            <ErrorStacktrace stack={errorInfo.componentStack} />
          </>
        )}
      </div>
    );
  }, [error, errorInfo, showErrorDetails, styles]);

  return (
    <div className={styles.root}>
      <div>
        <Alert severity="error" variant="filled" onClose={props.onDismiss}>
          <AlertTitle>{props.title ?? "The app encountered an unexpected error"}</AlertTitle>
          {error?.message} -{" "}
          <Link
            color="inherit"
            underline="always"
            onClick={() => setShowErrorDetails(!showErrorDetails)}
            sx={{ cursor: "pointer" }}
          >
            {showErrorDetails ? "Hide" : "Show"} details
          </Link>
        </Alert>
      </div>
      <div className={styles.errorDetailContainer}>{errorDetails}</div>
      <div className={styles.actions}>{props.actions}</div>
    </div>
  );
}

export default ErrorDisplay;
