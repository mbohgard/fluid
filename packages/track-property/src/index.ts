import { window } from "fluid-utils";

type TargetElement = HTMLElement | null | undefined;

export interface TrackOptions<P> {
  el: TargetElement;
  triggerOnEvents: string[];
  property: P;
}

export default <P extends keyof HTMLElement>(
  callback: (value: HTMLElement[P] | null) => void,
  { el, triggerOnEvents: events, property }: TrackOptions<P>
) => {
  if (el) {
    const p = window?.getComputedStyle(el).getPropertyValue("position");

    if (p !== "absolute" && p !== "fixed")
      console.warn(
        `The following element will cause page reflows while tracking the "${property}" property since it's position is set to ${p}. Set its position to "absolute" or "fixed" to avoid this.`,
        el
      );
  }

  let prevL: HTMLElement[P] | null;
  let run = false;
  let init = true;

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

  f();

  return () => {
    run = false;

    events.forEach((e) => {
      el?.removeEventListener(e, listener);
    });
  };
};
