// src/modules/bus/components/OurServices.jsx
import { useRef, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

import flights from "/assets/Flight_booking.png";
import bus from "/assets/bus_booking.png";
import hotels from "/assets/hotel_booking.png";
import holiday from "/assets/Holiday_booking.png";
import cab from "/assets/cab_booking.png";
import bill from "/assets/billpayment_booking.png";
import service from "/assets/It_Service.png";

const CARD_WIDTH = 220;
const CARD_GAP = 24;
const CARD_STEP = CARD_WIDTH + CARD_GAP; // 244px

const cardLift = {
  rest: { y: 0, boxShadow: "0 10px 25px rgba(15,23,42,0.15)" },
  hover: {
    y: -10,
    boxShadow: "0 30px 60px rgba(15,23,42,0.35)",
    transition: { type: "spring", stiffness: 220, damping: 18 },
  },
};
const imageZoom = {
  rest: { scale: 1 },
  hover: { scale: 1.14, transition: { duration: 0.7, ease: "easeOut" } },
};
const overlayShift = {
  rest: { opacity: 0 },
  hover: { opacity: 1, transition: { duration: 0.35 } },
};
const arrowNudge = { rest: { x: 0 }, hover: { x: 5 } };

function ServiceCard({ image, title, description, cta, accent, contain, light, route, imagePosition }) {
  const navigate = useNavigate();
  const location = useLocation();
  const handleClick = () => {
    if (!route) return;
    location.pathname === route
      ? window.scrollTo({ top: 0, behavior: "smooth" })
      : navigate(route);
  };
  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      animate="rest"
      variants={cardLift}
      onClick={handleClick}
      style={{ width: CARD_WIDTH, minWidth: CARD_WIDTH, flexShrink: 0 }}
      className={`group relative h-[400px] overflow-hidden rounded-4xl border ${
        light
          ? "border-slate-200 bg-gradient-to-br from-[#f7f8fa] to-[#e8eaee]"
          : "border-white/10 bg-slate-900"
      } ${route ? "cursor-pointer" : "cursor-default"}`}
    >
      <motion.img
        variants={imageZoom}
        src={image}
        alt={title}
        className="absolute inset-0 h-full w-full"
        style={{
          objectFit: contain ? "contain" : "cover",
          objectPosition: imagePosition || "center center",
          padding: contain ? "34px" : 0,
        }}
      />
      {!light && (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-transparent" />
          <motion.div
            variants={overlayShift}
            className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/10"
          />
        </>
      )}
      <div className="absolute inset-x-0 top-0 z-10 p-5 text-center">
        <h3 className={`text-2xl font-extrabold leading-tight ${light ? "text-slate-900" : "text-white drop-shadow-md"}`}>
          {title}
        </h3>
      </div>
      <div className="absolute inset-x-0 bottom-0 z-10 p-5 text-center">
        <p className={`mb-4 text-sm font-medium leading-snug line-clamp-3 ${light ? "text-slate-600" : "text-white drop-shadow-sm"}`}>
          {description}
        </p>
        <span
          className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-lg"
          style={{ backgroundColor: accent }}
        >
          {cta}
          <motion.svg variants={arrowNudge} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </motion.svg>
        </span>
      </div>
    </motion.div>
  );
}

