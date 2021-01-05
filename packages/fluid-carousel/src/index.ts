import { insertStyles } from "fluid-utils";

import styles, { makeClass, defaultAttribute } from "./styles";

type El = HTMLElement;

const cls = makeClass();
const activeClass = cls("slide--active");
const progressName = cls("progress");

const isHTMLElement = (el: Element): el is HTMLElement =>
  el instanceof HTMLElement;

const dataValue = (el: El, key: string) => {
  const value = el.dataset[key];

  return value === "true" ? "" : value;
};

const getElementsByData = (parent: El, condition: (el: El) => unknown) =>
  [...parent.children].filter(
    (el) => isHTMLElement(el) && condition(el)
  ) as El[];

const getSlides = (el: El) =>
  getElementsByData(
    el,
    (c) => c.dataset.carouselSlide && !c.dataset.carouselClone
  );
const getProgresses = (el: El) =>
  getElementsByData(el, (c) => c.dataset.carouselProgress).map((p) => ({
    p,
    name: dataValue(p, "carouselProgress")!,
  }));

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

const setupClone = (slide: El) => {
  const clone = slide.cloneNode(true) as El;

  clone.classList.remove(activeClass);
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
    clone.offsetTop; // force repaint

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

const createProgressEl = (parent: El) => {
  const el = document.createElement("div");

  el.dataset.carouselProgress = "true";
  el.dataset.carouselProgressInit = "true";
  el.classList.add(cls("progress"));

  parent.append(el);

  return el;
};

export type PlayState = "playing" | "paused" | "stopped";

export type CarouselOptions = {
  defaultActive?: number;
  autoplay?: boolean;
  autoplayProgress?: boolean;
  autoplaySpeed?: number;
  // pauseOnHover?: boolean;
  onActiveChange?: (index: number, name?: string) => void;
  onPlayStateChange?: (state: PlayState) => void;
  staggerDelay?: (order: number, duration: number) => number;
  staggerDuration?: (order: number, duration: number) => number;
  transitionDuration?: number;
  translateOffset?: number;
};

export const makeCarousel = (element: El) => {
  const el = element;
  let initialized = false;
  let inTransit: number[] = [];
  let active: El;
  let paused = false;
  let transitioning = 0;
  let playState: PlayState = "stopped";

  // set on init
  let opt: CarouselOptions;
  let playing: boolean;
  let activeIx: number;

  insertStyles(styles(), cls("styles"));
  el.style.position = "relative";

  const progressListener = (e: AnimationEvent) =>
    e.animationName === progressName && move();

  const progressEl = createProgressEl(element);
  const removeProgressListener = () =>
    progressEl.removeEventListener("animationend", progressListener);
  progressEl.addEventListener("animationend", progressListener);

  const setActiveClass = (slides?: El[]) => {
    const _slides = slides || getSlides(el);

    _slides.forEach((slide) => {
      if (active === slide) slide.classList.add(activeClass);
      else slide.classList.remove(activeClass);
    });
  };

  const move = (target?: number | string, instant = false) => {
    const slides = getSlides(el);
    const last = slides.length - 1;
    const currentIx = activeIx;
    const nextIx = getNext(
      currentIx,
      typeof target === "number" || target === undefined
        ? target
        : slides.findIndex((s) => s.dataset.carouselSlide === target),
      last
    );
    const next = slides.find((_, i) => i === nextIx);
    const current = slides[currentIx];

    if (next) {
      active = next;
      activeIx = nextIx;
      opt.onActiveChange?.(nextIx, dataValue(next, "carouselSlide"));

      if (instant) return setActiveClass(slides);

      const dir = getDirection(currentIx, nextIx, last);

      if (dir === 0) return;
      if (dir === null) return console.error("Invalid index value");

      inTransit.push(nextIx);
      const currentInTransit = inTransit.includes(currentIx);
      if (!currentInTransit) inTransit.push(currentIx);

      transitioning++;
      if (playing) stop(true, true);

      Promise.all([
        transition(el, next, "in", dir, opt),
        currentInTransit
          ? Promise.resolve()
          : transition(el, current, "out", dir, opt),
      ]).then(() => {
        if (!--transitioning) setActiveClass();

        let i = currentInTransit ? 1 : 2;

        // remove completed from inTransit list
        inTransit = inTransit.filter(
          (n) =>
            !(
              (n === nextIx && i) ||
              (!currentInTransit && n === currentIx && i)
            ) || (i--, false)
        );

        if (!transitioning && playing) play(true);
      });
    } else console.error("A slide with that index does not exist");
  };

  const setProgressAnimation = (state: boolean, reset = false) => {
    const progresses = getProgresses(el);
    const slideName = dataValue(active, "carouselSlide")!;

    progresses.forEach(({ p, name }) => {
      if (name === slideName || name === "") {
        if (p.dataset.carouselProgressInit || (reset && !transitioning)) {
          p.removeAttribute("data-carousel-progress-init");
          p.style.animation = "none";
          p.offsetTop; // repaint
          p.style.removeProperty("animation");
        }

        if (state) p.style.opacity = "1";
        else if (transitioning || !paused) p.style.opacity = "0";

        p.style.animationName = progressName;
        p.style.animationPlayState = state ? "running" : "paused";
        p.style.animationDuration = `${opt.autoplaySpeed}ms`;
      } else p.style.opacity = "0";
    });
  };

  const setPlayState = (state: PlayState) => {
    if (state === playState && initialized) return;

    playState = state;
    opt.onPlayStateChange?.(playState);
  };

  const play = (reset = false) => {
    if (opt.autoplayProgress) setProgressAnimation(true, reset || !playing);
    playing = true;

    setPlayState("playing");
  };

  const stop = (pause = false, temp = false) => {
    const isTransitioning = transitioning > 0;

    paused = pause;

    if (!playing) return;

    playing = isTransitioning && !temp ? false : paused;
    if (opt.autoplayProgress) setProgressAnimation(false);

    if (!temp)
      setPlayState(
        playing ? "paused" : isTransitioning && paused ? "paused" : "stopped"
      );
  };

  const methods = {
    move,
    next: () => move(),
    prev: () => move(-1),
    play,
    stop,
    pause: () => stop(true),
    cleanup: () => removeProgressListener(),
  };

  return ({
    defaultActive = 0,
    autoplay = false,
    autoplayProgress = true,
    autoplaySpeed = 5000,
    ...options
  }: CarouselOptions = {}) => {
    opt = { ...options, autoplayProgress, autoplaySpeed };
    playing = autoplay;
    playState = autoplay ? (paused ? "paused" : "playing") : "stopped";

    if (!initialized) {
      activeIx = defaultActive;
      move(defaultActive, true);
    }
    if (autoplay) play();

    initialized = true;

    return methods;
  };
};

export type MakeCarousel = typeof makeCarousel;
export type CarouselInit = ReturnType<MakeCarousel>;
export type CarouselMethods = ReturnType<CarouselInit>;
