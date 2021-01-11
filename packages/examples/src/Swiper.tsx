import React, { useMemo } from "react";

import { createSwiper } from "react-fluid-swiper";

const chevron = (
  <svg viewBox="0 0 21 28">
    <path d="M18.297 4.703l-8.297 8.297 8.297 8.297c0.391 0.391 0.391 1.016 0 1.406l-2.594 2.594c-0.391 0.391-1.016 0.391-1.406 0l-11.594-11.594c-0.391-0.391-0.391-1.016 0-1.406l11.594-11.594c0.391-0.391 1.016-0.391 1.406 0l2.594 2.594c0.391 0.391 0.391 1.016 0 1.406z"></path>
  </svg>
);

export const Swiper: React.FC = ({ children }) => {
  const [useSwiper, _Swiper] = useMemo(() => createSwiper(), []);

  const { next, previous, atStart, atEnd } = useSwiper();

  return (
    <div className="track">
      <button disabled={atStart} onClick={() => previous?.()}>
        {chevron}
      </button>
      <_Swiper focusedMode={false}>{children}</_Swiper>
      <button disabled={atEnd} onClick={() => next?.()}>
        {chevron}
      </button>
    </div>
  );
};
