import React, { useEffect } from "react";
import { render } from "react-dom";

import {
  Swiper,
  createSwiper,
  makeRotationTransform,
  makeEase,
  TransformFunction,
} from "react-fluid-swiper";

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
  const { active } = useSwiper();
  const { next, previous, isFirst, isLast } = useAnotherSwiper();

  useEffect(() => {
    console.log(`Active item is now ${active}`);
  }, [active]);

  return (
    <>
      <div className="track">
        <AdvancedSwiper transform={transform}>
          <div className="item item-1">1</div>
          <div className="item item-2">2</div>
          <div className="item item-3">3</div>
          <div className="item item-4">4</div>
          <div className="item item-5">5</div>
        </AdvancedSwiper>
      </div>
      <div className="track">
        <Swiper transform={rotationTransform}>
          <div className="item item-1">1</div>
          <div className="item item-2">2</div>
          <div className="item item-3">3</div>
          <div className="item item-4">4</div>
          <div className="item item-5">5</div>
        </Swiper>
      </div>
      <div className="track">
        <button disabled={isFirst} onClick={() => previous?.()}>
          &larr;
        </button>
        <AnotherSwiper>
          <div className="item item-1">1</div>
          <div className="item item-2">2</div>
          <div className="item item-3">3</div>
          <div className="item item-4">4</div>
          <div className="item item-5">5</div>
        </AnotherSwiper>
        <button disabled={isLast} onClick={() => next?.()}>
          &rarr;
        </button>
      </div>
    </>
  );
};

render(<App />, document.getElementById("root"));
