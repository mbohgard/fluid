import React, { useState, useRef, useEffect, useCallback } from "react";

import { useSwiper as _useSwiper } from "./hook";
import { makeEase as _makeEase, insertStyles } from "./utils";
import styles, { prefix } from "./styles";

export const useSwiper = _useSwiper;
export const makeEase = _makeEase;

type RotationTransformOptions = {
  threshold?: number;
  maxRotation?: number;
};

export const makeRotationTransform = ({
  threshold: th = 300,
  maxRotation: mr = 60,
}: RotationTransformOptions) => (
  x: number,
  [begin, end]: [number, number] = [0, 0]
) => {
  if (!begin || !end) return undefined;

  const rotateBefore = makeEase({
    from: [begin - th, -mr],
    to: [begin, -30],
  });
  const rotateAfter = makeEase({
    from: [end, 30],
    to: [end + th, mr],
  });
  const toFlat = makeEase({
    from: [begin, -30],
    to: [begin + 70, 0],
    easing: "easeOutQuad",
  });
  const fromFlat = makeEase({
    from: [end - 70, 0],
    to: [end, 30],
    easing: "easeInQuad",
  });

  const deg =
    rotateBefore(x) ??
    rotateAfter(x) ??
    toFlat(x) ??
    fromFlat(x) ??
    (x > end ? mr : x < begin ? -mr : 0);

  return `rotateY(${deg}deg)`;
};

type SwiperItemProps = {
  active?: boolean;
  className?: string;
  style?: React.CSSProperties;
  itemStyle?: React.CSSProperties;
};

const SwiperItem: React.FC<SwiperItemProps> = ({
  active,
  children,
  className,
  style,
  itemStyle,
}) => (
  <li
    className={`${className || ""} ${prefix}-item-wrapper ${
      active ? "active" : ""
    }`}
    style={style}
  >
    <div
      className={`${prefix}-item ${active ? "active" : ""}`}
      style={itemStyle}
    >
      {children}
    </div>
  </li>
);

type SwiperProps = {
  children?: React.ReactNode;
  className?: string;
  defaultValue?: number;
  onActiveChange?(index: number): void;
  onPositionChange?(position: number): void;
  transform?(
    position: number,
    itemPosition: [number, number]
  ): string | undefined;
};

export const Swiper = React.forwardRef<HTMLDivElement, SwiperProps>(
  (
    {
      children,
      className,
      defaultValue = 0,
      onActiveChange,
      onPositionChange,
      transform,
    },
    ref
  ) => {
    const innerRef = useRef<HTMLDivElement | null>(null);
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

    const { itemPositions } = useSwiper({
      ref: innerRef,
      setActive,
      onChange,
      itemSelector: "li",
    });

    useEffect(() => {
      onActiveChange?.(active);
    }, [active]);

    const childrenCount = React.Children.count(children);

    return (
      <div className={`${className || ""} ${prefix}-container`} ref={ref}>
        <div className={`${prefix}`} ref={innerRef}>
          <ul className={`${prefix}-inner`}>
            {React.Children.map(children, (el, ix) => {
              const isActive = active === ix;
              const transformation = transform?.(position, itemPositions[ix]);

              return (
                <SwiperItem
                  active={isActive}
                  style={{
                    zIndex: isActive
                      ? childrenCount
                      : ix > active
                      ? childrenCount - ix
                      : 0,
                  }}
                  itemStyle={{
                    background: "red",
                    transform: transformation,
                  }}
                >
                  {el}
                </SwiperItem>
              );
            })}
          </ul>
        </div>
      </div>
    );
  }
);