function ArrowButton({ direction, onClick }) {
  const isLeft = direction === "left";
  return (
    <button
      type="button"
      aria-label={isLeft ? "Scroll left" : "Scroll right"}
      onClick={onClick}
      className={`absolute top-1/2 z-20 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full bg-white text-slate-700 shadow-[0_8px_24px_rgba(15,23,42,0.18)] ring-1 ring-slate-200 transition hover:bg-[#fd561e] hover:text-white ${
        isLeft ? "left-1 sm:left-2" : "right-1 sm:right-2"
      }`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d={isLeft ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} />
      </svg>
    </button>
  );
}

export default function OurServices() {
  const services = [
    { image: bus,     title: "Bus Ticketing",   description: "Convenient and affordable online bus ticket booking through our website and BOBROS mobile App (Get it on Google Play Store).", cta: "Book Bus",       accent: "#fd561e", route: "/",            imagePosition: "center 65%" },
    { image: flights, title: "Flights",          description: "Quick and hassle-free flight bookings for domestic and international travel. Visit any branch or contact us for bookings.",      cta: "Search Flights", accent: "#2563eb", route: "/flights",      imagePosition: "center 75%" },
    { image: bill,    title: "Bill Payments",    description: "Simplifying your bill payments. Safe, fast, and convenient payments across all services.",                                       cta: "Pay Bills",      accent: "#059669", route: "/BillHomePage"  },
    { image: hotels,  title: "Hotels",           description: "Book comfortable stays at top hotels with ease and flexibility. Visit any branch or contact us for bookings.",                   cta: "Book Stay",      accent: "#d97706", route: "/hotels"        },
    { image: holiday, title: "Holiday Package",  description: "Curated travel packages to explore the best destinations. Visit any branch or contact us for bookings.",                        cta: "Plan Trip",      accent: "#0d9488", route: "/Holiday"       },
    { image: cab,     title: "Cab Service",      description: "Affordable and convenient cab rentals for personal travel or business commute. Visit any branch or contact us for bookings.",   cta: "Book Cab",       accent: "#7c3aed",                          imagePosition: "center 60%" },
    { image: service, title: "IT Services",      description: "Reliable IT services to support your business and enhance your operations. Visit any branch or contact our Business Analyst for more info.", cta: "Learn More", accent: "#4f46e5", route: "/ItService" },
  ];

  const N = services.length; // 7
  const SET_WIDTH = N * CARD_STEP; // width of one full set in px

  // scrollPos is the raw pixel offset (always increasing for right, decreasing for left)
  // We render 3 sets. The "visible window" is always in set 1 (middle).
  // When scrollPos exits the middle set range, we silently jump by SET_WIDTH.
  const scrollPos = useRef(SET_WIDTH); // start at beginning of middle set
  const trackRef  = useRef(null);
  const rafRef    = useRef(null);
  const paused    = useRef(false);
  const manualRef = useRef(false); // true while arrow animation is running

  // Apply transform without re-render (direct DOM)
  const applyTransform = useCallback((pos) => {
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(${-pos}px)`;
    }
  }, []);

  // Silently clamp pos into middle set [SET_WIDTH, 2*SET_WIDTH)
  const clampPos = useCallback((pos) => {
    if (pos >= SET_WIDTH * 2) return pos - SET_WIDTH;
    if (pos < SET_WIDTH)      return pos + SET_WIDTH;
    return pos;
  }, [SET_WIDTH]);

  // Init
  useEffect(() => {
    applyTransform(scrollPos.current);
  }, [applyTransform]);

  // Continuous auto-scroll RAF loop
  useEffect(() => {
    const SPEED = 0.7; // px per frame (~42px/s at 60fps)
    const tick = () => {
      if (!paused.current && !manualRef.current) {
        scrollPos.current += SPEED;
        // Seamless loop: when we've passed one full set, silently jump back
        if (scrollPos.current >= SET_WIDTH * 2) {
          scrollPos.current -= SET_WIDTH;
        }
        applyTransform(scrollPos.current);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [SET_WIDTH, applyTransform]);

  // Arrow click: snap to exact card boundary, animate via CSS transition
  const move = useCallback((dir) => {
    if (manualRef.current) return;
    manualRef.current = true;

    // Current nearest card index (global, across all 3 sets)
    const currentCard = Math.round(scrollPos.current / CARD_STEP);
    // Target card index
    const targetCard  = currentCard + dir; // +1 = right, -1 = left
    const targetPos   = targetCard * CARD_STEP;

    // Enable CSS transition for smooth snap
    if (trackRef.current) {
      trackRef.current.style.transition = "transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94)";
    }

    scrollPos.current = targetPos;
    applyTransform(targetPos);

    // After animation: remove transition, clamp into middle set, resume RAF
    setTimeout(() => {
      scrollPos.current = clampPos(targetPos);
      if (trackRef.current) {
        trackRef.current.style.transition = "none";
      }
      applyTransform(scrollPos.current);
      manualRef.current = false;
    }, 360);
  }, [applyTransform, clampPos]);

  const tripleCards = [...services, ...services, ...services];

  return (
    <section className="bg-slate-50 py-16 sm:py-20 px-4 sm:px-6 overflow-hidden">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-4 max-w-3xl text-center"
        >
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-1.5 text-[20px] font-semibold text-[#fd561e]">
            Our Services
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
            Everything you need in one place
          </h1>
          <p className="mt-2 text-sm sm:text-base leading-relaxed text-slate-600">
            Clean, modern, and easy-to-use services for travel and business.
          </p>
        </motion.div>

        <div
          className="relative mt-10"
          onMouseEnter={() => { paused.current = true; }}
          onMouseLeave={() => { paused.current = false; }}
          onTouchStart={() => { paused.current = true; }}
          onTouchEnd={() => { setTimeout(() => { paused.current = false; }, 1200); }}
        >
          <ArrowButton direction="left"  onClick={() => move(-1)} />
          <ArrowButton direction="right" onClick={() => move(1)}  />

          {/* Clipping window */}
          <div className="overflow-hidden py-6 px-2">
            {/* Sliding track — transform applied directly via ref (no re-render) */}
            <div
              ref={trackRef}
              className="flex"
              style={{
                gap: `${CARD_GAP}px`,
                willChange: "transform",
                transition: "none",
              }}
            >
              {tripleCards.map((s, i) => (
                <ServiceCard key={i} {...s} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}