import React, { useEffect } from "react";
import { render } from "react-dom";

import {
  Swiper,
  createSwiper,
  makeRotationTransform,
  makeEase,
  TransformFunction,
} from "react-fluid-swiper";

const chevron = (
  <svg viewBox="0 0 21 28">
    <path d="M18.297 4.703l-8.297 8.297 8.297 8.297c0.391 0.391 0.391 1.016 0 1.406l-2.594 2.594c-0.391 0.391-1.016 0.391-1.406 0l-11.594-11.594c-0.391-0.391-0.391-1.016 0-1.406l11.594-11.594c0.391-0.391 1.016-0.391 1.406 0l2.594 2.594c0.391 0.391 0.391 1.016 0 1.406z"></path>
  </svg>
);

const rotationTransform = makeRotationTransform({
  threshold: 300,
  maxRotation: 60,
});
const threshold = 300;
const minScale = 0.6;
const transform: TransformFunction = (pos, [left, right] = [0, 0]) => {
  const scaleBefore = makeEase([left - threshold, minScale], [left, 1]);
  const scaleAfter = makeEase([right, 1], [right + threshold, minScale]);

  const scale =
    scaleBefore(pos) ??
    scaleAfter(pos) ??
    (pos > right || pos < left ? minScale : 1);

  return `scale(${scale})`;
};
const [useSwiper, AdvancedSwiper] = createSwiper();
const [useAnotherSwiper, AnotherSwiper] = createSwiper();

const App = () => {
  const { active, next: aNext, previous: aPrev, isFirst, isLast } = useSwiper();
  const { next, previous, atStart, atEnd } = useAnotherSwiper();

  useEffect(() => {
    console.log(`Active item is now ${active}`);
  }, [active]);

  return (
    <>
      <div className="track">
        <button disabled={isFirst} onClick={() => aPrev?.()}>
          {chevron}
        </button>
        <AdvancedSwiper transform={transform} defaultActivated={3}>
          <div className="item item-1">1</div>
          <div className="item item-2">2</div>
          <div className="item item-3">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolores
            temporibus, architecto voluptates?
          </div>
          <div className="item item-4">4</div>
          <div className="item item-5">5</div>
        </AdvancedSwiper>
        <button disabled={isLast} onClick={() => aNext?.()}>
          {chevron}
        </button>
      </div>
      <div className="track">
        <Swiper transform={rotationTransform}>
          <div className="item item-1">1</div>
          <div className="item item-2">2</div>
          <div className="item item-3">3</div>
          <div className="item item-4">4</div>
          <div className="item item-5">5</div>
          <div className="item item-1">6</div>
          <div className="item item-2">7</div>
          <div className="item item-3">8</div>
          <div className="item item-4">9</div>
          <div className="item item-5">10</div>
        </Swiper>
      </div>
      <div className="track">
        <button disabled={atStart} onClick={() => previous?.()}>
          {chevron}
        </button>
        <AnotherSwiper focusedMode={false}>
          <div className="item item-1">1</div>
          <div className="item item-2">2</div>
          <div className="item item-3">3</div>
          <div className="item item-4">4</div>
          <div className="item item-5">5</div>
          <div className="item item-1">6</div>
          <div className="item item-2">7</div>
          <div className="item item-3">8</div>
          <div className="item item-4">9</div>
          <div className="item item-5">10</div>
        </AnotherSwiper>
        <button disabled={atEnd} onClick={() => next?.()}>
          {chevron}
        </button>
      </div>
    </>
  );
};

render(<App />, document.getElementById("root"));
