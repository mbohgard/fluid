import { def } from "fluid-utils";

import { ItemPosition, Easings, useScrollTo } from "./hooks";

const common = (el: HTMLElement | null, sTo: SwiperHookPayload[1]) => {
  const width = el?.getBoundingClientRect().width;

  return el && width
    ? {
        el,
        width,
        maxScroll: el.scrollWidth - width,
        scrollTo: (
          from: number,
          to: number,
          easing: Easings,
          duration: number
        ) => sTo(from, to, easing, duration),
      }
    : undefined;
};

export type SwiperHookPayload = [
  active: number,
  scrollTo: ReturnType<typeof useScrollTo>,
  itemPositions: ItemPosition[],
  scrollState: number,
  focusedMode: boolean,
  ref: React.MutableRefObject<HTMLDivElement | null>
];

export const getFocusedMethods = (
  [active, scrollToPos, itemPositions, , , ref]: SwiperHookPayload,
  defaultDuration: number,
  defaultEasing: Easings
) => {
  const c = common(ref.current, scrollToPos);
  if (!c) return {};

  const { el, width, scrollTo } = c;
  const transitionTo = (
    index: number,
    easing = defaultEasing,
    ms = defaultDuration
  ) => {
    const [left, right] = itemPositions[index] ?? [];

    if (def(left) && def(right)) {
      const middle = width / 2;
      const to = left + (right - left) / 2 - middle;
      const from = el.scrollLeft;

      scrollTo(from, to, easing, ms);
    } else
      console.warn(
        `Item with index ${index} doesn't exist among Swiper children`
      );
  };
  const len = itemPositions.length;
  const isFirst = !active;
  const lastIndex = len - 1;
  const isLast = active === lastIndex;
  const nextIndex = (active + 1) % len;
  const prevIndex = !active ? lastIndex : active - 1;
  const next = (loop = false) =>
    transitionTo(loop ? nextIndex : nextIndex || lastIndex);
  const previous = (loop = false) =>
    transitionTo(loop ? prevIndex : !active ? 0 : prevIndex);

  return { isFirst, isLast, next, previous, transitionTo };
};

export const getUnfocusedMethods = (
  [, scrollToPos, itemPositions, , , ref]: SwiperHookPayload,
  defaultDuration: number,
  defaultEasing: Easings
) => {
  const c = common(ref.current, scrollToPos);
  if (!c) return {};

  const { el, width, maxScroll, scrollTo } = c;
  const itemAt = (pos: number) =>
    itemPositions.find(([right, left]) => pos >= right && pos <= left);
  const trim = (pos: number) =>
    pos <= 0 ? 0 : pos > maxScroll ? maxScroll : pos;
  const action = (dir: "fw" | "bw") => (
    offset = 0,
    easing = defaultEasing,
    duration = defaultDuration
  ) => {
    const fw = dir === "fw";
    const sp = el.scrollLeft;
    const target = sp + (fw ? width : -width);
    const itemPos = itemAt(target)?.[fw ? 0 : 1];
    const args = [sp, trim((itemPos ?? target) - offset)] as const;

    return scrollTo(...args, easing, duration);
  };

  return {
    next: action("fw"),
    previous: action("bw"),
  };
};
