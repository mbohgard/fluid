import React, { useEffect } from "react";
import { render } from "react-dom";
// import styled from "styled-components";

import { Carousel, useCarousel } from "react-fluid-carousel";

const bg1 = "https://i.imgur.com/DYm1aqo.jpg";
const bg2 =
  "https://uhdwallpapers.org/uploads/converted/18/03/24/abstract-3d-shapes-3840x2160_97455-mm-90.jpg";
const bg3 = "https://i.imgur.com/WrfYZmU.jpg";
const bg4 =
  "https://www.iliketowastemytime.com/sites/default/files/raise-perfect-hue-jason-benjamin.jpg";

const chevron = (
  <svg viewBox="0 0 21 28">
    <path d="M18.297 4.703l-8.297 8.297 8.297 8.297c0.391 0.391 0.391 1.016 0 1.406l-2.594 2.594c-0.391 0.391-1.016 0.391-1.406 0l-11.594-11.594c-0.391-0.391-0.391-1.016 0-1.406l11.594-11.594c0.391-0.391 1.016-0.391 1.406 0l2.594 2.594c0.391 0.391 0.391 1.016 0 1.406z"></path>
  </svg>
);

const App = () => {
  const { props, previous, next, stop, play, pause, playState } = useCarousel({
    pauseOnHover: true,
  });

  useEffect(() => {
    console.log(playState);
  }, [playState]);

  return (
    <>
      <Carousel {...props} id="container">
        <button className="navigate" onClick={() => previous?.()}>
          {chevron}
        </button>
        <Carousel.Progress className="progress"></Carousel.Progress>
        <Carousel.Slide>
          <div className="slide slide-right">
            <img src={bg1} className="bg" />
            <Carousel.StaggeredElement
              tag="h3"
              className="text text-title"
              order={1}
            >
              Eius maxime sint
            </Carousel.StaggeredElement>
            <Carousel.StaggeredElement
              tag="h4"
              className="text text-subtitle"
              order={2}
            >
              Quod minima nesciunt quas voluptas
            </Carousel.StaggeredElement>
          </div>
        </Carousel.Slide>
        <Carousel.Slide>
          <div className="slide">
            <img src={bg2} className="bg" />
            <Carousel.StaggeredElement
              tag="h3"
              className="text text-title"
              order={1}
            >
              Quia blanditiis cupiditate
            </Carousel.StaggeredElement>
            <Carousel.StaggeredElement
              tag="h4"
              className="text text-subtitle"
              order={2}
            >
              Quam vitae voluptatem dolor nemo quibusdam
            </Carousel.StaggeredElement>
          </div>
        </Carousel.Slide>
        <Carousel.Slide name="centered">
          <div className="slide slide slide-center">
            <img src={bg3} className="bg" />
            <Carousel.StaggeredElement
              tag="h3"
              className="text text-title"
              order={1}
            >
              Molestias officiis in
            </Carousel.StaggeredElement>
            <Carousel.StaggeredElement
              tag="h4"
              className="text text-subtitle"
              order={2}
            >
              Lorem ipsum dolor sit amet
            </Carousel.StaggeredElement>
            <div className="progress-solo">
              <Carousel.Progress for="centered"></Carousel.Progress>
            </div>
          </div>
        </Carousel.Slide>
        <Carousel.Slide>
          <div className="slide slide-right">
            <img src={bg4} className="bg" />
            <Carousel.StaggeredElement
              tag="h3"
              className="text text-title"
              order={1}
            >
              Excepturi repudiandae ea facere quae
            </Carousel.StaggeredElement>
            <Carousel.StaggeredElement
              tag="h4"
              className="text text-subtitle"
              order={2}
            >
              Incidunt, explicabo voluptates corrupti, iusto asperiores
            </Carousel.StaggeredElement>
          </div>
        </Carousel.Slide>
        <button className="navigate next" onClick={() => next?.()}>
          {chevron}
        </button>
      </Carousel>
      <button onClick={() => stop?.()}>stop</button>
      <button onClick={() => play?.()}>play</button>
      <button onClick={() => pause?.()}>pause</button>
    </>
  );
};

render(<App />, document.getElementById("root"));
