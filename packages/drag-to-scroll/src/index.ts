import { window } from "fluid-utils";

export type Options = {
  el: HTMLElement | null | undefined;
  vertical?: boolean;
};

export default ({ el, vertical = false }: Options) => {
  const property = vertical ? "scrollTop" : "scrollLeft";
  const axisProperty = vertical ? "clientY" : "clientX";
  let mouseActivated = false;
  let elRect: DOMRect | undefined;
  let initial = 0;
  let prev: number | undefined;
  let count = 0;

  const mouseMoveListener = (e: MouseEvent) => {
    if (!el || !mouseActivated || !elRect) return;
    const pos = initial - e[axisProperty];

    if (prev !== undefined) count = count + Math.abs(pos - prev);

    prev = pos;
    el[property] = pos;
  };

  const genericListener = (e: MouseEvent) => {
    if (!el) return;

    if (e.type === "mousedown") {
      mouseActivated = true;
      count = 0;
      elRect = el.getBoundingClientRect();
      initial = el[property] + e[axisProperty];
      window?.addEventListener("mousemove", mouseMoveListener);
    } else if (e.type === "mouseup") {
      mouseActivated = false;
      window?.removeEventListener("mousemove", mouseMoveListener);
    }
  };

  const kill = (e: Event) => (e.preventDefault(), e.stopPropagation());
  const clickListener = (e: Event) => count > 10 && kill(e);

  el?.addEventListener("mousedown", genericListener);
  el?.addEventListener("click", clickListener, { capture: true });
  el?.addEventListener("dragstart", kill, { capture: true });
  window?.addEventListener("mouseup", genericListener);

  return () => {
    el?.removeEventListener("mousedown", genericListener);
    el?.removeEventListener("click", clickListener, { capture: true });
    el?.removeEventListener("dragstart", kill, { capture: true });
    window?.removeEventListener("mouseup", genericListener);
  };
};
