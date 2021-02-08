import { insertStyles } from "fluid-utils";

import styles, { makeClass, defaultAttribute } from "./styles";

type El = HTMLElement;

const cls = makeClass();
const activeClass = cls("slide--active");
const progressName = cls("progress");

const isHTMLElement = (el: Element): el is HTMLElement =>
  el instanceof HTMLElement;

const uppercase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const capitalize = (s: string) =>
  s.split("-").reduce((acc, str) => acc + uppercase(str), "");

const dataSet = (el: El, data: string, value: any = "true") => {
  el.dataset[`carousel${capitalize(data)}`] = String(value);

  return el;
};
const dataGet = (el: El, data: string) =>
  el.dataset[`carousel${capitalize(data)}`];

const strip = (s = "") => (s === "true" ? "" : s);
const def = (x?: any) => x !== undefined && x !== null;

const selectData = (el: El, data: string, value?: any) =>
  Array.from(
    el.querySelectorAll(
      `[${defaultAttribute}-${data}${def(value) ? `="${String(value)}"` : ""}]`
    )
  ).filter(isHTMLElement);

const getSlides = (el: El) =>
  Array.from(el.children).filter(
    (c) => isHTMLElement(c) && dataGet(c, "slide") && !dataGet(c, "clone")
  ) as El[];

const getProgresses = (el: El) =>
  selectData(el, "progress").map((p) => ({
    p,
    name: strip(dataGet(p, "progress")),
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

const waitForImagePaint = (clone: El) => {
  const imgs = Array.from(clone.querySelectorAll("img")).map(
    (img) =>
      new Promise<void>((resolve) => {
        const interval = setInterval(() => {
          if (img.naturalHeight > 0) {
            clearInterval(interval);
            resolve();
          }
        }, 1000 / 60);
      })
  );
  return imgs.length ? Promise.all(imgs) : Promise.resolve([]);
};

const staggerN = (el: El) => +dataGet(el, "staggered")!;

const setCloneProgress = (clone: El, progressEl: El, speed: number) => {
  const position = progressEl.getBoundingClientRect().width * speed;
  const progresses = selectData(clone, "progress");

  progresses.forEach((p) => {
    p.style.animationDelay = `-${position}ms`;
    p.style.animationPlayState = "paused";
    p.style.opacity = "1";

    window.requestAnimationFrame(() => (p.style.opacity = "0"));
  });
};

const createProgressEl = (parent: El) => {
  const el = document.createElement("div");

  dataSet(el, "progress");
  dataSet(el, "progress-init");
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
  baseDuration?: number;
  transitionDelay?: TransitionProperty;
  transitionDuration?: TransitionProperty;
  transitionEasing?: TransitionProperty<string>;
  translateOffset?: number;
};

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type SetCarouselOptions = PartialBy<
  Required<CarouselOptions>,
  "onActiveChange" | "onPlayStateChange"
>;

const timerMap = new Map<El, number>();

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
  let opt: SetCarouselOptions;
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

  const setupClone = (index: number, slide: El, out: boolean) => {
    const existing = out ? selectData(el, "index", index).pop() : undefined;
    const clone =
      existing ??
      dataSet(slide.cloneNode(true) as El, "index", out ? -1 : index);

    clone.classList.remove(activeClass);
    dataSet(clone, "clone");

    return [clone, !existing] as const;
  };

  const transition = ({
    index = activeIx,
    slide = active,
    state = "in",
    direction,
  }: {
    index?: number;
    slide?: El;
    state?: "in" | "out";
    direction: number;
  }) =>
    new Promise<void>((resolve) => {
      const {
        baseDuration: d,
        translateOffset: x,
        transitionDelay: tDelay,
        transitionDuration: tDur,
      } = opt;
      const out = state === "out";
      const fwd = direction > 0;
      const [clone, fresh] = setupClone(index, slide, out);
      const staggered = out ? null : selectData(clone, "staggered");

      if (opt.autoplayProgress && out && playState !== "stopped")
        setCloneProgress(clone, progressEl, opt.autoplaySpeed!);

      const setStyle = (elem: El, step: 1 | 2, order?: number) => {
        const duration = tDur(order, d);
        const reusedSetup = step === 1 && !fresh;
        const transform =
          step === 1 ? (out ? 0 : fwd ? x : -x) : out ? (fwd ? -x : x) : 0;

        elem.style.transition = `opacity ${duration}ms, transform ${duration}ms`;
        elem.style.transitionDelay = `${tDelay(order, d)}ms`;
        elem.style.transitionTimingFunction = opt.transitionEasing(order, d);
        elem.style.opacity = step === 1 ? (out ? "1" : "0") : out ? "0" : "1";

        // don't set initial x position
        if (!reusedSetup) elem.style.transform = `translateX(${transform}px)`;
      };

      setStyle(clone, 1);
      staggered?.forEach((s) => setStyle(s, 1));

      if (fresh) el.append(clone);
      clone.offsetTop; // force repaint

      waitForImagePaint(clone).then(() => {
        const slideDuration = tDur(undefined, d) + tDelay(undefined, d);

        if (out) slide.classList.remove(activeClass);

        setStyle(clone, 2);
        staggered?.forEach((s) => setStyle(s, 2, staggerN(s)));

        const completeDuration = staggered?.length
          ? staggered.reduce(
              (acc, s) =>
                Math.max(acc, tDur(staggerN(s), d) + tDelay(staggerN(s), d)),
              0
            )
          : slideDuration;

        clearTimeout(timerMap.get(clone));
        timerMap.set(
          clone,
          window.setTimeout(() => clone.remove(), completeDuration)
        );

        setTimeout(() => resolve(), slideDuration);
      });
    });

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
        : slides.findIndex((s) => dataGet(s, "slide") === target),
      last
    );
    const next = slides.find((_, i) => i === nextIx);
    const current = slides[currentIx];

    if (next) {
      active = next;
      activeIx = nextIx;

      opt.onActiveChange?.(nextIx, strip(dataGet(next, "slide")));

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

      Promise.all([
        transition({ direction: dir }),
        transition({
          index: currentIx,
          slide: current,
          state: "out",
          direction: dir,
        }),
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
    const slideName = dataGet(active, "slide")!;

    progresses.forEach(({ p, name }) => {
      if (name === slideName || name === "") {
        if (dataGet(p, "progress-init") || (reset && !transitioning)) {
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
    autoplay = false,
    autoplayProgress = true,
    autoplaySpeed = 5000,
    baseDuration = 1000,
    defaultActive = 0,
    pauseOnHover = true,
    translateOffset = 100,
    transitionDelay = (n, d) => (n ? n * (d / 2) : 0),
    transitionDuration = (n, d) => (n ? d + d * (n / 5) : d),
    transitionEasing = (n) =>
      n ? "linear, cubic-bezier(.17,.67,.24,1)" : "ease-in-out",
    ...options
  }: CarouselOptions = {}) => {
    opt = {
      autoplay,
      autoplayProgress,
      autoplaySpeed,
      baseDuration,
      defaultActive,
      pauseOnHover,
      translateOffset,
      transitionDelay,
      transitionDuration,
      transitionEasing,
      ...options,
    };
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
