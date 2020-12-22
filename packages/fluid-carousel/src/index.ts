import { insertStyles } from "fluid-utils";

import styles, { makeClass } from "./styles";

const cls = makeClass();

const getHeight = (slide: HTMLElement, h: number) => {
  const { height } = slide.getBoundingClientRect();

  return height > h ? height : h;
};

export type CarouselOptions = {
  applyStyles?: boolean;
  defaultActive?: number;
  dynamicHeight?: boolean;
  element?: HTMLElement | null;
};

const isHTMLElement = (n: Element): n is HTMLElement =>
  n instanceof HTMLElement;

export const createCarousel = ({
  applyStyles = true,
  element: el,
  defaultActive = 0,
  dynamicHeight = true,
}: CarouselOptions) => {
  if (!el) return;

  insertStyles(styles(), cls("styles"));

  const init = (setActive = 0) => {
    if (applyStyles) el.classList.add(cls("container"));

    const slides = [...el.children].filter(isHTMLElement);
    let height = 0;

    slides.forEach((slide, ix) => {
      if (applyStyles) slide.classList.add(cls("slide"));

      if (dynamicHeight) height = getHeight(slide, height);

      if (ix === (defaultActive || setActive))
        slide.classList.add(cls("slide--active"));
    });

    if (dynamicHeight) el.style.height = `${height}px`;
  };

  init();

  return { update: init };
};
