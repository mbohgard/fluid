export const defaultPrefix = `fluid-carousel`;
export const defaultAttribute = `data-carousel`;

export const makeClass =
  (prefix = defaultPrefix) =>
  (name: string) =>
    `${prefix}-${name}`;

type StylesOptions = {
  attribute?: string;
  prefix?: string;
};

export default ({
  attribute = defaultAttribute,
  prefix = defaultPrefix,
}: StylesOptions = {}) => {
  const slide = `[${attribute}-slide]`;
  const clone = `[${attribute}-clone]`;
  const progress = `[${attribute}-progress]`;

  return `
  @keyframes ${prefix}-progress {
    from { transform: scaleX(0); }
    to { transform: scaleX(1); }
  }

  ${slide} {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: none;
    pointer-events: none;
  }

  ${clone} {
    display: block;
  }

  .${prefix}-slide--active {
    display: block;
    pointer-events: all;
  }

  ${progress} {
    width: 100%;
    transform: scaleX(0);
    animation: linear forwards paused;
    transform-origin: left;
    transition: opacity .3s ease-out;
  }

  .${prefix}-progress {
    position: absolute;
    width: 1px;
    background: transparent;
    pointer-events: none;
  }
`;
};
