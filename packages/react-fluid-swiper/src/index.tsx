import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";

import { useItemTracker, useTransitionToChild, TransitionTo } from "./hooks";
import { insertStyles } from "./utils";
import styles, { prefix } from "./styles";

export { easings } from "./easings";
export {
  TransformFunction,
  makeRotationTransform,
  makeEase,
  MakeEase,
} from "./utils";

type SwiperOptions = Pick<
  SwiperProps,
  "defaultValue" | "onActiveChange" | "onPositionChange"
>;

const useInternalSwiper = ({
  defaultValue = 0,
  onActiveChange,
  onPositionChange,
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
    itemSelector: `.${prefix}-inner > li`,
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

type SwiperHookPayload = [
  active: number,
  transitionTo: TransitionTo,
  itemPositions: [number, number][]
];

export const createSwiper = () => {
  let notifyHook: ((...args: SwiperHookPayload) => void) | undefined;

  const useSwiper = () => {
    const [state, setState] = useState<SwiperHookPayload | undefined[]>([
      undefined,
      undefined,
      undefined,
    ]);

    notifyHook = (...args) => {
      for (let i = 0; i < args.length; i++) {
        if (args[i] !== state[i]) {
          setState(args);
          break;
        }
      }
    };

    return useMemo(() => {
      if (!state) return {};

      const [active, transitionTo, itemPositions] = state;

      return { active, transitionTo, itemPositions };
    }, state);
  };

  const Swiper: React.FC<SwiperProps> = ({
    children,
    className,
    transform,
    ...props
  }) => {
    const { ref, active: active, position, itemPositions } = useInternalSwiper(
      props
    );
    const transitionTo = useTransitionToChild(ref.current, itemPositions);

    useEffect(() => {
      notifyHook?.(active, transitionTo, itemPositions);
    }, [active, transitionTo, itemPositions]);

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

  return { useSwiper, Swiper };
};

export const { Swiper } = createSwiper();
