import React, { useEffect, useState, useRef } from "react";

const HeroCarousel = () => {
  const slides = [
    { type: "video", src: "/videos/join_bobros.mp4", caption: null },
    {
      type: "video",
      src: "/videos/bus_ticket.mp4",
      caption: {
        title: "Bus Tickets",
        desc: "Book from 10,000 plus routes across India",
      },
    },
    { type: "video", src: "/videos/wishes.mp4", caption: null },
    { type: "video", src: "/videos/taxi1.mp4", caption: null },
    { type: "image", src: "/videos/Holidays_Packages_ba.png", caption: null },
  ];

  // 👇 Add fake slides at start & end for infinite effect
  const extendedSlides = [slides[slides.length - 1], ...slides, slides[0]];

  const [current, setCurrent] = useState(1); // start from real first slide
  const [transition, setTransition] = useState(true);
  const intervalRef = useRef(null);

  // autoplay
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      nextSlide();
    }, 4500);

    return () => clearInterval(intervalRef.current);
  }, []);

  const nextSlide = () => {
    setTransition(true);
    setCurrent((prev) => prev + 1);
  };

  const prevSlide = () => {
    setTransition(true);
    setCurrent((prev) => prev - 1);
  };

  // 🔥 Infinite loop fix
  useEffect(() => {
    if (current === extendedSlides.length - 1) {
      setTimeout(() => {
        setTransition(false);
        setCurrent(1);
      }, 700);
    }

    if (current === 0) {
      setTimeout(() => {
        setTransition(false);
        setCurrent(extendedSlides.length - 2);
      }, 700);
    }
  }, [current]);

  return (
    <div className="w-full lg:w-[900px]  relative overflow-hidden shadow-md ml-8">
      {/* Slides */}
      <div className="relative w-full h-[520px] flex item-center">
        <div
          className={`flex h-full ${
            transition ? "transition-transform duration-700 ease-in-out" : ""
          }`}
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {extendedSlides.map((slide, index) => (
            <div key={index} className="min-w-full h-full relative">
              {slide.type === "video" ? (
                <video
                  src={slide.src}
                  autoPlay
                  muted
                  loop
                  className="w-full h-full object-containe md:object-cover"
                />
              ) : (
                <img
                  src={slide.src}
                  alt="slide"
                  className="w-full h-full object-containe md:object-cover"
                />
              )}

              {slide.caption && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-center">
                  <h5 className="text-xl font-semibold">
                    {slide.caption.title}
                  </h5>
                  <p className="text-sm">{slide.caption.desc}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Left Arrow */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 
             bg-black/50 text-white w-10 h-10 flex items-center justify-center 
             rounded-full hover:bg-black/70 transition"
      >
        ❮
      </button>

      {/* Right Arrow */}
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 
             bg-black/50 text-white w-10 h-10 flex items-center justify-center 
             rounded-full hover:bg-black/70 transition"
      >
        ❯
      </button>
    </div>
  );
};

export default HeroCarousel;
