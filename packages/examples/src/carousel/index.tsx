import React, { useEffect, useState } from "react";
import { render } from "react-dom";

import { createCarousel } from "fluid-carousel";
// import { Carousel } from "react-fluid-carousel";

const chevron = (
  <svg viewBox="0 0 21 28">
    <path d="M18.297 4.703l-8.297 8.297 8.297 8.297c0.391 0.391 0.391 1.016 0 1.406l-2.594 2.594c-0.391 0.391-1.016 0.391-1.406 0l-11.594-11.594c-0.391-0.391-0.391-1.016 0-1.406l11.594-11.594c0.391-0.391 1.016-0.391 1.406 0l2.594 2.594c0.391 0.391 0.391 1.016 0 1.406z"></path>
  </svg>
);

const App = () => {
  useEffect(() => {
    createCarousel({});
  }, []);

  return <div id="container"></div>;
};

render(<App />, document.getElementById("root"));
