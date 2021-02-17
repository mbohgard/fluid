import { Timer } from "./";

export const debounce = <T extends unknown[]>(
  f: (...args: T) => void,
  eager?: boolean
) => {
  let timer: Timer;
  let eagerDone = false;

  return (...args: T) => {
    if (eager && !eagerDone) {
      eagerDone = true;

      return f(...args);
    }

    clearTimeout(timer as number);

    timer = setTimeout(() => {
      f(...args);
    }, 500);
  };
};
