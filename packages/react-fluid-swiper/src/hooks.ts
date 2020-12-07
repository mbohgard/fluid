import React, { useCallback, useEffect, useMemo, useRef } from "react";

import { useTrackProperty } from "track-property-hook";

import { debounce, def, partOf } from "./utils";
import { easings } from "./easings";

export type SwiperOptions = {
  disabled?: boolean;
  ref: React.MutableRefObject<HTMLElement | null>;
  itemSelector: string;
  onChange?(position: number): void;
  setActive(value: number): void;
};

export type ItemPositions = [number, number][];

export const useItemTracker = ({
  disabled,
  ref,
  itemSelector,
  onChange,
  setActive,
}: SwiperOptions) => {
  const trackWidth = useRef<number>(0);
  const positions = useRef<ItemPositions>([]);
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
            const pos = positions.current;
            let np: ItemPositions = [];
            let equal = true;

            if (!track) return;

            const lis = Array.from(track.querySelectorAll(itemSelector));
            const { x, width: w } = track.getBoundingClientRect();
            const scrollLeft = track.scrollLeft;

            trackWidth.current = w;

            lis.forEach((li, i) => {
              const { left, width } = li.getBoundingClientRect();

              const begin = left - x + scrollLeft;
              const end = begin + width;

              if (equal && pos[i]?.[0] !== begin && pos[i]?.[1] !== end)
                equal = false;

              np = [...np, [begin, end]];
            });

            if (!equal) {
              positions.current = np;
              recalculate();
            }
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

export type Easings = keyof typeof easings;

export const useTransitionToChild = (
  el: HTMLElement | null,
  positions: ([number, number] | undefined)[]
) => {
  const timer = useRef<number>();

  return useCallback(
    (index: number) => (easing: Easings, ms: number) => {
      clearTimeout(timer.current);

      if (!el) throw Error("No Swiper DOM element provided");

      const [left, right] = positions[index] ?? [];

      if (def(left) && def(right)) {
        const middle = el.getBoundingClientRect().width / 2;
        const target = left + (right - left) / 2 - middle;
        const current = el.scrollLeft;
        const distance = target - current;
        const frames = 60 * (ms / 1000);
        const perFrame = distance / frames;
        let i = 1;

        const tick = () => {
          if (i !== frames) {
            window.requestAnimationFrame(() => {
              const t = easings[easing](partOf(i * perFrame, distance));

              el.scrollLeft = t * distance + current;
              i++;

              timer.current = window.setTimeout(tick, 1000 / 60);
            });
          }
        };

        tick();
      } else
        throw Error(`Child of index ${index} not found in Swiper component`);
    },
    [el, positions]
  );
};
