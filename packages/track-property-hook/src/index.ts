import { useCallback, useEffect, useState } from "react";
import { track, TrackOptions } from "track-property";

type UseTrackPropertyParams<P> = {
  ref: React.MutableRefObject<HTMLElement | null>;
} & Omit<TrackOptions<P>, "el">;

export const useTrackProperty = <P extends keyof HTMLElement>(
  callback: (value: HTMLElement[P] | null) => void,
  { ref, ...options }: UseTrackPropertyParams<P>
) => {
  const [update, setUpdate] = useState({});

  useEffect(() => track(callback, { el: ref.current, ...options }), [
    ref.current,
    update,
    options.disabled,
  ]);

  return useCallback(() => setUpdate({}), [setUpdate]);
};
