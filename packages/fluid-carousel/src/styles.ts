export const defaultPrefix = `fluid-carousel`;
export const defaultAttribute = `data-carousel`;

export const makeClass = (prefix = defaultPrefix) => (name: string) =>
  `${prefix}-${name}`;

type StylesOptions = {
  attribute?: string;
  prefix?: string;
};

export default ({
  attribute = defaultAttribute,
  prefix = defaultPrefix,
}: StylesOptions = {}) => {
  const root = `[${attribute}-root]`;
  const slide = `[${attribute}-slide]`;
  const clone = `[${attribute}-clone]`;

  return `
  ${root} {
    position: relative;
    box-sizing: border-box;
  }

  ${slide} {
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

  ${clone} {
    display: block;
  }

  .${prefix}-slide--activating {
    display: block;
  }

  .${prefix}-slide--active {
    display: block;
    opacity: 1;
    pointer-events: all;
  }

  .${prefix}-slide--deactivating {
    opacity: 0;
    pointer-events: none;
  }
`;
};
