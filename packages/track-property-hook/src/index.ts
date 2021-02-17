import { useCallback, useEffect, useState } from "react";
import track, { TrackOptions } from "track-property";

type UseTrackPropertyParams<P> = {
  disabled?: boolean;
  ref: React.MutableRefObject<HTMLElement | null>;
} & Omit<TrackOptions<P>, "el">;

export const useTrackProperty = <P extends keyof HTMLElement>(
  callback: (value: HTMLElement[P] | null) => void,
  { ref, disabled, ...options }: UseTrackPropertyParams<P>,
  depsArr: unknown[] = []
) => {
  const [update, setUpdate] = useState({});

  useEffect(
    () =>
      !disabled ? track(callback, { el: ref.current, ...options }) : undefined,
    [ref, update, disabled, ...depsArr]
  );

  return useCallback(() => setUpdate({}), [setUpdate]);
};
