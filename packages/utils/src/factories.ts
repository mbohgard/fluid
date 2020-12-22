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
