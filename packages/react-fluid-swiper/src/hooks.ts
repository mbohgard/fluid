import React, { useCallback, useEffect, useMemo, useRef } from "react";

import { useTrackProperty } from "track-property-hook";

import { debounce } from "./utils";

export type SwiperOptions = {
  disabled?: boolean;
  ref: React.MutableRefObject<HTMLElement | null>;
  itemSelector: string;
  onChange?(position: number): void;
  setActive(value: number): void;
};

export const useItemTracker = ({
  disabled,
  ref,
  itemSelector,
  onChange,
  setActive,
}: SwiperOptions) => {
  const trackWidth = useRef<number>(0);
  const positions = useRef<[number, number][]>([]);
  const last = useRef(-1);

  const recalculate = useTrackProperty(
    (pos) => {
      const width = trackWidth.current;
      const ps = positions.current;

      if (pos !== null && width && ps.length) {
        const mPos = pos + width / 2;
        onChange?.(mPos);

        ps.forEach(([start, end], ix) => {
          if (mPos >= start && mPos < end && last.current !== ix) {
            setActive(ix);
            last.current = ix;
          }
        });
      }
    },
    {
      disabled,
      ref,
      events: ["scroll"],
      mouseSupport: true,
      property: "scrollLeft",
    }
  );

  const setPositions = useMemo(
    () =>
      !disabled
        ? debounce(() => {
            const track = ref.current;

            if (!track) return;

            positions.current = [];

            const lis = Array.from(track.querySelectorAll(itemSelector));
            const { x, width: w } = track.getBoundingClientRect();
            const scrollLeft = track.scrollLeft;

            trackWidth.current = w;

            lis.forEach((li) => {
              const { left, width } = li.getBoundingClientRect();

              const begin = left - x + scrollLeft;
              const end = begin + width;

              positions.current = [...positions.current, [begin, end]];
            });

            recalculate();
          }, true)
        : undefined,
    [ref.current, recalculate]
  );

  useEffect(() => {
    if (!setPositions) return;

    window.addEventListener("resize", setPositions);

    setPositions();

    return () => window.removeEventListener("resize", setPositions);
  }, [setPositions]);

  return { recalculate, itemPositions: positions.current };
};

export const useTransitionToChild = (
  parent: HTMLElement | null,
  selector: string
) => {
  return useCallback(
    (index: number) => {
      const target =
        parent &&
        Array.from(parent.querySelectorAll(selector)).find(
          (_, ix) => ix === index
        );

      console.log(target ? index : "Not found");
    },
    [parent, selector]
  );
};
