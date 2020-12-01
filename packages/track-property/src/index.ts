type TargetElement = HTMLElement | null | undefined;

const makeMouseHandler = (el: TargetElement) => {
  let mouseActivated = false;
  let elWidth = 0;
  let initialLeft = 0;
  let startAt = 0;

  const mouseMoveListener = (e: MouseEvent) => {
    if (el && mouseActivated && e.clientX > 0 && e.clientX < elWidth) {
      el.scrollLeft = initialLeft + (startAt - e.clientX);
    }
  };
  const mouseListener = (e: MouseEvent) => {
    if (!el) return;

    if (e.type === "mousedown") {
      mouseActivated = true;
      elWidth = el.getBoundingClientRect().width;
      initialLeft = el.scrollLeft;
      startAt = e.clientX;
      window.addEventListener("mousemove", mouseMoveListener);
    } else if (e.type === "mouseup") {
      mouseActivated = false;
      window.removeEventListener("mousemove", mouseMoveListener);
    }
  };

  return {
    registerMouseEvents: () => {
      el?.addEventListener("mousedown", mouseListener);
      window.addEventListener("mouseup", mouseListener);
    },
    unregisterMouseEvents: () => {
      el?.removeEventListener("mousedown", mouseListener);
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
  let cancelTimer: NodeJS.Timeout;
  let init = true;
  const { registerMouseEvents, unregisterMouseEvents } = makeMouseHandler(el);

  const f = () => {
    const currentL = el?.[property] ?? null;

    if (currentL === prevL) {
      if (!cancelling) {
        cancelling = true;

        cancelTimer = setTimeout(() => {
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

  const touchListener = () => !run && ((run = true), f());

  events.forEach((e) => {
    el?.addEventListener(e, touchListener);
  });

  if (mouseSupport) registerMouseEvents();

  f();

  return () => {
    events.forEach((e) => {
      el?.removeEventListener(e, touchListener);
    });

    if (mouseSupport) unregisterMouseEvents();
  };
};
