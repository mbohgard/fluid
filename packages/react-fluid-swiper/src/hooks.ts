import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useTrackProperty } from "track-property-hook";

import { debounce, def, partOf } from "./utils";
import { easings } from "./easings";

export type ItemPosition = [number, number];
export type RefData = { width: number; scrollWidth: number };

export type TrackerOptions = {
  disabled?: boolean;
  ref: React.MutableRefObject<HTMLElement | null>;
  itemSelector: string;
  startItem?: number;
  onChange?(position: number, middlePosition: number, refData: RefData): void;
  setActive?(value: number): void;
};

export const useItemTracker = ({
  disabled,
  ref,
  itemSelector,
  startItem = 0,
  onChange,
  setActive,
}: TrackerOptions) => {
  const [refData, setRefData] = useState<RefData>({ width: 0, scrollWidth: 0 });
  const positions = useRef<ItemPosition[]>([]);
  const last = useRef(-1);

  const recalculate = useTrackProperty(
    (pos) => {
      const { width: refW } = refData;
      const ps = positions.current;

      if (pos !== null && refW && ps.length) {
        const mPos = pos + refW / 2;
        onChange?.(pos, mPos, refData);

        if (setActive) {
          ps.forEach(([start, end], ix) => {
            if (mPos >= start && mPos < end && last.current !== ix) {
              setActive(ix);
              last.current = ix;
            }
          });
        }
      }
    },
    {
      disabled,
      ref,
      events: ["scroll"],
      mouseSupport: true,
      property: "scrollLeft",
    },
    [refData, positions]
  );

  const setPositions = useMemo(
    () =>
      !disabled
        ? debounce(() => {
            const track = ref.current;
            if (!track) return;

            const pos = positions.current;
            let np: ItemPosition[] = [];
            let equal = true;
            const lis = Array.from(track.querySelectorAll(itemSelector));
            const { x, width: w } = track.getBoundingClientRect();
            const scrollLeft = track.scrollLeft;

            setRefData({ width: w, scrollWidth: track.scrollWidth });

            lis.forEach((li, i) => {
              const { left, width } = li.getBoundingClientRect();

              const begin = left - x + scrollLeft;
              const end = begin + width;

              if (equal && pos[i]?.[0] !== begin && pos[i]?.[1] !== end)
                equal = false;

              np = [...np, [begin, end]];
            });

            if (startItem && !pos.length) {
              const [left, right] = np[startItem];
              const target = left + (right - left) / 2;

              track.scrollLeft = target - w / 2;
            }

            if (!equal) {
              positions.current = np;
              recalculate();
            }
          }, true)
        : undefined,
    [ref, recalculate]
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

export const useScrollTo = (el: HTMLElement | null) => {
  const timer = useRef<number>();

  return useCallback(
    (from: number, to: number, easing: Easings, ms: number) => {
      clearTimeout(timer.current);

      if (!el) return console.warn("No Swiper DOM element provided");

      const distance = to - from;
      const frames = 60 * (ms / 1000);
      const perFrame = distance / frames;
      let i = 1;

      const tick = () => {
        if (i !== frames + 1) {
          window.requestAnimationFrame(() => {
            const t = easings[easing](partOf(i * perFrame, distance));
            const target = Math.floor(t * distance + from);

            el.scrollLeft = target;
            i++;

            timer.current = window.setTimeout(tick, 1000 / 60);
          });
        }
      };

      tick();
    },
    [el]
  );
};
