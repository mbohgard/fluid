export const defaultPrefix = `fluid-carousel`;

export const makeClass = (prefix = defaultPrefix) => (name: string) =>
  `${prefix}-${name}`;

type StylesOptions = {
  prefix?: string;
};

export default ({ prefix = defaultPrefix }: StylesOptions = {}) => {
  return `
  .${prefix}-container {
    position: relative;
    height: 100%;
    box-sizing: border-box;
  }

  .${prefix}-slide {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    display: none;
    opacity: 0;
    pointer-events: none;
  }

  .${prefix}-slide--activating {
    display: block;
  }

  .${prefix}-slide--active {
    opactiy: 1;
    pointer-events: all;
  }
`;
};
