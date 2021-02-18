# react-fluid-karusell

Smooth, infinite, cross platform layered carousel component with autoplay.

![react-fluid-karusell](https://i.imgur.com/PeNaSx6.gif)

1. [Features](#features)
1. [Install](#install)
1. [Usage](#usage)
   1. [Basic usage](#basic-usage)
   1. [Realistic usage](#realistic-usage)
   1. [Autoplay](#autoplay)
   1. [Autoplay with progress](#autoplay-with-progress)
1. [API](#api)
   1. [useCarousel](#usecarousel-options)
   1. [Carousel](#carousel-component)
   1. [Slide](#slide-component)
   1. [StaggeredElement](#staggeredelement-component)
   1. [Progress](#progress-component)

## Features

- 💎 Smooth, performant transitions where slides blend together
- ♾️ Infinite steps both left and right
- ☁️ Practically style free except basic functionality
- ⏱️ Stagger elements on a slide to create fly in/out layers
- ⏯️ Autoplay feature with stop/play/pause and auto-pause on Carousel hover
- 🐒 Jank-free on monkey clicking

## Install

```bash
$ npm install react-fluid-karusell --save
```

_or_

```bash
$ yarn add react-fluid-karusell
```

## Usage

You can find some code snippets down below or go to [this CodeSandbox](https://codesandbox.io/s/carousel-hgc1m?file=/src/App.tsx) to play around with it.

#### Basic usage

```javascript
import { Carousel, useCarousel } from "react-fluid-karusell";

const Component = () => {
  const { carouselProps } = useCarousel({ autoplay: true });

  return (
    <Carousel {...carouselProps} style={{ height: "50vh" }}>
      <Carousel.Slide>First slide content</Carousel.Slide>
      <Carousel.Slide>Second slide content</Carousel.Slide>
    </Carousel>
  );
};
```

Every slide has `position: absolute` so you have to set a height for the root `Carousel` element somehow (`style` and `className` is forwarded to the underlying DOM element).

#### Realistic usage

```javascript
import { Carousel, useCarousel } from "react-fluid-karusell";

import "./my-carousel.css";

const Component = () => {
  const { carouselProps, previous, next } = useCarousel();

  return (
    <Carousel {...carouselProps} className="root">
      <button onClick={() => previous?.()}>⬅️</button>
      <Carousel.Slide>
        <div className="slide slide--1">
          <h2>Hey!</h2>
          <Carousel.StaggeredElement tag="h4" order={1}>
            Ssup?
          </Carousel.StaggeredElement>
          <Carousel.StaggeredElement tag="p" className="text" order={2}>
            I'm late!
          </Carousel.StaggeredElement>
        </div>
      </Carousel.Slide>
      <Carousel.Slide>
        <div className="slide slide--2">
          <img src=".." className="cover" />
          <Carousel.StaggeredElement
            href="/"
            tag="a" // have to be styled as display: block (or any transformable element)
            className="title"
            order={2}
          >
            Fly-in link
          </Carousel.StaggeredElement>
        </div>
      </Carousel.Slide>
      <button onClick={() => next?.()}>⬅️</button>
    </Carousel>
  );
};
```

All components exported will forward all usual DOM attributes and React props to the underlying element. The exception here is `ref` on the root `Carousel` component. If you need it you can get that from the `props.carouselRef` returned from the `useCarousel` hook.

#### Autoplay

```javascript
import { Carousel, useCarousel } from "react-fluid-karusell";

import "./my-carousel.css";

const Component = () => {
  const {
    carouselProps,
    previous,
    next,
    stop,
    play,
    pause,
    playState,
  } = useCarousel({
    // see defaults in API docs below
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: false,
  });

  return (
    <Carousel {...carouselProps} className="root">
      <button onClick={() => previous?.()}>⬅️</button>
      <Carousel.Slide>
        <div className="slide slide--1">
          <h2>Big title</h2>
        </div>
      </Carousel.Slide>
      <Carousel.Slide name="second">
        <div className="slide slide--2">
          <h2>Second slide title</h2>
        </div>
      </Carousel.Slide>
      <button onClick={() => next?.()}>⬅️</button>
      <div className="controls">
        <button disabled={playState === "stopped"} onClick={() => stop?.()}>
          ⏹️
        </button>
        <button disabled={playState === "playing"} onClick={() => play?.()}>
          ▶️
        </button>
        <button disabled={playState === "paused"} onClick={() => pause?.()}>
          ⏸️
        </button>
      </div>
    </Carousel>
  );
};
```

#### Autoplay with progress

```javascript
import { Carousel, useCarousel } from "react-fluid-karusell";

import "./my-carousel.css";

const Component = () => {
  const { carouselProps } = useCarousel({ autoplay: true });

  return (
    <Carousel {...carouselProps} className="root">
      <Carousel.Slide>
        <div className="slide slide--1">
          <h2>Big title</h2>
        </div>
      </Carousel.Slide>
      <Carousel.Slide name="second">
        <div className="slide slide--2">
          <h2>Second slide title</h2>
        </div>
      </Carousel.Slide>
      <div className="progress-solo">
        <Carousel.Progress for="second" />
      </div>
      <Carousel.Progress className="progress-global" />
    </Carousel>
  );
};
```

`Carousel.Progress` is basically a `div` that will animate from `scaleX(0)` to `scaleX(1)`. How you display that is up to you. If the `for` prop is not provided it will animate on every slide.

## Api

#### useCarousel

Available options to pass to the `useCarousel` hook. See examples in above code snippets.

```typescript
{
  // Start at this index. (0)
  defaultActive?: number;

  // Enable autoplay. (false)
  autoplay?: boolean;

  // Display progress bar(s) if provided. (true)
  autoplayProgress?: boolean;

  // Time in ms of every slide in autoplay mode. (5000)
  autoplaySpeed?: number;

  // Pause autoplay when hovering carousel. (true)
  pauseOnHover?: boolean;

  // slide duration time in ms when transitioning. (1000)
  baseDuration?: number;

  // Delay for the current transition, most useful when using staggered elements.
  // Default is (order ? order * (duration / 2) : 0) where every staggered elments order delay is increased by half of the baseDuration.
  // Main slide is passed as undefined for order.
  transitionDelay?: (order: undefined | number, duration: number) => number;

  // Duration for the current transition.
  // Default is (order ? duration + duration * (order / 5) : duration) - basically the animation gets slower and slower for every staggered element.
  // Main slide is passed as undefined for order.
  transitionDuration?: (order: undefined | number, duration: number) => number;

  // CSS timing function (easing). Comma separated where the first is opacity and second is for translateX.
  // Default is (order? "linear, cubic-bezier(.17,.67,.24,1)" : "ease-in-out").
  // Main slide is passes as undefined for order.
  transitionEasing?: (order: undefined | number, duration: number) => string;

  // Start value in px for translateX compared to final value.
  translateOffset?: number; // 100
}
```

`useCarousel` returns the following methods and state:

```typescript
{
  // Currently active slide index.
  activeIndex: number;

  // Currently active slide name, if provided to Carousel.Slide.
  activeName: string;

  // This is the props object which is to be spread onto the Carousel component, see code examples.
  carouselProps: {
    carouselRef: React.MutableRefObject<HTMLDivElement | null>;
  };

  // Current autoplay state (stopped | playing | paused).
  playState: PlayState;

  // Manually transition to a specific slide, identified either by Carousel.Slide index or slide name if provided.
  // Passing `true` to the second parameter will make the change immediately without any transition animation.
  move: (target?: string | number, instant?: boolean) => void;

  // Move to the next slide.
  next: () => void;

  // Move to the previous slide.
  previous: () => void;

  // Start/Unpause autoplay.
  play: () => void;

  // Stop the autoplay, hide and reset progress elements.
  stop: () => void;

  // Pause autoplay and freeze progress elements.
  pause: () => void;

}
```

#### Carousel component

Just spread `carouselProps` returned from `useCarousel` to this component, like this:

```javascript
const { carouselProps } = useCarousel();

<Carousel {...carouselProps} className="my-carousel-class-with-set-height">
  {/* content */}
</Carousel>;
```

It will accept all normal div element props. In fact, there's nothing special at all to this component. It needs to have a defined height somehow though.

#### Slide component

Main component to wrap your slide in.

```typescript
type SlideProps = {
  name?: string; // used as an identifier if you have a Progress element for this specific slide
};
```

It will accept all normal div element props. Don't overwrite `position` though since it's set to `absolute` along with a few other CSS properties. Most likely you'd want to leave this component as is and have your own wrapping element inside of it. For ex:

```javascript
<Carousel.Slide>
  <div className="my-slide-class" style={{ width: "100%", height: "100%" }}>
    {/* content */}
  </div>
</Carousel.Slide>
```

#### StaggeredElement component

A staggered element is a [transformable element](https://www.w3.org/TR/css-transforms-1/#terminology) that will appear in sequence after one another based on the `order` of it.

```typescript
type StaggeredElementProps = {
  tag?: keyof React.ReactHTML; // "div", "h3", "p" etc...
  order?: number; // order of when to appear, starting with 1
};
```

You can see an example of using staggered elements in [this CodeSandbox](https://codesandbox.io/s/carousel-hgc1m?file=/src/App.tsx).

#### Progress component

This is an element that will animate from `scaleX(0)` to `scale(1)` for a specific slide if `for` is set or for all slides otherwise.

```typescript
export type ProgressProps = {
  for?: string;
};
```

It will accept all other normal div element props. `for` corresponds to a slides `name` prop.
