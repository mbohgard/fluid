type TargetElement = HTMLElement | null | undefined;

const makeMouseHandler = (el: TargetElement) => {
  let mouseActivated = false;
  let elWidth = 0;
  let initial = 0;
  let prev: number | undefined;
  let count = 0;

  const mouseMoveListener = (e: MouseEvent) => {
    if (el && mouseActivated && e.clientX > 0 && e.clientX < elWidth) {
      const scrollLeft = initial - e.clientX;

      if (prev !== undefined) count = count + Math.abs(scrollLeft - prev);

      prev = scrollLeft;
      el.scrollLeft = scrollLeft;
    }
  };
  const mouseListener = (e: MouseEvent) => {
    if (!el) return;

    if (e.type === "mousedown") {
      mouseActivated = true;
      count = 0;
      elWidth = el.getBoundingClientRect().width;
      initial = el.scrollLeft + e.clientX;
      window.addEventListener("mousemove", mouseMoveListener);
    } else if (e.type === "mouseup") {
      mouseActivated = false;
      window.removeEventListener("mousemove", mouseMoveListener);
    }
  };

  const clickListener = (e: Event) =>
    count > 10 && (e.preventDefault(), e.stopPropagation());

  return {
    registerMouseEvents: () => {
      el?.addEventListener("mousedown", mouseListener);
      el?.addEventListener("click", clickListener, { capture: true });
      window.addEventListener("mouseup", mouseListener);
    },
    unregisterMouseEvents: () => {
      el?.removeEventListener("mousedown", mouseListener);
      el?.removeEventListener("click", clickListener, { capture: true });
      window.removeEventListener("mouseup", mouseListener);
    },
  };
};

export interface TrackOptions<P> {
  disabled?: boolean;
  el: TargetElement;
  events: string[];
  property: P;
  mouseSupport?: boolean;
}

export const track = <P extends keyof HTMLElement>(
  callback: (value: HTMLElement[P] | null) => void,
  { disabled, el, events, property, mouseSupport }: TrackOptions<P>
) => {
  if (disabled) return;

  if (el) {
    const p = window.getComputedStyle(el).getPropertyValue("position");

    if (p !== "absolute" && p !== "fixed")
      console.warn(
        `The following element will cause page reflows while tracking the "${property}" property since it's position is set to ${p}. Set its position to "absolute" or "fixed" to avoid this.`,
        el
      );
  }

  let prevL: HTMLElement[P] | null;
  let run = false;
  let cancelling = false;
  let cancelTimer: number;
  let init = true;
  const { registerMouseEvents, unregisterMouseEvents } = makeMouseHandler(el);

  const f = () => {
    const currentL = el?.[property] ?? null;

    if (currentL === prevL) {
      if (!cancelling) {
        cancelling = true;

        cancelTimer = window.setTimeout(() => {
          run = false;
          cancelling = false;
        }, 1000);
      }
    } else {
      if (cancelling) {
        cancelling = false;
        clearTimeout(cancelTimer);
      }
      prevL = currentL;
    }

    if (init || run) callback(currentL);
    if (run) requestAnimationFrame(f);

    init = false;
  };

  const listener = () => !run && ((run = true), f());

  events.forEach((e) => {
    el?.addEventListener(e, listener);
  });

  if (mouseSupport) registerMouseEvents();

  f();

  return () => {
    run = false;

    events.forEach((e) => {
      el?.removeEventListener(e, listener);
    });

    if (mouseSupport) unregisterMouseEvents();
  };
};
