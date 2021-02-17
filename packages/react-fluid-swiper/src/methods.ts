import { def } from "fluid-utils";

import { ItemPosition, useScrollTo } from "./hooks";
import { Easings } from "./easings";

const common = (
  el: HTMLElement | null,
  sTo: MethodsOptions["scrollToPosition"]
) => {
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

type MethodsOptions = {
  active: number;
  defaultDuration: number;
  defaultEasing: Easings;
  scrollToPosition: ReturnType<typeof useScrollTo>;
  itemPositions: ItemPosition[];
  ref: React.MutableRefObject<HTMLDivElement | null>;
};

const focused = ({
  active,
  scrollToPosition,
  itemPositions,
  ref,
  defaultDuration,
  defaultEasing,
}: MethodsOptions) => {
  const c = common(ref.current, scrollToPosition);
  if (!c) return { active };

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

  return { active, isFirst, isLast, next, previous, transitionTo };
};

const unfocused = ({
  scrollToPosition,
  itemPositions,
  ref,
  defaultDuration,
  defaultEasing,
}: MethodsOptions) => {
  const c = common(ref.current, scrollToPosition);
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

export const getMethods = <T extends boolean>(
  focusedMode: T,
  options: MethodsOptions
): T extends true ? ReturnType<typeof focused> : ReturnType<typeof unfocused> =>
  (focusedMode ? focused(options) : unfocused(options)) as any; // eslint-disable-line
