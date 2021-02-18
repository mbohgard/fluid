# react-fluid-swiper

Smooth, cross platform swiping, scrolling and dragging.

![react-fluid-swiper](https://i.imgur.com/GUSDck5.gif)

1. [Features](#features)
1. [Install](#install)
1. [Usage](#usage)
   1. [Basic usage](#basic-usage)
   1. [More advanced usage](#more-advanced-usage)
   1. [Unfocused mode](#unfocused-mode)
   1. [Custom transform](#custom-transform)
1. [Tips](#tips)
1. [API](#api)
   1. [useSwiper](#useswiper)
   1. [Swiper component](#swiper-component)
   1. [makeEase](#makeease)

## Features

- 👆 Swipable, scrollable and draggable on all devices
- 💊 "Focused mode" (centered + selected item) and "Unfocused mode"
- ♻️ Transform items based on scroll position
- 🛠️ Methods and state to create navigation buttons and indicators
- ☁️ Minimal styling included

## Install

```bash
$ npm install react-fluid-swiper --save
```

_or_

```bash
$ yarn add react-fluid-swiper
```

## Usage

You can find some code snippets down below or go to [this CodeSandbox](https://codesandbox.io/s/react-fluid-swiper-771ro?file=/src/App.tsx) to play around with it.

#### Basic usage

```javascript
import { Swiper, useSwiper } from "react-fluid-swiper";

const Component = () => {
  const { swiperProps } = useSwiper();

  return (
    <Swiper {...swiperProps} className="my-swiper">
      <div>item #1</div>
      <div>item #2</div>
      <div>item #3</div>
    </Swiper>
  );
};
```

#### More advanced usage

```javascript
import { useEffect } from "react";
import { Swiper, useSwiper, makeRotationTransform } from "react-fluid-swiper";

// Built in example of a transform function, Apple cover-flow like
const transform = makeRotationTransform({ threshold: 300, maxRotation: 60 });

const Component = () => {
  const { active, swiperProps, next, previous, isFirst, isLast } = useSwiper({
    defaultActivated: 1, // indexed based
    dynamicHeight: false,
    transform,
  });

  useEffect(() => {
    console.log(`Active item index is ${active}`);
  }, [active]);

  return (
    <div className="track">
      <button disabled={isFirst} onClick={() => previous?.()}>
        «
      </button>
      <Swiper {...swiperProps} style={{ height: "50vh" }}>
        <div>item #1</div>
        <div>item #2</div>
        <div>item #3</div>
      </Swiper>
      <button disabled={isLast} onClick={() => next?.()}>
        »
      </button>
    </div>
  );
};
```

#### Unfocused mode

In unfocused mode there is no active item and there are no spacings before the first and after the last item. In this case Swiper works more like a normal carousel component where `next` and `previous` animates to the next/previous page. Think "Nextflix carousel" here.

```javascript
import { Swiper, useSwiper } from "react-fluid-swiper";

const Component = () => {
  const { swiperProps, next, previous, atStart, atEnd } = useSwiper({
    unfocusedMode: true,
  });

  return (
    <div className="track">
      <button disabled={atStart} onClick={() => previous?.()}>
        «
      </button>
      <Swiper {...swiperProps}>
        <div>item #1</div>
        <div>item #2</div>
        <div>item #3</div>
      </Swiper>
      <button disabled={atEnd} onClick={() => next?.()}>
        »
      </button>
    </div>
  );
};
```

#### Custom transform

The `transform` function is just a function that takes the current scroll position and item position and returns a css transform value. Some tips are provided [below](#tips).

```javascript
import {
  useSwiper,
  Swiper,
  makeEase,
  TransformFunction,
} from "react-fluid-swiper";

const THRESHOLD = 300;
const MIN_SCALE = 0.6;
const transform: TransformFunction = (pos, [left, right] = [0, 0]) => {
  const scaleBefore = makeEase([left - THRESHOLD, MIN_SCALE], [left, 1]);
  const scaleAfter = makeEase([right, 1], [right + THRESHOLD, MIN_SCALE]);

  const scale =
    scaleBefore(pos) ??
    scaleAfter(pos) ??
    (pos > right || pos < left ? MIN_SCALE : 1);

  return `scale(${scale})`;
};

// .item {
//   width: 250px;
//   min-height: 250px;
// }

export const Component = () => (
  const { swiperProps } = useSwiper({ transform });

  return (
    <Swiper {...swiperProps}>
      <div className="item">1</div>
      <div className="item">2</div>
      <div className="item">3</div>
      <div className="item">4</div>
      <div className="item">5</div>
    </Swiper>
  )
);
```

### Tips

- Set your vertical padding in the Swiper track on `.fluid-swiper-inner` and height calculations will take that into consideration when having `dynamicHeight` set to `true` (default) like so:

```css
.fluid-swiper-inner {
  padding: 40px 0;
}
```

- If setting `dynamicHeight` to `false` the surrounding element or the `Swiper` component itself need to have a height defined.

- Be careful of setting state on position change using the `onPositionChange` callback. This will get called every frame (most often 60 frames per second) and your state component and all children will be re-rendered equally often and you might run into performance issues.

- Positions, correct height (if `dynamicHeight: true` (default)) and other measurements are done on window resize. If you're doing style changes on the fly, use `recalculate` (returned from `useSwiper`) if you need to update stuff for things to look correct.

#### Creating transforms

## API

#### useSwiper

Available options to pass to the `useSwiper` hook. See examples in above code snippets.

```typescript
{
  // Start at this index. Only available if focusedMode is set to true. (0)
  defaultActivated?: number;

  // Default time in ms for the duration of transitions when invoking next, previous and transitionTo methods. (250)
  defaultTransitionDuration?: number;

  // Default easing function to use for transitions. Take a look in src/easings.ts for avaiable options. (easeInOutQuad)
  defaultTransitionEasing?: Easings;

  // Calculate height based of the tallest item. (true)
  dynamicHeight?: boolean;

  // Focused mode will have an active/selected item in the middle of the Swiper track.
  // If set to false there will be no active item and there will be no spacings before/after first/last item. (true)
  focusedMode?: T;

  // If provided, this callback will be called on every frame update during scroll/drag/transition.
  onPositionChange?(scrollPosition: number, middlePosition: number, trackWidth: number): void;

  // If provided, this function will be called on every frame with the current scroll position and item position.
  // Expects a css transform value back, like "scale(0.5) rotate(45deg)" for ex.
  transform?(middlePosition: number, itemPosition: [number, number]) => string | undefined;
}
```

`useSwiper` returns the following methods and state:

```typescript
// For both focused and unfocused mode:
{
  // true if scroll position is at 0.
  atStart: boolean;

  // true if scrolled all the to the end.
  atEnd: boolean;

  // List of starting positon and end position for each element in the Swiper track.
  itemPositions: [number, number][],

  // Necessary props to be spread on to the Swiper component.
  swiperProps,

  // If doing style changes on the fly you might need to call this to recalculate height and positions etc.
  recalculate
}

// When focused mode is enabled (default) the useSwiper return object also contains the following
// properties. Most of them are undefined on first render due to
{
  // Currently active item (indexed based).
  active: number;

  // true if the first item is active.
  isFirst?: boolean;

  // true if the last item is active.
  isLast?: boolean;

  // Transition to the next item. If loop is set to true the first item will be transitioned to if the
  // current one it the last.
  next?: (loop = false) => void;

  // Transition to the previous item. Will transition to first from last if loop is set to true.
  previous?: (loop = false) => void;

  // Manually transition to a specific item. Possible to provide custom easing function and duration.
  transitionTo?: (index: number, easing?: Easings, ms?: number) => void;
}

// In unfocused mode the following properties are available:
{
  // Transition to the next "page" of items. Will transition to the next not fully visible item.
  // Optionally provide an offset to scroll further/less than normal, easing and duration for other
  // values than defaultTransitionEasing and defaultTransitionDuration.
  next?: (offset?: number, easing?: Easings, duration?: number) => void;

  // Same as above. The other way around.
  previous?: (offset?: number, easing?: Easings, duration?: number) => void;
}
```

#### Swiper component

You will need to spread `swiperProps` returned from `useSwiper` on to this component (see examples above).
Other available props are `ref`, `style` and `className` that will be attached to the underlaying `div` element.

#### makeRotationTransform

Pre-defined transform generator for creating a cover flow like effect where items rotate independently based on scroll position.
Use the result of calling this function as the `transform` property to the `useSwiper` hook. See example use [above](#more-advanced-usage).

Signature:

```typescript
makeRotationTransform(options: {
  // Number of px to start/stop rotating before/after the edge of the item crosses the middle
  // position in the Swiper track. (300)
  threshold?: number;

  // Maximum positive/negative rotation value in degrees. (60)
  maxRotation?: number;
}) => TransformFunction
```

#### makeEase

`makeEase` is a helper function to easily create correct transform values based on the scroll position. It's usable when you're creating your own custom transform functions.
`makeEase` basically takes a `from` position and value and the final `to` position and value together with an optional easing (defaults to `linear`) and returns another function that will take the current position value.
The result of calling this created function with a position is a value between those `from`/`to` values if the position is inside of the `from`/`to` position range or `null` otherwise.

Signature:

```typescript
makeEase(
  from: [position: number, value: number],
  to: [position: number, value: number],
  easing = "linear"
) => (value: number) => number | null;
```

Simple example:

```javascript
const ease = makeEase([100, 25], [200, 50], "linear");

ease(90); // null
ease(100); // 25
ease(200); // 50
ease(150); // 37.5
ease(201); // null
```

You can see a more realistic example [Custom transform](#custom-transform) above.
