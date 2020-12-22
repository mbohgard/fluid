import { amountOf, partOf } from "fluid-utils";

import { easings } from "./easings";

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
