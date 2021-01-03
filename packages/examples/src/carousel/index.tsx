import React, { useEffect, useRef, useState } from "react";
import { render } from "react-dom";

// @ts-ignore
import bg1 from "./assets/bg1.jpg";
// @ts-ignore
import bg2 from "./assets/bg3.jpg";
// @ts-ignore
import bg3 from "./assets/bg2.jpg";
// @ts-ignore
import bg4 from "./assets/bg4.jpg";

import { initCarousel } from "fluid-carousel";
// import { Carousel } from "react-fluid-carousel";

// const chevron = (
//   <svg viewBox="0 0 21 28">
//     <path d="M18.297 4.703l-8.297 8.297 8.297 8.297c0.391 0.391 0.391 1.016 0 1.406l-2.594 2.594c-0.391 0.391-1.016 0.391-1.406 0l-11.594-11.594c-0.391-0.391-0.391-1.016 0-1.406l11.594-11.594c0.391-0.391 1.016-0.391 1.406 0l2.594 2.594c0.391 0.391 0.391 1.016 0 1.406z"></path>
//   </svg>
// );

const App = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [fns, setFns] = useState<ReturnType<typeof initCarousel> | undefined>(
    undefined
  );

  useEffect(() => {
    if (ref.current) {
      setFns(initCarousel(ref.current, { autoplay: false }));
    }
  }, [ref]);

  return (
    <>
      <div id="container" ref={ref}>
        <div data-carousel-slide="first">
          <div className="slide slide-right">
            <img src={bg1} className="bg" />
            <h3 className="text text-title" data-carousel-staggered="1">
              Vad gör du i skåpet Per?
            </h3>
            <h4 className="text text-subtitle" data-carousel-staggered="2">
              Leker periskop din syltrygg
            </h4>
          </div>
        </div>
        <div className="progress" data-carousel-progress="third"></div>
        <div data-carousel-slide>
          <div className="slide slide-2">
            <img src={bg2} className="bg" />
            <h3 className="text text-title" data-carousel-staggered="1">
              Jag fattar inte
            </h3>
            <h4 className="text text-subtitle" data-carousel-staggered="2">
              Det är för att du har för små händer
            </h4>
          </div>
        </div>
        <div data-carousel-slide="third">
          <div className="slide slide-right slide-3">
            <img src={bg3} className="bg" />
            <h3
              className="text text-title text-inverted"
              data-carousel-staggered="1"
            >
              Glenn utomlands
            </h3>
            <h4
              className="text text-subtitle text-inverted"
              data-carousel-staggered="2"
            >
              Ibland kan ett visum komma väl till pass
            </h4>
          </div>
        </div>
        <div data-carousel-slide>
          <div className="slide slide-right">
            <img src={bg4} className="bg" />
            <h3
              className="text text-title text-inverted"
              data-carousel-staggered="1"
            >
              Smart anka du har
            </h3>
            <h4
              className="text text-subtitle text-inverted"
              data-carousel-staggered="2"
            >
              Jo, det är en doktorand
            </h4>
          </div>
        </div>
      </div>
      <button onClick={() => fns?.prev()}>prev</button>
      <button onClick={() => fns?.next()}>next</button>
      <button onClick={() => fns?.stop()}>stop</button>
      <button onClick={() => fns?.play()}>play</button>
      <button onClick={() => fns?.pause()}>pause</button>
    </>
  );
};

render(<App />, document.getElementById("root"));
