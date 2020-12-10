# react-fluid-swiper

Smooth, cross platform swiping, scrolling and dragging.

![react-fluid-swiper](https://i.imgur.com/GUSDck5.gif)

## Install

```bash
$ npm install react-fluid-swiper --save
```

_or_

```bash
$ yarn add react-fluid-swiper
```

## Usage

#### Available Swiper component props

```typescript
type SwiperProps = {
  className?: string;
  defaultActivated?: number; // defaults to `0`
  focusedMode?: boolean; // defaults to `true`
  dynamicHeight?: boolean; // defaults to `true`
  onActiveChange?(index: number): void;
  onPositionChange?(position: number): void;
  transform?(
    position: number,
    itemPosition: [number, number]
  ): string | undefined;
};
```

#### useSwiper props

```javascript
type UseSwiperOptions = {
  defaultTransitionDuration?: number,
  defaultTransitionEasing?: Easings,
};
```

### Tips

- Set your vertical padding in the Swiper track on `.fluid-swiper-inner` and height calculations will take that into consideration when having `dynamicHeight` set to `true` (default) like so:

```css
.fluid-swiper-inner {
  padding: 40px 0;
}
```

- If setting `dynamicHeight` to `false` the surrounding element needs to have a height defined. You can then set your Swiper children to have `height` of `100%`.

- Be careful of setting state on position change using the `onPositionChange` callback. This will get called every frame (most often 60 frames per second) and your state component and all children will be re-rendered equally often and you might run into performance issues.

### Basic usage

```javascript
import { Swiper, makeRotationTransform } from "react-fluid-swiper";

const transform = makeRotationTransform({ threshold: 300, maxRotation: 60 });

// .item {
//   width: 100%;
//   min-height: 250px;
// }

export const Component = () => (
  <Swiper transform={transform}>
    <div className="item">1</div>
    <div className="item">2</div>
    <div className="item">3</div>
    <div className="item">4</div>
    <div className="item">5</div>
  </Swiper>
);
```

### Advanced usage

```javascript
import { useEffect } from "react"
import {
  createSwiper,
  makeEase,
  TransformFunction,
} from "react-fluid-swiper";

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
const [useSwiper, Swiper] = createSwiper();

// .item {
//   width: 100%;
//   min-height: 250px;
// }

export const Component = () => (
  const { active, transitionTo } = useSwiper();

  useEffect(() => {
    console.log(`Active item is now ${active}`);
  }, [active]);

  return (
    <>
      <Swiper transform={transform}>
        <div className="item">1</div>
        <div className="item">2</div>
        <div className="item">3</div>
        <div className="item">4</div>
        <div className="item">5</div>
      </Swiper>
      <button onClick={() => transitionTo(2)}>Go to item #3</button>
    </>
  )
);
```

#### Usage with next/previous actions

```javascript
import { useEffect } from "react"
import { createSwiper } from "react-fluid-swiper";

const [useSwiper, Swiper] = createSwiper();

// .item {
//   width: 100%;
//   min-height: 250px;
// }

export const Component = () => (
  const { next, previous, isFirst, isLast } = useSwiper();

  return (
    <>
      <button disabled={isFirst} onClick={() => previous?.()}>
        &larr;
      </button>
      <Swiper>
        <div className="item">1</div>
        <div className="item">2</div>
        <div className="item">3</div>
        <div className="item">4</div>
        <div className="item">5</div>
        <div className="item">6</div>
        <div className="item">7</div>
        <div className="item">8</div>
        <div className="item">9</div>
        <div className="item">10</div>
      </Swiper>
      <button disabled={isLast} onClick={() => next?.()}>
        &rarr;
      </button>
    </>
  )
);
```

#### Unfocused mode (Netflix type slider) with next/previous "page" actions

```javascript
import { useEffect } from "react"
import { createSwiper } from "react-fluid-swiper";

const [useSwiper, Swiper] = createSwiper();

// .item {
//   width: 100%;
//   min-height: 250px;
// }

export const Component = () => (
  const { next, previous, atStart, atEnd } = useSwiper({
    defaultTransitionDuration: 350,
    defaultTransitionEasing: "easeInOutQuart"
  });

  return (
    <>
      <button disabled={atStart} onClick={() => previous?.()}>
        &larr;
      </button>
      <Swiper focusedMode={false}>
        <div className="item">1</div>
        <div className="item">2</div>
        <div className="item">3</div>
        <div className="item">4</div>
        <div className="item">5</div>
        <div className="item">6</div>
        <div className="item">7</div>
        <div className="item">8</div>
        <div className="item">9</div>
        <div className="item">10</div>
      </Swiper>
      <button disabled={atEnd} onClick={() => next?.()}>
        &rarr;
      </button>
    </>
  )
);
```
