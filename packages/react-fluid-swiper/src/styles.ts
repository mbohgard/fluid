export const defaultPrefix = `fluid-swiper`;
export const defaultFocusedPrefix = `${defaultPrefix}-focused`;

type StylesOptions = {
  prefix?: string;
  focused?: boolean;
};

export default ({ prefix = defaultPrefix }: StylesOptions = {}) => {
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
    white-space: nowrap;
    box-sizing: border-box;
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
    padding: 40px 0;
    height: 100%;
  }

  .${prefix}-item-wrapper, .${focusedPrefix}-item-wrapper {
    display: inline-block;
    height: 100%;
    width: 50vw;
    margin: 0;
    perspective: 800px;
    position: relative;
    transform: scale(1);
    transition: transform 0.5s;
  }

  .${focusedPrefix}-item-wrapper.active {
    transform: scale(1.1);
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
    background: #fff;
    transition: box-shadow 0.4s;
    transform-style: preserve-3d;
    width: 100%;
    height: 100%;
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
  }

  .${focusedPrefix}-item.active {
    box-shadow: 0 15px 20px -8px rgba(0, 0, 0, 0.3);
  }
`;
};
