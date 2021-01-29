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

const getSlides = (el: El) =>
  Array.from(el.children).filter(
    (c) =>
      isHTMLElement(c) && c.dataset.carouselSlide && !c.dataset.carouselClone
  ) as El[];

const getProgresses = (el: El) =>
  Array.from(el.querySelectorAll("[data-carousel-progress]"))
    .filter(isHTMLElement)
    .map((p) => ({
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

const getDirection = (
  current: number,
  next: number,
  last: number,
  target?: number | string
) => {
  if (current === next) return 0;
  if (next < 0 || next >= last + 1) return null;

  if (typeof target === "undefined") return 1;
  if (target === -1) return -1;

  if (next === 0 && current === last) return 1;
  if (next === last && current === 0) return -1;

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

const setCloneProgress = (clone: El, progressEl: El, speed: number) => {
  const position = progressEl.getBoundingClientRect().width * speed;
  const progresses = Array.from(
    clone.querySelectorAll(`[${defaultAttribute}-progress]`)
  ).filter(isHTMLElement);

  progresses.forEach((p) => {
    p.style.animationDelay = `-${position}ms`;
    p.style.animationPlayState = "paused";
    p.style.opacity = "1";

    window.requestAnimationFrame(() => (p.style.opacity = "0"));
  });
};

type TransitionOptions = {
  el: El;
  slide: El;
  state: "in" | "out";
  direction: number;
  playState: PlayState;
  progressEl: El;
};

const transition = (
  { el, slide, state, direction, playState, progressEl }: TransitionOptions,
  {
    autoplaySpeed,
    autoplayProgress,
    baseDuration: d = 1000,
    translateOffset: x = 100,
    transitionDelay = (n, d) => (n ? n * (d / 2) : 0),
    transitionDuration = (n, d) => (n ? d + d * (n / 5) : d),
    transitionEasing = (n) =>
      n ? "linear, cubic-bezier(.17,.67,.24,1)" : "ease-in-out",
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

    if (autoplayProgress && out && playState !== "stopped")
      setCloneProgress(clone, progressEl, autoplaySpeed!);

    const setStyle = (elem: El, step: 1 | 2, order = 0) => {
      const duration = transitionDuration(order, d);
      const transform =
        step === 1 ? (out ? 0 : fwd ? x : -x) : out ? (fwd ? -x : x) : 0;
      elem.style.transition = `opacity ${duration}ms, transform ${duration}ms`;
      elem.style.transitionDelay = `${transitionDelay(order, d)}ms`;
      elem.style.transitionTimingFunction = transitionEasing(order, d);
      elem.style.transform = `translateX(${transform}px)`;
      elem.style.opacity = step === 1 ? (out ? "1" : "0") : out ? "0" : "1";
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

export type TransitionProperty<R = number> = (
  order: undefined | number,
  duration: number
) => R;

export type CarouselOptions = {
  defaultActive?: number;
  autoplay?: boolean;
  autoplayProgress?: boolean;
  autoplaySpeed?: number;
  pauseOnHover?: boolean;
  onActiveChange?: (index: number, name: string) => void;
  onPlayStateChange?: (state: PlayState) => void;
  staggerEasing?: string;
  baseDuration?: number;
  transitionDelay?: TransitionProperty;
  transitionDuration?: TransitionProperty;
  transitionEasing?: TransitionProperty<string>;
  translateOffset?: number;
};

export const makeCarousel = (element: El) => {
  const el = element;
  let initialized = false;
  let lastAutoplay = false;
  let inTransit: number[] = [];
  let active: El;
  let transitioning = 0;
  let pausedByHover = false;
  let resetProgress = false;

  // set on init
  let playState: PlayState = "stopped";
  let opt: CarouselOptions;
  let activeIx: number;

  insertStyles(styles(), cls("styles"));
  el.style.position = "relative";

  const progressListener = (e: AnimationEvent) =>
    e.animationName === progressName && move();

  const mouseListener = (e: MouseEvent) =>
    opt.pauseOnHover &&
    (e.type === "mouseenter"
      ? playState === "playing" && stop(true, false, true)
      : pausedByHover && play());

  const progressEl = createProgressEl(element);
  const removeListeners = () => {
    el.removeEventListener("mouseenter", mouseListener);
    el.removeEventListener("mouseleave", mouseListener);
    progressEl.removeEventListener("animationend", progressListener);
  };

  el.addEventListener("mouseenter", mouseListener);
  el.addEventListener("mouseleave", mouseListener);
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

      opt.onActiveChange?.(nextIx, dataValue(next, "carouselSlide") || "");

      if (instant) return setActiveClass(slides);

      const dir = getDirection(currentIx, nextIx, last, target);

      if (dir === 0) return;
      if (dir === null) return console.error("Invalid index value");

      inTransit.push(nextIx);
      const currentInTransit = inTransit.includes(currentIx);
      if (!currentInTransit) inTransit.push(currentIx);

      transitioning++;
      if (playState !== "stopped")
        stop(true, playState === "playing", pausedByHover);

      resetProgress = true;

      const tOptions = { el, direction: dir, playState, progressEl };

      Promise.all([
        transition({ slide: next, state: "in", ...tOptions }, opt),
        currentInTransit
          ? Promise.resolve()
          : transition({ slide: current, state: "out", ...tOptions }, opt),
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

        if (!transitioning && playState === "playing") play();
      });
    } else
      console.error(
        `A slide with the ${
          typeof target === "string" ? `name ${target}` : `index ${nextIx}`
        } does not exist`
      );
  };

  const setProgressAnimation = (state: boolean, reset = false) => {
    const progresses = getProgresses(el);
    const slideName = dataValue(active, "carouselSlide")!;

    progresses.forEach(({ p, name }) => {
      if (name === slideName || name === "") {
        if (p.dataset.carouselProgressInit || (reset && !transitioning)) {
          p.removeAttribute(`${defaultAttribute}-progress-init`);
          p.style.animation = "none";
          p.style.removeProperty("animation");
          p.offsetTop; // repaint
          resetProgress = false;
        }

        if (state) p.style.opacity = "1";
        else if (transitioning || playState === "stopped")
          p.style.opacity = "0";

        p.style.animationName = progressName;
        p.style.animationPlayState = state ? "running" : "paused";
        p.style.animationDuration = `${opt.autoplaySpeed}ms`;
      } else p.style.opacity = "0";
    });
  };

  const setPlayState = (state: PlayState) => {
    if (
      initialized &&
      (state === playState || (state === "paused" && playState === "stopped"))
    )
      return;

    playState = state;
    opt.onPlayStateChange?.(playState);
  };

  const play = () => {
    if (opt.autoplayProgress && !transitioning)
      setProgressAnimation(true, resetProgress || playState === "stopped");

    setPlayState("playing");

    pausedByHover = false;
  };

  const stop = (pause = false, temp = false, byHover = false) => {
    if (!temp || byHover) setPlayState(!pause ? "stopped" : "paused");
    if (opt.autoplayProgress) setProgressAnimation(false);

    pausedByHover = byHover;
  };

  const methods = {
    move,
    next: () => move(),
    previous: () => move(-1),
    play,
    stop,
    pause: () => stop(true),
    cleanup: () => removeListeners(),
  };

  return ({
    defaultActive = 0,
    autoplay = false,
    autoplayProgress = true,
    autoplaySpeed = 5000,
    pauseOnHover = true,
    ...options
  }: CarouselOptions = {}) => {
    opt = { ...options, autoplayProgress, autoplaySpeed, pauseOnHover };
    const resetAutoplay = lastAutoplay !== autoplay;

    if (resetAutoplay) lastAutoplay = autoplay;

    playState = resetAutoplay
      ? autoplay
        ? playState === "paused"
          ? "paused"
          : "playing"
        : "stopped"
      : playState;

    if (!initialized) {
      activeIx = defaultActive;
      move(defaultActive, true);
    }

    if (resetAutoplay && autoplay) play();

    initialized = true;

    return methods;
  };
};

export type MakeCarousel = typeof makeCarousel;
export type CarouselInit = ReturnType<MakeCarousel>;
export type CarouselMethods = ReturnType<CarouselInit>;