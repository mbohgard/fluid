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
  onActiveChange?(index: number): void;
  onPositionChange?(position: number): void;
  transform?(
    position: number,
    itemPosition: [number, number]
  ): string | undefined;
};
```

### Basic usage

```javascript
import { Swiper, makeRotationTransform } from "react-fluid-swiper";

const transform = makeRotationTransform({ threshold: 300, maxRotation: 60 });

export const Component = () => (
  <div style={{ height: "300px" }}>
    <Swiper transform={transform}>
      <div>1</div>
      <div>2</div>
      <div>3</div>
      <div>4</div>
      <div>5</div>
    </Swiper>
  </div>
);
```

The container around the Swiper component needs to have a defined height.

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

export const Component = () => (
  const { active, transitionTo } = useSwiper();

  useEffect(() => {
    console.log(`Active item is now ${active}`);
  }, [active]);

  return (
    <>
      <div style={{ height: "300px" }}>
        <Swiper transform={transform}>
          <div>1</div>
          <div>2</div>
          <div>3</div>
          <div>4</div>
          <div>5</div>
        </Swiper>
      </div>
      <button onClick={() => transitionTo(2)}>Go to item #3</button>
    </>
  )
);
```

#### Advanced usage with next/previous actions

```javascript
import { useEffect } from "react"
import { createSwiper } from "react-fluid-swiper";

const [useSwiper, Swiper] = createSwiper();

export const Component = () => (
  const { next, previous, isFirst, isLast } = useSwiper();

  return (
    <div style={{ height: "300px" }}>
      <button disabled={isFirst} onClick={() => previous?.()}>
        &larr;
      </button>
      <Swiper>
        <div>1</div>
        <div>2</div>
        <div>3</div>
        <div>4</div>
        <div>5</div>
      </Swiper>
      <button disabled={isLast} onClick={() => next?.()}>
        &rarr;
      </button>
    </div>
  )
);
```
