import { useCallback, useEffect, useState } from "react";
import track, { TrackOptions } from "track-property";

type UseTrackPropertyParams<P> = {
  disabled?: boolean;
  el?: HTMLElement | null;
} & Omit<TrackOptions<P>, "el">;

export const useTrackProperty = <P extends keyof HTMLElement>(
  callback: (value: HTMLElement[P] | null) => void,
  { el, disabled, ...options }: UseTrackPropertyParams<P>,
  depsArr: unknown[] = []
) => {
  const [update, setUpdate] = useState({});

  useEffect(
    () => (!disabled && el ? track(callback, { el, ...options }) : undefined),
    [el, update, disabled, ...depsArr]
  );

  return useCallback(() => setUpdate({}), [setUpdate]);
};
