# react-fluid-swiper

Smooth, cross platform swiping and scrolling.

![react-fluid-swiper](https://i.imgur.com/Zm26Ggj.gif)

## Install

```bash
$ npm install react-fluid-swiper --save
```

_or_

```bash
$ yarn add react-fluid-swiper
```

## Usage

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

The container around the Swiper component need to have a defined height.

### Available props

```typescript
type SwiperProps = {
  children?: React.ReactNode;
  className?: string;
  onActiveChange?(index: number): void;
  onPositionChange?(position: number): void;
  transform?(
    position: number,
    itemPosition: [number, number]
  ): string | undefined;
};
```
