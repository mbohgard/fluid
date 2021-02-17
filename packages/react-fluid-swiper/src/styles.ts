export const prefix = `fluid-swiper`;

export default () => `
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

  .${prefix}-item-wrapper {
    display: inline-block;
    height: 100%;
    margin: 0;
    perspective: 800px;
    position: relative;
    white-space: initial;
    vertical-align: middle;
  }

  .${prefix}-item-wrapper--dynamic {
    height: auto;
  }

  .${prefix}-item {
    display: flex;
    height: inherit;
    align-items: center;
    justify-content: center;
  }
`;
