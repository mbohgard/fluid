export const defaultPrefix = `fluid-swiper`;
export const defaultFocusedPrefix = `${defaultPrefix}-focused`;

type StylesOptions = {
  dynamicHeight?: boolean;
  focused?: boolean;
  prefix?: string;
};

export default ({
  prefix = defaultPrefix,
  dynamicHeight,
}: StylesOptions = {}) => {
  const focusedPrefix = `${prefix}-focused`;

  return `
  .${prefix}-container {
    position: relative;
    height: 100%;
  }

  .${prefix} {
    position: absolute;
    width: 100%;
    height: 100%;
    overflow: auto;
    overflow-y: hidden;
    white-space: nowrap;
    box-sizing: border-box;
    scrollbar-width: none;
  }

  .${prefix}::-webkit-scrollbar {
    display: none;
  }

  .${prefix}:hover {
    cursor: ew-resize;
  }

  .${prefix}:active:hover {
    cursor: grabbing;
  }

  .${prefix}-inner {
    list-style: none;
    margin: 0;
    padding: 0;
    height: 100%;
  }

  .${prefix}-inner * {
    -webkit-user-drag: none;
    -khtml-user-drag: none;
    -moz-user-drag: none;
    user-drag: none;
  }

  .${prefix}-item-wrapper, .${focusedPrefix}-item-wrapper {
    display: inline-block;
    height: ${dynamicHeight ? "auto" : "100%"};
    width: 50vw;
    margin: 0;
    perspective: 800px;
    position: relative;
    transition: transform 0.5s;
    white-space: initial;
    vertical-align: middle;
  }

  .${focusedPrefix}-item-wrapper:first-child {
    margin-left: calc(50vw - 25vw);
  }

  .${focusedPrefix}-item-wrapper:last-child {
    margin-right: calc(50vw - 25vw);
  }

  @media (min-width: 640px) {
    .${prefix}-item-wrapper, .${focusedPrefix}-item-wrapper {
      width: 300px;
    }

    .${focusedPrefix}-item-wrapper:first-child {
      margin-left: calc(50vw - 150px);
    }

    .${focusedPrefix}-item-wrapper:last-child {
      margin-right: calc(50vw - 150px);
    }
  }

  .${prefix}-item, .${focusedPrefix}-item {
    display: flex;
    height: ${dynamicHeight ? "auto" : "100%"};
    align-items: center;
    justify-content: center;
    transition: box-shadow 0.4s;
    transform-style: preserve-3d;
  }
`;
};
