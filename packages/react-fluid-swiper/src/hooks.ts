import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useTrackProperty } from "track-property-hook";

import { debounce, partOf, getStyle } from "./utils";
import { easings } from "./easings";

export type ItemPosition = [number, number];
export type RefData = { width: number; scrollWidth: number };

export type TrackerOptions = {
  disabled?: boolean;
  ref: React.MutableRefObject<HTMLElement | null>;
  itemSelector: string;
  startItem?: number;
  setHeight?: boolean;
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
  setHeight,
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

            if (setHeight) {
              const paddingHeight = ([
                "paddingTop",
                "paddingBottom",
              ] as const).reduce(
                (acc, rule) =>
                  acc + (parseInt(getStyle(lis[0]?.parentElement, rule)) || 0),
                0
              );
              track.parentElement!.style.height = `${
                lis.reduce((acc, li) => {
                  const { height } = li.getBoundingClientRect();

                  return height > acc ? height : acc;
                }, 0) + paddingHeight
              }px`;
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
