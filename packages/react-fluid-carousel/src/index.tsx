// import React, { useEffect, useRef, useState} from "react";

// import { makeCarousel, CarouselInit, CarouselMethods, CarouselOptions } from "fluid-carousel";

// export const useCarousel = (options: CarouselOptions = {}) => {
//   const ref = useRef<HTMLDivElement | null>(null);
//   const instance = useRef<CarouselInit | undefined>(undefined)

//   useEffect(() => {
//     if (ref.current) {
//       if (!instance.current) {
//         instance.current = makeCarousel(ref.current)
//       }

//       instance.current()
//     }
//   }, [ref])

//   return {
//     ref
//   }
// }

// export const Carousel = () => {
//   const ref = useRef<HTMLDivElement | null>(null);
//   const carouselInit = useRef<CarouselInit | undefined>(undefined);
//   const [fns, setFns] = useState<CarouselMethods | undefined>(undefined);

// }
