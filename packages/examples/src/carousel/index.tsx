import React, { useEffect, useState } from "react";
import { render } from "react-dom";

import { Carousel, useCarousel } from "react-fluid-karusell";

const bgs = [
  {
    color: "#0A0A22",
    image: "https://i.imgur.com/C7rJzYt.jpg",
  },
  {
    color: "#2F112D",
    image: "https://i.imgur.com/TZzug43.jpg",
  },
  {
    color: "#166087",
    image: "https://i.imgur.com/trXTKoV.jpg",
  },
  {
    color: "#1F1D20",
    image: "https://i.imgur.com/C39aeov.jpg",
  },
] as const;

const chevron = (
  <svg viewBox="0 0 21 28">
    <path d="M18.297 4.703l-8.297 8.297 8.297 8.297c0.391 0.391 0.391 1.016 0 1.406l-2.594 2.594c-0.391 0.391-1.016 0.391-1.406 0l-11.594-11.594c-0.391-0.391-0.391-1.016 0-1.406l11.594-11.594c0.391-0.391 1.016-0.391 1.406 0l2.594 2.594c0.391 0.391 0.391 1.016 0 1.406z"></path>
  </svg>
);

const stopIcon = (
  <svg viewBox="0 0 24 28">
    <path d="M24 3v22c0 0.547-0.453 1-1 1h-22c-0.547 0-1-0.453-1-1v-22c0-0.547 0.453-1 1-1h22c0.547 0 1 0.453 1 1z"></path>
  </svg>
);
const playIcon = (
  <svg viewBox="0 0 22 28">
    <path d="M21.625 14.484l-20.75 11.531c-0.484 0.266-0.875 0.031-0.875-0.516v-23c0-0.547 0.391-0.781 0.875-0.516l20.75 11.531c0.484 0.266 0.484 0.703 0 0.969z"></path>
  </svg>
);
const pauseIcon = (
  <svg id="icon-pause" viewBox="0 0 24 28">
    <path d="M24 3v22c0 0.547-0.453 1-1 1h-8c-0.547 0-1-0.453-1-1v-22c0-0.547 0.453-1 1-1h8c0.547 0 1 0.453 1 1zM10 3v22c0 0.547-0.453 1-1 1h-8c-0.547 0-1-0.453-1-1v-22c0-0.547 0.453-1 1-1h8c0.547 0 1 0.453 1 1z"></path>
  </svg>
);

const App = ({ defaultActive = 0 }: { defaultActive?: number }) => {
  const [bg, setBg] = useState<string>(bgs[defaultActive].color);
  const {
    activeIndex,
    carouselProps,
    previous,
    next,
    stop,
    play,
    pause,
    playState,
  } = useCarousel({
    defaultActive,
    pauseOnHover: true,
  });

  useEffect(() => {
    setBg(bgs[activeIndex].color);
  }, [activeIndex]);

  return (
    <div className="wrapper" style={{ backgroundColor: bg }}>
      <Carousel {...carouselProps} className="container">
        <button className="navigate" onClick={() => previous?.()}>
          {chevron}
        </button>
        <Carousel.Progress className="progress" />
        <Carousel.Slide>
          <div className="slide slide--1 slide--right slide--inverted">
            <img src={bgs[0].image} className="bg" />
            <Carousel.StaggeredElement
              tag="h3"
              className="text text--title"
              order={1}
            >
              Eius maxime sint
            </Carousel.StaggeredElement>
            <Carousel.StaggeredElement
              tag="h4"
              className="text text--subtitle"
              order={2}
            >
              Quod minima nesciunt quas voluptas
            </Carousel.StaggeredElement>
          </div>
        </Carousel.Slide>
        <Carousel.Slide>
          <div className="slide slide--2">
            <img src={bgs[1].image} className="bg" />
            <Carousel.StaggeredElement
              tag="h3"
              className="text text--title"
              order={1}
            >
              Quia blanditiis cupiditate
            </Carousel.StaggeredElement>
            <Carousel.StaggeredElement
              tag="h4"
              className="text text--subtitle"
              order={2}
            >
              Quam vitae voluptatem dolor nemo quibusdam
            </Carousel.StaggeredElement>
          </div>
        </Carousel.Slide>
        <Carousel.Slide name="centered">
          <div className="slide slide--3 slide--center slide--inverted">
            <img src={bgs[2].image} className="bg" />
            <Carousel.StaggeredElement
              tag="h3"
              className="text text--title"
              order={1}
            >
              Molestias officiis in
            </Carousel.StaggeredElement>
            <Carousel.StaggeredElement
              tag="h4"
              className="text text--subtitle"
              order={2}
            >
              Lorem ipsum dolor sit amet
            </Carousel.StaggeredElement>
            <div className="progress-solo">
              <Carousel.Progress for="centered" />
            </div>
          </div>
        </Carousel.Slide>
        <Carousel.Slide>
          <div className="slide slide--4 slide--right">
            <img src={bgs[3].image} className="bg" />
            <Carousel.StaggeredElement
              tag="h3"
              className="text text--title"
              order={1}
            >
              Excepturi repudiandae ea facere quae
            </Carousel.StaggeredElement>
            <Carousel.StaggeredElement
              tag="h4"
              className="text text--subtitle"
              order={2}
            >
              Incidunt, explicabo voluptates corrupti, iusto asperiores
            </Carousel.StaggeredElement>
          </div>
        </Carousel.Slide>
        <button className="navigate next" onClick={() => next?.()}>
          {chevron}
        </button>
        <div className="controls">
          <button
            className={`control${playState === "stopped" ? " active" : ""}`}
            onClick={() => stop?.()}
          >
            {stopIcon}
          </button>
          <button
            className={`control control--play${
              playState === "playing" ? " active" : ""
            }`}
            onClick={() => play?.()}
          >
            {playIcon}
          </button>
          <button
            className={`control${playState === "paused" ? " active" : ""}`}
            onClick={() => pause?.()}
          >
            {pauseIcon}
          </button>
        </div>
      </Carousel>
    </div>
  );
};

render(<App />, document.getElementById("root"));
