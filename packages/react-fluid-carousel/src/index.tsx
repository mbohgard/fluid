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
  const [methods, setMethods] = useState<
    CarouselMethods | Partial<CarouselMethods>
  >({});
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

  useEffect(() => () => methods.cleanup?.(), []);

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

export type SlideProps = {
  name?: string;
} & Omit<Div, "name">;

const Slide = ({ children, name }: SlideProps) => (
  <div data-carousel-slide={name || "true"}>{children}</div>
);

export type StaggeredElementProps = {
  tag?: keyof React.ReactHTML;
  order?: number;
} & React.HTMLAttributes<HTMLOrSVGElement>;

const StaggeredElement = ({
  tag = "div",
  order = 1,
  ...props
}: StaggeredElementProps) =>
  React.createElement(tag, { ...props, ["data-carousel-staggered"]: order });

export type ProgressProps = {
  for?: string;
} & Omit<Div, "for">;

const Progress = ({ for: target, ...props }: ProgressProps) => (
  <div {...props} data-carousel-progress={target || "true"}></div>
);

export type CarouselProps = {
  carouselRef: React.MutableRefObject<HTMLDivElement | null>;
} & Omit<Div, "ref">;

export const Carousel = ({
  carouselRef,
  children,
  ...props
}: CarouselProps) => (
  <div {...props} ref={carouselRef}>
    {children}
  </div>
);

Carousel.Slide = Slide;
Carousel.StaggeredElement = StaggeredElement;
Carousel.Progress = Progress;
