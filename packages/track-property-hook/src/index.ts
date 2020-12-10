import { useCallback, useEffect, useState } from "react";
import { track, TrackOptions } from "track-property";

type UseTrackPropertyParams<P> = {
  ref: React.MutableRefObject<HTMLElement | null>;
} & Omit<TrackOptions<P>, "el">;

export const useTrackProperty = <P extends keyof HTMLElement>(
  callback: (value: HTMLElement[P] | null) => void,
  { ref, ...options }: UseTrackPropertyParams<P>,
  depsArr: any[] = []
) => {
  const [update, setUpdate] = useState({});

  useEffect(() => track(callback, { el: ref.current, ...options }), [
    ref,
    update,
    options.disabled,
    ...depsArr,
  ]);

  return useCallback(() => setUpdate({}), [setUpdate]);
};
