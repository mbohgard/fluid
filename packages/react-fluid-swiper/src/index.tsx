import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  useLayoutEffect,
} from "react";

import { insertStyles, window } from "fluid-utils";
import draggable from "drag-to-scroll";

import {
  useItemTracker,
  TrackerOptions,
  useScrollTo,
  ItemPosition,
  useChanged,
} from "./hooks";
import styles, { prefix } from "./styles";
import { getMethods } from "./methods";
import { TransformFunction } from "./utils";
import { Easings } from "./easings";

export { easings } from "./easings";
export {
  TransformFunction,
  makeRotationTransform,
  makeEase,
  MakeEase,
} from "./utils";

export type UseSwiperOptions<T extends boolean> = {
  defaultActivated?: T extends false ? never : number;
  defaultTransitionDuration?: number;
  defaultTransitionEasing?: Easings;
  dynamicHeight?: boolean;
  focusedMode?: T;
  onPositionChange?(
    scrollPosition: number,
    middlePosition: number,
    trackWidth: number
  ): void;
} & Partial<Pick<InternalProps, "transform">>;

export const useIsomorphicLayoutEffect = window ? useLayoutEffect : useEffect;

export const useSwiper = <T extends boolean = true>({
  defaultActivated,
  defaultTransitionDuration: ms = 250,
  defaultTransitionEasing: easing = "easeInOutQuad",
  dynamicHeight = true,
  // eslint-disable-next-line
  focusedMode = true as any,
  onPositionChange,
  transform,
}: UseSwiperOptions<T> = {}) => {
  const [comp, setComponentData] = useState<ComponentData>({});
  const [activeIndex, setActiveIndex] = useState(
    focusedMode ? defaultActivated || 0 : -1
  );
  const [scrollState, setScrollState] = useState(0);

  useIsomorphicLayoutEffect(() => {
    insertStyles(styles(), "fluid-swiper-styles");
  }, []);

  const onChange = useCallback<NonNullable<TrackerOptions["onChange"]>>(
    (pos, mPos, { width, scrollWidth }) => {
      comp.setPosition?.(mPos);
      onPositionChange?.(pos, mPos, width);

      setScrollState(
        !pos ? -1 : pos >= Math.floor(scrollWidth - width) ? 1 : 0
      );
    },
    [comp, onPositionChange, setScrollState]
  );

  const { itemPositions, recalculate } = useItemTracker({
    focusedMode,
    itemSelector: `.${prefix}-inner > li`,
    onChange,
    swiperEl: comp.swiperEl,
    setActive: focusedMode ? setActiveIndex : undefined,
    calculateHeight: dynamicHeight,
    startItem: defaultActivated,
  });

  useEffect(() => draggable({ el: comp.swiperEl }), [comp]);
  const scrollToPosition = useScrollTo(comp.swiperEl);

  const swiperProps: InternalProps = useMemo(
    () => ({
      active: activeIndex,
      admin: setComponentData,
      dynamicHeight,
      itemPositions,
      recalculate,
      transform,
    }),
    [activeIndex, dynamicHeight, itemPositions, recalculate, transform]
  );

  const methods = useMemo(
    () =>
      getMethods(focusedMode, {
        active: activeIndex,
        defaultDuration: ms,
        defaultEasing: easing,
        itemPositions,
        swiperEl: comp.swiperEl,
        scrollToPosition,
      }),
    [
      activeIndex,
      itemPositions,
      ms,
      easing,
      focusedMode,
      comp,
      scrollToPosition,
    ]
  );

  return {
    atEnd: scrollState > 0,
    atStart: scrollState < 0,
    itemPositions,
    swiperProps,
    recalculate,
    ...methods,
  };
};

type ComponentData = {
  setPosition?: (pos: number) => void;
  swiperEl?: HTMLElement | null;
};

type InternalProps = {
  active: number;
  admin(data: ComponentData): void;
  dynamicHeight: boolean;
  itemPositions: ItemPosition[];
  recalculate(): void;
  transform?: TransformFunction;
};

export type SwiperProps = {
  className?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
} & InternalProps;

export const Swiper = React.forwardRef<HTMLDivElement, SwiperProps>(
  (
    {
      active,
      admin,
      children,
      className,
      dynamicHeight,
      itemPositions,
      recalculate,
      transform,
      style,
    },
    ref
  ) => {
    const swiperRef = useRef(null);
    const [position, setPosition] = useState(0);

    useEffect(() => {
      if (swiperRef.current)
        admin({ swiperEl: swiperRef.current, setPosition });
    }, [setPosition, swiperRef]);

    const childrenCount = React.Children.count(children);
    const itemWrapperClasses = `${prefix}-item-wrapper ${
      dynamicHeight ? `${prefix}-item-wrapper--dynamic` : ""
    }`;

    useChanged(React.Children.count(children), recalculate);

    return (
      <div
        className={`${className || ""} ${prefix}-container`}
        style={style}
        ref={ref}
      >
        <div className={`${prefix}`} ref={swiperRef}>
          <ul className={`${prefix}-inner`}>
            {React.Children.map(children, (el, ix) => {
              const isActive = active === ix;
              const itemPos = itemPositions[ix];

              return (
                <li
                  className={`${itemWrapperClasses} ${
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
                    className={`${prefix}-item ${isActive ? "active" : ""}`}
                    style={{
                      visibility: itemPos ? undefined : "hidden",
                      transform: itemPos && transform?.(position, itemPos),
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
  }
);

Swiper.displayName = "Swiper";
