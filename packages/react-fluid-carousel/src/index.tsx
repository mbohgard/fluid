import React, { useEffect, useMemo, useRef, useState } from "react";

import {
  makeCarousel,
  CarouselInit,
  CarouselMethods,
  CarouselOptions,
  PlayState,
} from "fluid-carousel";

export const useCarousel = (
  options: Omit<CarouselOptions, "onActiveChange" | "onPlayStateChange"> = {}
) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const instance = useRef<CarouselInit | undefined>(undefined);
  const [methods, setMethods] = useState<CarouselMethods | {}>({});
  const [[activeIndex, activeName], setActive] = useState<[number, string]>([
    options.defaultActive || 0,
    "",
  ]);
  const [playState, setPlayState] = useState<PlayState>(
    options.autoplay ? "playing" : "stopped"
  );

  useEffect(() => {
    if (ref.current) {
      if (!instance.current) {
        instance.current = makeCarousel(ref.current);
      }

      setMethods(
        instance.current({
          ...options,
          onActiveChange: (...args) => setActive(args),
          onPlayStateChange: setPlayState,
        })
      );
    }
  }, [ref, options]);

  const props = useMemo(
    () => ({
      carouselRef: ref,
    }),
    [ref]
  );

  return {
    props,
    ...methods,
    activeIndex,
    activeName,
    playState,
  };
};

type Div = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;

export type CarouselProps = {
  carouselRef: React.MutableRefObject<HTMLDivElement | null>;
} & Omit<Div, "ref">;

export const Carousel: React.FC<CarouselProps> = ({
  carouselRef,
  children,
  ...props
}) => (
  <div {...props} ref={carouselRef}>
    {children}
  </div>
);

export type SlideProps = {
  name?: string;
} & Omit<Div, "name">;

export const Slide: React.FC<SlideProps> = ({ children, name }) => (
  <div data-carousel-slide={name || "true"}>{children}</div>
);

export type StaggeredElementProps<T extends HTMLElement> = {
  type?: keyof React.ReactHTML;
  order: number;
} & React.HTMLAttributes<T>;

export const StaggeredElement = <T extends HTMLElement>({
  type = "div",
  order,
  ...props
}: StaggeredElementProps<T>) =>
  React.createElement(type, { ...props, ["data-carousel-staggered"]: order });
