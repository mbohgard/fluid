import React from "react";
import { render } from "react-dom";

import { Swiper, makeRotationTransform } from "react-fluid-swiper";

{
  /* <SwiperItem>
          <div className="item">test</div>
        </SwiperItem>
        <SwiperItem>
          <div className="item">test</div>
        </SwiperItem>
        <SwiperItem>
          <div className="item">test</div>
        </SwiperItem>
        <SwiperItem>
          <div className="item">test</div>
        </SwiperItem> */
}

const transform = makeRotationTransform({ threshold: 300, maxRotation: 60 });

const App = () => {
  // const ref = useRef(null);

  return (
    <div className="track">
      <Swiper className="swiper" transform={transform}>
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
