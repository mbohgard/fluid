import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  debounce,
  partOf,
  getStyle,
  rect as getRect,
  window,
  Timer,
} from "fluid-utils";
import { useTrackProperty } from "track-property-hook";

import { easings, Easings } from "./easings";

export type ItemPosition = [number, number];
export type RefData = { width: number; scrollWidth: number };

export type TrackerOptions = {
  focusedMode: boolean;
  itemSelector: string;
  onChange?(position: number, middlePosition: number, refData: RefData): void;
  swiperEl?: HTMLElement | null;
  setActive?: React.Dispatch<React.SetStateAction<number>>;
  calculateHeight?: boolean;
  startItem?: number;
};

export const useItemTracker = ({
  focusedMode,
  itemSelector,
  onChange,
  swiperEl,
  setActive,
  calculateHeight,
  startItem = 0,
}: TrackerOptions) => {
  const refData = useRef<RefData>({ width: 0, scrollWidth: 0 });
  const rects = useRef(new Map<HTMLElement, DOMRect>());
  const last = useRef(-1);
  const [positions, setPositions] = useState<ItemPosition[]>([]);

  const rect = useCallback(
    (el: HTMLElement) =>
      rects.current.get(el) ?? rects.current.set(el, getRect(el)).get(el)!,
    [rects]
  );

  const recalculate = useTrackProperty(
    (pos) => {
      const { width: refW } = refData.current;

      if (pos !== null && refW && positions.length) {
        const mPos = pos + refW / 2;
        onChange?.(pos, mPos, refData.current);

        if (setActive) {
          positions.forEach(([start, end], ix) => {
            if (mPos >= start && mPos < end && last.current !== ix) {
              setActive(ix);
              last.current = ix;
            }
          });
        }
      }
    },
    {
      el: swiperEl,
      triggerOnEvents: ["scroll", "touchmove"],
      property: "scrollLeft",
    },
    [refData, positions, setActive, onChange, last]
  );

  const process = useMemo(
    () =>
      debounce(() => {
        if (!swiperEl) return;

        const pos = positions;
        let np: ItemPosition[] = [];
        let equal = true;
        const lis = Array.from(
          swiperEl.querySelectorAll<HTMLElement>(itemSelector)
        );
        rects.current.clear();

        // set correct margin of first/last item
        if (focusedMode) {
          lis.forEach((li, i, arr) => {
            const last = i === arr.length - 1;
            const type = !i ? "first" : last ? "last" : null;

            if (type) {
              li.style[type === "first" ? "marginLeft" : "marginRight"] = `${
                getRect(swiperEl).width / 2 - getRect(li).width / 2
              }px`;
            }
          });
        }

        const trackRect = getRect(swiperEl);
        const scrollLeft = swiperEl.scrollLeft;

        refData.current = {
          width: trackRect.width,
          scrollWidth: swiperEl.scrollWidth,
        };

        lis.forEach((li, i) => {
          const { left, width } = rect(li);
          const begin = left - trackRect.x + scrollLeft;
          const end = begin + width;

          if (equal && pos[i]?.[0] !== begin && pos[i]?.[1] !== end)
            equal = false;

          np = [...np, [begin, end]];
        });

        if (startItem && !pos.length) {
          const item = np[startItem];
          if (!item) return;

          const [left, right] = item;
          const target = left + (right - left) / 2;

          swiperEl.scrollLeft = target - trackRect.width / 2;
        }

        if (calculateHeight) {
          const paddingHeight = (
            ["paddingTop", "paddingBottom"] as const
          ).reduce(
            (acc, rule) =>
              acc + (parseInt(getStyle(lis[0]?.parentElement, rule)) || 0),
            0
          );
          swiperEl.parentElement!.style.height = `${
            lis.reduce((acc, li) => {
              const { height } = rect(li);

              return height > acc ? height : acc;
            }, 0) + paddingHeight
          }px`;
        }

        if (!equal) setPositions(np);
      }, true),
    [swiperEl, recalculate, rect]
  );

  useEffect(() => {
    if (!process) return;

    window?.addEventListener("resize", process);

    process();

    return () => window?.removeEventListener("resize", process);
  }, [process]);

  return { recalculate: process, itemPositions: positions };
};

export const useScrollTo = (el?: HTMLElement | null) => {
  const timer = useRef<Timer>();

  return useCallback(
    (from: number, to: number, easing: Easings, ms: number) => {
      clearTimeout(timer.current as number);

      if (!el) return console.warn("No Swiper DOM element provided");

      const distance = to - from;
      const frames = 60 * (ms / 1000);
      const perFrame = distance / frames;
      let i = 1;

      const tick = () => {
        if (i !== frames + 1) {
          window?.requestAnimationFrame(() => {
            const t = easings[easing](partOf(i * perFrame, distance));
            const target = Math.floor(t * distance + from);

            el.scrollLeft = target;
            i++;

            timer.current = setTimeout(tick, 1000 / 60);
          });
        }
      };

      tick();
    },
    [el]
  );
};

export const useChanged = <T>(value: T, cb: (previous: T) => void) => {
  const prev = useRef(value);

  useEffect(() => {
    if (prev.current !== value) cb(prev.current);

    prev.current = value;
  }, [value]);
};
