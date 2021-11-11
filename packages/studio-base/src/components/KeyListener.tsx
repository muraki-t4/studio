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

import { ReactElement, useCallback, useEffect, useRef } from "react";

type KeyHandlers = Record<string, (event: KeyboardEvent) => void>;

type Props = {
  global?: true | false;
  keyDownHandlers?: KeyHandlers;
  keyPressHandlers?: KeyHandlers;
  keyUpHandlers?: KeyHandlers;
};

function callHandlers(handlers: KeyHandlers | undefined, event: KeyboardEvent) {
  if (!handlers) {
    return;
  }

  if (typeof handlers[event.key] === "function") {
    event.preventDefault();
    handlers[event.key]?.(event);
  }
}

export default function KeyListener(props: Props): ReactElement {
  const { global = false } = props;
  const el = useRef<HTMLDivElement>(ReactNull);

  const handleEvent = useCallback(
    (event: Event) => {
      if (!(event instanceof KeyboardEvent)) {
        return;
      }
      const { target, type } = event;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      ) {
        // The user is typing in an editable field; ignore the event.
        return;
      }

      switch (type) {
        case "keydown":
          callHandlers(props.keyDownHandlers, event);
          break;
        case "keypress":
          callHandlers(props.keyPressHandlers, event);
          break;
        case "keyup":
          callHandlers(props.keyUpHandlers, event);
          break;
        default:
          break;
      }
    },
    [props],
  );

  useEffect(() => {
    const target = global ? document : el.current?.parentElement;
    if (target) {
      target.addEventListener("keydown", handleEvent);
      target.addEventListener("keypress", handleEvent);
      target.addEventListener("keyup", handleEvent);
    }

    return () => {
      if (target) {
        target.removeEventListener("keydown", handleEvent);
        target.removeEventListener("keypress", handleEvent);
        target.removeEventListener("keyup", handleEvent);
      }
    };
  }, [global, handleEvent]);

  return <div style={{ display: "none" }} ref={el} />;
}
