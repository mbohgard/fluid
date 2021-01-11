import React, { useEffect, useState } from "react";
import { render } from "react-dom";

import {
  Swiper,
  createSwiper,
  makeRotationTransform,
  makeEase,
  TransformFunction,
} from "react-fluid-swiper";

import { Swiper as ComponentSwiper } from "./Swiper";

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
  const [show, setShow] = useState(true);
  const {
    active,
    next: aNext,
    previous: aPrev,
    atStart: aStart,
    atEnd: aEnd,
  } = useSwiper();
  const { next, previous, atStart, atEnd } = useAnotherSwiper({
    defaultTransitionDuration: 1000,
    defaultTransitionEasing: "easeInOutQuint",
  });

  useEffect(() => {
    console.log(`Active item is now ${active}`);
  }, [active]);

  return (
    <>
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
        <button disabled={aStart} onClick={() => aPrev?.()}>
          {chevron}
        </button>
        <AdvancedSwiper
          transform={transform}
          defaultActivated={3}
          focusedMode={false}
        >
          <div className="item item-1">1</div>
          <div className="item item-2">2</div>
          <div className="item item-3">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolores
            temporibus, architecto voluptates?
          </div>
          <div className="item item-4">4</div>
          <div className="item item-5">5</div>
          <div className="item item-1">6</div>
          <div className="item item-2">7</div>
          <div className="item item-3">8</div>
          <div className="item item-4">9</div>
          <div className="item item-5">10</div>
        </AdvancedSwiper>
        <button disabled={aEnd} onClick={() => aNext?.()}>
          {chevron}
        </button>
      </div>
      {show && (
        <div className="track">
          <Swiper transform={rotationTransform}>
            <a className="item item-1" href="https://www.google.se">
              1
            </a>
            <a
              className="item item-2"
              onClick={() => (console.log("click"), setShow(false))}
            >
              2
            </a>
            <a className="item item-3">3</a>
            <a className="item item-4">4</a>
            <a className="item item-5">5</a>
            <a className="item item-1">6</a>
            <a className="item item-2">7</a>
            <a className="item item-3">8</a>
            <a className="item item-4">9</a>
            <a className="item item-5">10</a>
          </Swiper>
        </div>
      )}
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
        <ComponentSwiper>
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
        </ComponentSwiper>
        <ComponentSwiper>
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
        </ComponentSwiper>
        <ComponentSwiper>
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
        </ComponentSwiper>
      </div>
    </>
  );
};

render(<App />, document.getElementById("root"));
