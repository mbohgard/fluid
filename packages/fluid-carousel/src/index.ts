import { insertStyles } from "fluid-utils";

import styles, { makeClass, defaultAttribute } from "./styles";

type El = HTMLElement;

const cls = makeClass();
const activatingClass = cls("slide--activating");
const activeClass = cls("slide--active");
const deactivatingClass = cls("slide--deactivating");

// const getHeight = (slide: HTMLElement, h: number) => {
//   const { height } = slide.getBoundingClientRect();

//   return height > h ? height : h;
// };

const isHTMLElement = (el: Element): el is HTMLElement =>
  el instanceof HTMLElement;

const getSlides = (el?: El | null) =>
  el
    ? ([...el.children].filter(
        (c) =>
          isHTMLElement(c) &&
          c.dataset.carouselSlide &&
          !c.dataset.carouselClone
      ) as El[])
    : [];

const getNext = (current: number, next: number | undefined, last: number) =>
  next === undefined
    ? current === last
      ? 0
      : current + 1
    : next < 0
    ? current === 0
      ? last
      : current - 1
    : next;

const getDirection = (current: number, next: number, last: number) => {
  if (current === next) return 0;
  if (next < 0 || next >= last + 1) return null;
  if (next === last && current === 0) return -1;
  if (next === 0 && current === last) return 1;

  return next > current ? 1 : -1;
};

const clearClasses = (el: El) =>
  el.classList.remove(activatingClass, activeClass, deactivatingClass);

const setupClone = (slide: El) => {
  const clone = slide.cloneNode(true) as El;

  clearClasses(clone);
  clone.dataset.carouselClone = "true";
  clone.style.transitionDuration = "1s";

  return clone;
};

const waitForImagePaint = (clone: El) =>
  Promise.all(
    Array.from(clone.querySelectorAll("img")).map(
      (img) =>
        new Promise<void>((resolve) => {
          const interval = setInterval(() => {
            if (img.naturalHeight > 0) {
              clearInterval(interval);
              resolve();
            }
          }, 1000 / 60);
        })
    )
  );

const staggerN = (el: El) => +el.dataset.carouselStaggered!;

const removeClone = (clone: El, duration: number) => {
  clone.style.opacity = "0";

  setTimeout(() => clone.remove(), duration);
};

const transition = (
  el: El,
  slide: El,
  state: "in" | "out",
  direction: number,
  {
    staggerDelay = (n, d) => n * (d / 2),
    staggerDuration = (n, d) => d + d * (n / 5),
    translateOffset: x = 100,
    transitionDuration: d = 1000,
  }: CarouselOptions
) =>
  new Promise<void>((resolve) => {
    const out = state === "out";
    const fwd = direction > 0;
    const clone = setupClone(slide);
    const staggered = out
      ? null
      : Array.from(
          clone.querySelectorAll(`[${defaultAttribute}-staggered]`)
        ).filter(isHTMLElement);

    const setStyle = (elem: El, step: 1 | 2, order = 0) => {
      const transform =
        step === 1 ? (out ? 0 : fwd ? x : -x) : out ? (fwd ? -x : x) : 0;
      elem.style.transition = `opacity ${d}ms, transform ${d}ms`;
      elem.style.transitionTimingFunction = order
        ? "linear, cubic-bezier(.17,.67,.24,1)"
        : "ease-in-out";
      elem.style.transform = `translateX(${transform}px)`;
      elem.style.opacity = step === 1 ? (out ? "1" : "0") : out ? "0" : "1";

      if (order) {
        elem.style.transitionDelay = `${staggerDelay(order, d)}ms`;
        elem.style.transitionDuration = `${staggerDuration(order, d)}ms`;
      }
    };

    setStyle(clone, 1);
    staggered?.forEach((s) => setStyle(s, 1));

    el.append(clone);

    waitForImagePaint(clone).then(() => {
      if (out) slide.classList.remove(activeClass);

      setStyle(clone, 2);
      if (!out)
        staggered?.forEach((s) => {
          const factor = staggerN(s);

          setStyle(s, 2, factor);
        });

      const listener = (e: TransitionEvent) => {
        if (staggered?.length) {
          const last = staggered.reduce((acc, s) =>
            staggerN(s) > staggerN(acc) ? s : acc
          );

          if (e.target === last) finish();
        } else finish();
      };

      clone.addEventListener("transitionend", listener);

      const finish = () => {
        clone.removeEventListener("transitionend", listener);
        removeClone(clone, d);
        resolve();
      };
    });
  });

export type CarouselOptions = {
  defaultActive?: number;
  // dynamicHeight?: boolean;
  element?: El | null;
  staggerDelay?: (order: number, duration: number) => number;
  staggerDuration?: (order: number, duration: number) => number;
  transitionDuration?: number;
  translateOffset?: number;
};

export const initCarousel = ({
  element: el,
  defaultActive = 0,
  ...options
}: // dynamicHeight = true,
CarouselOptions = {}) => {
  let inTransit: number[] = [];
  let activeIx = defaultActive;

  insertStyles(styles(), cls("styles"));

  const move = (ix?: number) => {
    const slides = getSlides(el);
    const last = slides.length - 1;
    const currentIx = activeIx;
    const nextIx = getNext(currentIx, ix, last);
    const next = slides.find((_, i) => i === nextIx);
    const current = slides[currentIx];

    if (el && next) {
      const dir = getDirection(currentIx, nextIx, last);

      if (dir === 0) return;
      if (dir === null) return console.error("Invalid index value");

      inTransit.push(nextIx);
      const currentInTransit = inTransit.includes(currentIx);
      if (!currentInTransit) inTransit.push(currentIx);

      activeIx = nextIx;

      Promise.all([
        transition(el, next, "in", dir, options),
        currentInTransit
          ? Promise.resolve()
          : transition(el, current, "out", dir, options),
      ]).then(() => {
        if (activeIx === nextIx) next.classList.add(activeClass);

        let i = currentInTransit ? 1 : 2;

        inTransit = inTransit.filter((n) => {
          if (
            (n === nextIx && i) ||
            (!currentInTransit && n === currentIx && i)
          ) {
            i--;
            return false;
          }

          return true;
        });
      });
    } else console.error("A slide with that index does not exist");
  };

  const next = () => move();
  const prev = () => move(-1);

  const init = (setActiveIx = 0) => {
    const slides = getSlides(el);
    // let height = 0;

    slides.forEach((slide, ix) => {
      // if (dynamicHeight) height = getHeight(slide, height);

      if (ix === (defaultActive || setActiveIx))
        slide.classList.add(activeClass);
    });

    // if (dynamicHeight) el.style.height = `${height}px`;
  };

  init();

  return { update: init, move, next, prev };
};
