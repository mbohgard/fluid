import { easings } from "./easings";

export const def = <T>(x: T): x is NonNullable<T> => x !== undefined;

export const partOf = (n: number, max: number) => n / max;
const amountOf = (part: number, max: number) => part * max;

export type MakeEase = (
  from: [number, number],
  to: [number, number],
  easing?: keyof typeof easings
) => (value: number) => number | null;

export const makeEase: MakeEase = (from, to, easing = "linear") => (
  v: number
) => {
  const fwd = from[0] < to[0];

  const progress = v - from[0];
  const end = to[0] - from[0];
  const valueEnd = to[1] - from[1];

  const started = fwd ? v >= from[0] : v <= from[0];
  const ended = fwd ? v >= to[0] : v <= to[0];

  if (started && !ended) {
    return amountOf(easings[easing](partOf(progress, end)), valueEnd) + from[1];
  }

  return null;
};

type MakeRotationTransform<F> = (options: {
  threshold?: number;
  maxRotation?: number;
}) => F;

export type TransformFunction = (
  position: number,
  [itemLeftX, itemRightX]: [number, number]
) => string | undefined;

export const makeRotationTransform: MakeRotationTransform<TransformFunction> = ({
  threshold: th = 300,
  maxRotation: mr = 60,
}) => (pos: number, [begin, end]: [number, number] = [0, 0]) => {
  if (!begin || !end) return undefined;

  const rotateBefore = makeEase([begin - th, -mr], [begin, -30]);
  const rotateAfter = makeEase([end, 30], [end + th, mr]);
  const toFlat = makeEase([begin, -30], [begin + 70, 0], "easeOutQuad");
  const fromFlat = makeEase([end - 70, 0], [end, 30], "easeInQuad");

  const deg =
    rotateBefore(pos) ??
    rotateAfter(pos) ??
    toFlat(pos) ??
    fromFlat(pos) ??
    (pos > end ? mr : pos < begin ? -mr : 0);

  return `rotateY(${deg}deg)`;
};

export const debounce = <T extends unknown[]>(
  f: (...args: T) => void,
  eager?: boolean
) => {
  let timer: number;
  let eagerDone = false;

  return (...args: T) => {
    if (eager && !eagerDone) {
      eagerDone = true;

      return f(...args);
    }

    clearTimeout(timer);

    timer = window.setTimeout(() => {
      f(...args);
    }, 500);
  };
};

export const insertStyles = (styles: string) => {
  const head = document.head;
  const id = "fluid-swiper-styles";

  const current = head.querySelector(`#${id}`);

  if (current) return;

  const style = document.createElement("style");
  style.setAttribute("id", id);
  style.appendChild(document.createTextNode(styles));

  const existing = head.querySelector("style, link");

  if (existing) head.insertBefore(style, existing);
  else head.appendChild(style);
};
