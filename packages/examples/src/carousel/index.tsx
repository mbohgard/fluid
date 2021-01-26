import React, { useEffect } from "react";
import { render } from "react-dom";

// @ts-ignore
import bg1 from "./assets/bg1.jpg";
// @ts-ignore
import bg2 from "./assets/bg3.jpg";
// @ts-ignore
import bg3 from "./assets/bg2.jpg";
// @ts-ignore
import bg4 from "./assets/bg4.jpg";

import { Carousel, useCarousel } from "react-fluid-carousel";

// const chevron = (
//   <svg viewBox="0 0 21 28">
//     <path d="M18.297 4.703l-8.297 8.297 8.297 8.297c0.391 0.391 0.391 1.016 0 1.406l-2.594 2.594c-0.391 0.391-1.016 0.391-1.406 0l-11.594-11.594c-0.391-0.391-0.391-1.016 0-1.406l11.594-11.594c0.391-0.391 1.016-0.391 1.406 0l2.594 2.594c0.391 0.391 0.391 1.016 0 1.406z"></path>
//   </svg>
// );

const App = () => {
  const { props, previous, next, stop, play, pause, playState } = useCarousel({
    autoplay: true,
  });

  useEffect(() => {
    console.log(playState);
  }, [playState]);

  return (
    <>
      <Carousel {...props} id="container">
        <Carousel.Progress className="progress"></Carousel.Progress>
        <Carousel.Slide>
          <div className="slide slide-right">
            <img src={bg1} className="bg" />
            <Carousel.StaggeredElement
              tag="h3"
              className="text text-title"
              order={1}
            >
              Vad gör du i skåpet Per?
            </Carousel.StaggeredElement>
            <Carousel.StaggeredElement
              tag="h4"
              className="text text-subtitle"
              order={2}
            >
              Leker periskop din syltrygg
            </Carousel.StaggeredElement>
          </div>
        </Carousel.Slide>
        <Carousel.Slide name="jojo">
          <div className="slide slide-2">
            <img src={bg2} className="bg" />
            <Carousel.StaggeredElement
              tag="h3"
              className="text text-title"
              order={1}
            >
              Jag fattar inte
            </Carousel.StaggeredElement>
            <Carousel.StaggeredElement
              tag="h4"
              className="text text-subtitle"
              order={2}
            >
              Det är för att du har för små händer
            </Carousel.StaggeredElement>
          </div>
        </Carousel.Slide>
      </Carousel>
      <button onClick={() => previous?.()}>prev</button>
      <button onClick={() => next?.()}>next</button>
      <button onClick={() => stop?.()}>stop</button>
      <button onClick={() => play?.()}>play</button>
      <button onClick={() => pause?.()}>pause</button>
    </>
  );
};

render(<App />, document.getElementById("root"));
