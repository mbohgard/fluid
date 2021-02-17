import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  useLayoutEffect,
} from "react";

import { insertStyles } from "fluid-utils";
import draggable from "drag-to-scroll";

import {
  useItemTracker,
  TrackerOptions,
  useScrollTo,
  ItemPosition,
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

export type UseSwiperOptions<T extends boolean = true> = {
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

export const useSwiper = <T extends boolean>({
  defaultActivated,
  defaultTransitionDuration: ms = 250,
  defaultTransitionEasing: easing = "easeInOutQuad",
  dynamicHeight = true,
  // eslint-disable-next-line
  focusedMode = true as any,
  onPositionChange,
  transform,
}: UseSwiperOptions<T> = {}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const admin = useRef<AdminMethods>({});
  const [activeIndex, setActiveIndex] = useState(
    focusedMode ? defaultActivated || 0 : -1
  );
  const [scrollState, setScrollState] = useState(0);

  useLayoutEffect(() => {
    insertStyles(styles(), "fluid-swiper-styles");
  }, []);

  const onChange = useCallback<NonNullable<TrackerOptions["onChange"]>>(
    (pos, mPos, { width, scrollWidth }) => {
      admin.current.setPosition?.(mPos);
      onPositionChange?.(pos, mPos, width);

      setScrollState(
        !pos ? -1 : pos >= Math.floor(scrollWidth - width) ? 1 : 0
      );
    },
    [admin, onPositionChange, setScrollState]
  );

  const { itemPositions, recalculate } = useItemTracker({
    focusedMode,
    itemSelector: `.${prefix}-inner > li`,
    onChange,
    ref,
    setActive: focusedMode ? setActiveIndex : undefined,
    calculateHeight: dynamicHeight,
    startItem: defaultActivated,
  });

  useEffect(() => draggable({ el: ref.current }), [ref]);
  const scrollToPosition = useScrollTo(ref.current);

  const swiperProps: InternalProps = useMemo(
    () => ({
      active: activeIndex,
      admin: (methods: AdminMethods) => (admin.current = methods),
      dynamicHeight,
      itemPositions,
      swiperRef: ref,
      transform,
    }),
    [activeIndex, dynamicHeight, itemPositions, ref, transform]
  );

  const methods = useMemo(
    () =>
      getMethods(focusedMode, {
        active: activeIndex,
        defaultDuration: ms,
        defaultEasing: easing,
        itemPositions,
        ref,
        scrollToPosition,
      }),
    [activeIndex, itemPositions, ms, easing, focusedMode, ref, scrollToPosition]
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

type AdminMethods = {
  setPosition?: (pos: number) => void;
};

type InternalProps = {
  active: number;
  admin(methods: AdminMethods): void;
  dynamicHeight: boolean;
  itemPositions: ItemPosition[];
  swiperRef: React.MutableRefObject<HTMLDivElement | null>;
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
      swiperRef,
      transform,
      style,
    },
    ref
  ) => {
    const [position, setPosition] = useState(0);

    useEffect(() => {
      admin({ setPosition: (pos: number) => transform && setPosition(pos) });
    }, [setPosition]);

    const childrenCount = React.Children.count(children);
    const itemWrapperClasses = `${prefix}-item-wrapper ${
      dynamicHeight ? `${prefix}-item-wrapper--dynamic` : ""
    }`;

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
                      transform: transform?.(position, itemPositions[ix]),
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
