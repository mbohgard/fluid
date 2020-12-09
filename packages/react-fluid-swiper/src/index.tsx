import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";

import {
  useItemTracker,
  TrackerOptions,
  useTransitionToChild,
  useScrollTo,
  Easings,
  ItemPosition,
} from "./hooks";
import { def, insertStyles } from "./utils";
import styles, {
  defaultPrefix as prefix,
  defaultFocusedPrefix as focusedPrefix_,
} from "./styles";

export { easings } from "./easings";
export {
  TransformFunction,
  makeRotationTransform,
  makeEase,
  MakeEase,
} from "./utils";

type SwiperOptions = Pick<
  SwiperProps,
  "defaultActivated" | "focusedMode" | "onActiveChange" | "onPositionChange"
>;

const useInternalSwiper = ({
  defaultActivated,
  focusedMode,
  onActiveChange,
  onPositionChange,
}: SwiperOptions) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);
  const [position, setPosition] = useState(0);
  const [ready, setReady] = useState(false);
  const [scrollState, setScrollState] = useState(0);

  useEffect(() => {
    insertStyles(styles());
    setReady(true);
  }, []);

  const onChange = useCallback<NonNullable<TrackerOptions["onChange"]>>(
    (pos, mPos, { width, scrollWidth }) => {
      setPosition(mPos);
      onPositionChange?.(mPos);
      if (ref.current)
        setScrollState(!pos ? -1 : pos === scrollWidth - width ? 1 : 0);
    },
    [setPosition, onPositionChange]
  );

  const { itemPositions } = useItemTracker({
    ref,
    setActive: focusedMode ? setActive : undefined,
    onChange,
    itemSelector: `.${prefix}-inner > li`,
    startItem: defaultActivated,
  });

  useEffect(() => {
    if (focusedMode) onActiveChange?.(active);
  }, [active]);

  return {
    ready,
    active: focusedMode ? active : -1,
    position,
    itemPositions,
    scrollState,
    ref,
  };
};

type SwiperProps = {
  className?: string;
  defaultActivated?: number;
  focusedMode?: boolean;
  onActiveChange?(index: number): void;
  onPositionChange?(position: number): void;
  transform?(position: number, itemPosition: ItemPosition): string | undefined;
};

type SwiperHookPayload = [
  active: number,
  makeTransition: ReturnType<typeof useTransitionToChild>,
  scrollTo: ReturnType<typeof useScrollTo>,
  itemPositions: ItemPosition[],
  scrollState: number,
  focusedMode: boolean,
  ref: React.MutableRefObject<HTMLDivElement | null>
];

export type TransitionTo = (
  index: number,
  easing?: Easings,
  ms?: number
) => void;

export type ScrollTo = (
  from: number,
  to: number,
  easing?: Easings,
  ms?: number
) => void;

const getFocusedMethods = ([active, t, , itemPositions]: SwiperHookPayload) => {
  const transitionTo: TransitionTo = (
    index,
    easings = "easeInOutQuad",
    ms = 250
  ) =>
    itemPositions[index]
      ? t?.(index)(easings, ms)
      : console.warn("Missing index among Swiper items");
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

const getUnfocusedMethods = ([, , sTo, ip, , , ref]: SwiperHookPayload) => {
  // ip = itemPositions
  const el = ref.current;

  if (!el) return {};

  const { width } = el.getBoundingClientRect();
  const maxScroll = el.scrollWidth - width;

  const scrollTo: ScrollTo = (from, to, easing = "easeInOutQuad", ms = 250) =>
    sTo(from, to, easing, ms);
  const itemAt = (pos: number) =>
    ip.find(([right, left]) => pos >= right && pos <= left);
  const trim = (pos: number) =>
    pos <= 0 ? 0 : pos > maxScroll ? maxScroll : pos;
  const step = (dir: "fw" | "bw", offset: number) => {
    const fw = dir === "fw";
    const sp = el.scrollLeft;
    const target = sp + (fw ? width : -width);
    const itemPos = itemAt(target)?.[fw ? 0 : 1];

    return [sp, trim((itemPos ?? target) - offset)] as const;
  };

  return {
    next: (offset = 0) => scrollTo(...step("fw", offset)),
    previous: (offset = 0) => scrollTo(...step("bw", offset)),
  };
};

type SwiperHookReturn = ReturnType<typeof getFocusedMethods> &
  ReturnType<typeof getUnfocusedMethods> & {
    active: number;
    itemPositions: ItemPosition[];
    atStart: boolean;
    atEnd: boolean;
  };

export const createSwiper = () => {
  let notifyHook: ((...args: SwiperHookPayload) => void) | undefined;

  const useSwiper = () => {
    const [state, setState] = useState<SwiperHookPayload | undefined[]>(
      Array(7).fill(undefined)
    );

    notifyHook = (...args) => {
      for (let i = 0; i < args.length; i++) {
        if (args[i] !== state[i]) {
          setState(args);
          break;
        }
      }
    };

    return useMemo<SwiperHookReturn | Partial<SwiperHookReturn>>(() => {
      const [active, , , itemPositions, scrollState, focusedMode] = state;

      if (def(state[0]) && state[1] && state[2]) {
        const s = state as SwiperHookPayload;
        const methods = focusedMode
          ? getFocusedMethods(s)
          : getUnfocusedMethods(s);

        return {
          active,
          itemPositions,
          atStart: scrollState! < 0,
          atEnd: scrollState! > 0,
          ...methods,
        };
      } else return {};
    }, state);
  };

  const Swiper: React.FC<SwiperProps> = ({
    children,
    className,
    focusedMode = true,
    transform,
    ...props
  }) => {
    const {
      ref,
      active,
      position,
      itemPositions,
      scrollState,
      ready,
    } = useInternalSwiper({
      focusedMode,
      ...props,
    });
    const transitionTo = useTransitionToChild(ref.current, itemPositions);
    const scrollTo = useScrollTo(ref.current);

    const notifyHookDeps = [
      active,
      transitionTo,
      scrollTo,
      itemPositions,
      scrollState,
      focusedMode,
      ref,
    ] as const;

    useEffect(() => {
      notifyHook?.(...notifyHookDeps);
    }, notifyHookDeps);

    const childrenCount = React.Children.count(children);
    const focusedPrefix = focusedMode ? focusedPrefix_ : prefix;
    const style = useMemo(() => ({ opacity: ready ? 1 : 0 }), [ready]);

    return (
      <div className={`${className || ""} ${prefix}-container`} style={style}>
        <div className={`${prefix}`} ref={ref}>
          <ul className={`${prefix}-inner`}>
            {React.Children.map(children, (el, ix) => {
              const isActive = active === ix;
              const transformation = transform?.(position, itemPositions[ix]);

              return (
                <li
                  className={`${focusedPrefix}-item-wrapper ${
                    isActive ? "active" : ""
                  }`}
                  style={{
                    zIndex: isActive
                      ? childrenCount
                      : ix > active
                      ? childrenCount - ix
                      : 0,
                  }}
                >
                  <div
                    className={`${focusedPrefix}-item ${
                      isActive ? "active" : ""
                    }`}
                    style={{
                      background: "red",
                      transform: transformation,
                    }}
                  >
                    {el}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  };

  return [useSwiper, Swiper] as const;
};

export const [, Swiper] = createSwiper();
