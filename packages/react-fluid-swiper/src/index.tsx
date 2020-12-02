import React, { useState, useRef, useEffect, useCallback } from "react";

import { easings as _easings } from "./easings";
import { useItemTracker, useTransitionToChild } from "./hooks";
import { insertStyles } from "./utils";
import styles, { prefix } from "./styles";

export {
  TransformFunction,
  makeRotationTransform,
  makeEase,
  MakeEase,
} from "./utils";

export const easings = _easings;

type SwiperOptions = Pick<
  SwiperProps,
  "defaultValue" | "onActiveChange" | "onPositionChange"
> & {
  itemSelector: string;
};

const useSwiper = ({
  defaultValue = 0,
  onActiveChange,
  onPositionChange,
  itemSelector,
}: SwiperOptions) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(defaultValue);
  const [position, setPosition] = useState(0);

  useEffect(() => {
    insertStyles(styles);
  }, []);

  const onChange = useCallback(
    (position: number) => {
      setPosition(position);
      onPositionChange?.(position);
    },
    [setPosition, onPositionChange]
  );

  const { itemPositions } = useItemTracker({
    ref,
    setActive,
    onChange,
    itemSelector,
  });

  useEffect(() => {
    onActiveChange?.(active);
  }, [active]);

  return { active, position, itemPositions, ref };
};

type SwiperProps = {
  className?: string;
  defaultValue?: number;
  onActiveChange?(index: number): void;
  onPositionChange?(position: number): void;
  transform?(
    position: number,
    itemPosition: [number, number]
  ): string | undefined;
};

type TransitionTo = (
  index: number,
  easing?: keyof typeof easings,
  ms?: number
) => void;

export const createSwiper = () => {
  let f: TransitionTo | undefined;

  const transitionTo: TransitionTo = (...args) =>
    f
      ? f(...args)
      : console.warn("This Swiper instance hasn't been mounted yet.");

  const Swiper: React.FC<SwiperProps> = ({
    children,
    className,
    transform,
    ...props
  }) => {
    const itemSelector = `.${prefix}-inner > li`;
    const { ref, active, position, itemPositions } = useSwiper({
      itemSelector,
      ...props,
    });

    f = useTransitionToChild(ref.current, itemSelector);

    const childrenCount = React.Children.count(children);

    return (
      <div className={`${className || ""} ${prefix}-container`}>
        <div className={`${prefix}`} ref={ref}>
          <ul className={`${prefix}-inner`}>
            {React.Children.map(children, (el, ix) => {
              const isActive = active === ix;
              const transformation = transform?.(position, itemPositions[ix]);

              return (
                <li
                  className={`${prefix}-item-wrapper ${active ? "active" : ""}`}
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

  return { transitionTo, Swiper };
};

export const { Swiper } = createSwiper();
