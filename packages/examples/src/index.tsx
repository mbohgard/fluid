import React, { useEffect } from "react";
import { render } from "react-dom";

import {
  createSwiper,
  // makeRotationTransform,
  makeEase,
  TransformFunction,
} from "react-fluid-swiper";

// const transform = makeRotationTransform({ threshold: 300, maxRotation: 60 });
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
const { transitionTo, Swiper } = createSwiper();

const App = () => {
  useEffect(() => {
    transitionTo(0);
  }, []);

  return (
    <div className="track">
      <Swiper transform={transform}>
        <div className="item item-1">1</div>
        <div className="item item-2">2</div>
        <div className="item item-3">3</div>
        <div className="item item-4">4</div>
        <div className="item item-5">5</div>
      </Swiper>
    </div>
  );
};

render(<App />, document.getElementById("root"));
