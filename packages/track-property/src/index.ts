type TargetElement = HTMLElement | null | undefined;

const makeMouseHandler = (el: TargetElement) => {
  let mouseActivated = false;
  let elRect: DOMRect | undefined;
  let initial = 0;
  let prev: number | undefined;
  let count = 0;

  const mouseMoveListener = (e: MouseEvent) => {
    if (!el || !mouseActivated || !elRect) return;
    console.log(e.screenX);

    const { left, width } = elRect;
    const right = left + width;

    // if (e.clientX > left && e.clientX < right) {
    // if (true) {
    const scrollLeft = initial - e.clientX;

    if (prev !== undefined) count = count + Math.abs(scrollLeft - prev);

    prev = scrollLeft;
    el.scrollLeft = scrollLeft;
    // } else e.preventDefault();
  };
  const genericListener = (e: MouseEvent) => {
    if (!el) return;

    if (e.type === "mousedown") {
      mouseActivated = true;
      count = 0;
      elRect = el.getBoundingClientRect();
      initial = el.scrollLeft + e.clientX;
      window.addEventListener("mousemove", mouseMoveListener);
    } else if (e.type === "mouseup") {
      mouseActivated = false;
      window.removeEventListener("mousemove", mouseMoveListener);
    }
  };

  const kill = (e: Event) => (e.preventDefault(), e.stopPropagation());
  const clickListener = (e: Event) => count > 10 && kill(e);

  return {
    registerMouseEvents: () => {
      el?.addEventListener("mousedown", genericListener);
      el?.addEventListener("click", clickListener, { capture: true });
      el?.addEventListener("dragstart", kill, { capture: true });
      window.addEventListener("mouseup", genericListener);
    },
    unregisterMouseEvents: () => {
      el?.removeEventListener("mousedown", genericListener);
      el?.removeEventListener("click", clickListener, { capture: true });
      el?.removeEventListener("dragstart", kill, { capture: true });
      window.removeEventListener("mouseup", genericListener);
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
  let init = true;
  const { registerMouseEvents, unregisterMouseEvents } = makeMouseHandler(el);

  const f = () => {
    const currentL = el?.[property] ?? null;

    if (currentL === prevL) run = false;
    else prevL = currentL;

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
