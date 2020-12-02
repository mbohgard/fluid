import easings from "./easings";

const partOf = (n: number, max: number) => n / max;
const amountOf = (part: number, max: number) => part * max;

export type EaseOptions = {
  from: [number, number];
  to: [number, number];
  easing?: keyof typeof easings;
};

export const makeEase = ({ from, to, easing = "linear" }: EaseOptions) => (
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

export const debounce = <T extends unknown[]>(
  f: (...args: T) => void,
  eager?: boolean
) => {
  let timer: NodeJS.Timeout;
  let eagerDone = false;

  return (...args: T) => {
    if (eager && !eagerDone) {
      eagerDone = true;

      return f(...args);
    }

    clearTimeout(timer);

    timer = setTimeout(() => {
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
