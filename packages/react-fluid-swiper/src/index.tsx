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
  useScrollTo,
  ItemPosition,
  Easings,
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
import {
  getFocusedMethods,
  getUnfocusedMethods,
  SwiperHookPayload,
} from "./methods";

type SwiperHookOptions = {
  defaultTransitionDuration?: number;
  defaultTransitionEasing?: Easings;
};

type SwiperHookReturn = ReturnType<typeof getFocusedMethods> &
  ReturnType<typeof getUnfocusedMethods> & {
    active: number;
    itemPositions: ItemPosition[];
    atStart: boolean;
    atEnd: boolean;
  };

type UseSwiper = (
  options?: SwiperHookOptions
) => SwiperHookReturn | Partial<SwiperHookReturn>;

export type SwiperProps = {
  className?: string;
  defaultActivated?: number;
  focusedMode?: boolean;
  dynamicHeight?: boolean;
  onActiveChange?(index: number): void;
  onPositionChange?(position: number): void;
  transform?(position: number, itemPosition: ItemPosition): string | undefined;
};

export const createSwiper = () => {
  let notifyHook: ((...args: SwiperHookPayload) => void) | undefined;

  const useSwiper: UseSwiper = ({
    defaultTransitionDuration: ms = 250,
    defaultTransitionEasing: easing = "easeInOutQuad",
  } = {}) => {
    const [state, setState] = useState<SwiperHookPayload | undefined[]>(
      Array(6).fill(undefined)
    );

    notifyHook = (...args) => {
      for (let i = 0; i < args.length; i++) {
        if (args[i] !== state[i]) {
          setState(args);
          break;
        }
      }
    };

    return useMemo(() => {
      const [active, , itemPositions, scrollState, focusedMode] = state;

      if (def(state[0]) && state[1] && state[2]) {
        const s = state as SwiperHookPayload;
        const methods = focusedMode
          ? getFocusedMethods(s, ms, easing)
          : getUnfocusedMethods(s, ms, easing);

        return {
          active,
          itemPositions,
          atStart: scrollState! < 0,
          atEnd: scrollState! > 0,
          ...methods,
        };
      } else return {};
    }, [ms, easing, ...state]);
  };

  const Swiper: React.FC<SwiperProps> = ({
    children,
    className,
    defaultActivated,
    dynamicHeight = true,
    focusedMode = true,
    transform,
    onActiveChange,
    onPositionChange,
  }) => {
    const ref = useRef<HTMLDivElement | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [position, setPosition] = useState(0);
    const [ready, setReady] = useState(false);
    const [scrollState, setScrollState] = useState(0);

    useEffect(() => {
      insertStyles(styles({ dynamicHeight }));
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
      setActive: focusedMode ? setActiveIndex : undefined,
      onChange,
      itemSelector: `.${prefix}-inner > li`,
      startItem: defaultActivated,
      setHeight: dynamicHeight,
    });

    useEffect(() => {
      if (focusedMode) onActiveChange?.(activeIndex);
    }, [activeIndex]);

    const scrollTo = useScrollTo(ref.current);

    const active = focusedMode ? activeIndex : -1;

    const notifyHookDeps = [
      active,
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
