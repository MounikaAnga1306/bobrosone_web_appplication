// src/modules/bus/components/OurServices.jsx
import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

// Images
import flights from "/assets/Flight_booking.png";
import bus from "/assets/bus_booking.png";
import hotels from "/assets/hotel_booking.png";
import holiday from "/assets/Holiday_booking.png";
import cab from "/assets/cab_booking.png";
import bill from "/assets/billpayment_booking.png";
import service from "/assets/It_Service.png";

/* ---------- Per-card hover animations ---------- */

/* Card lifts up + shadow grows on hover */
const cardLift = {
  rest: { y: 0, boxShadow: "0 10px 25px rgba(15, 23, 42, 0.15)" },
  hover: {
    y: -10,
    boxShadow: "0 30px 60px rgba(15, 23, 42, 0.35)",
    transition: { type: "spring", stiffness: 220, damping: 18 },
  },
};

/* Background image zoom on hover */
const imageZoom = {
  rest: { scale: 1 },
  hover: { scale: 1.14, transition: { duration: 0.7, ease: "easeOut" } },
};

/* Extra dark overlay deepens on hover (keeps text readable) */
const overlayShift = {
  rest: { opacity: 0 },
  hover: { opacity: 1, transition: { duration: 0.35 } },
};

/* CTA arrow nudge on hover */
const arrowNudge = {
  rest: { x: 0 },
  hover: { x: 5 },
};

function ServiceCard({
  image,
  title,
  description,
  cta,
  accent,
  contain,
  light,
  route,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = () => {
    if (!route) return;
    if (location.pathname === route) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate(route);
    }
  };

  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      animate="rest"
      variants={cardLift}
      onClick={handleClick}
      className={`group relative h-[470px] w-[210px] sm:w-[220px] flex-shrink-0 overflow-hidden border ${
        light
          ? "border-slate-200 bg-gradient-to-br from-[#f7f8fa] to-[#e8eaee]"
          : "border-white/10 bg-slate-900"
      } ${route ? "cursor-pointer" : "cursor-default"}`}
    >
      {/* Background image — zooms in on hover */}
      <motion.img
        variants={imageZoom}
        src={image}
        alt={title}
        className="absolute inset-0 h-full w-full"
        style={{
          objectFit: contain ? "contain" : "cover",
          padding: contain ? "34px" : "0",
        }}
      />

      {/* Dark gradients ONLY for image cards (not the light Bill Payments card) */}
      {!light && (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
          <motion.div
            variants={overlayShift}
            className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/10"
          />
        </>
      )}

      {/* Title pinned to top */}
      <div className="absolute inset-x-0 top-0 z-10 p-5">
        <h3
          className={`text-2xl font-extrabold leading-tight ${
            light ? "text-slate-900" : "text-white drop-shadow-md"
          }`}
        >
          {title}
        </h3>
      </div>

      {/* Description + CTA pinned to bottom */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-5 text-left">
        <p
          className={`mb-4 text-sm font-medium leading-snug line-clamp-3 ${
            light ? "text-slate-600" : "text-white/90"
          }`}
        >
          {description}
        </p>

        <span
          className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-lg"
          style={{ backgroundColor: accent }}
        >
          {cta}
          <motion.svg
            variants={arrowNudge}
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 18l6-6-6-6" />
          </motion.svg>
        </span>
      </div>
    </motion.div>
  );
}

/* Round arrow button for manual scrolling */
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
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={isLeft ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} />
      </svg>
    </button>
  );
}

export default function OurServices() {
  const services = [
    {
      image: bus,
      title: "Bus Ticketing",
      description:
        "Convenient and affordable online bus ticket booking through our website and BOBROS mobile App (Get it on Google Play Store).",
      cta: "Book Bus",
      accent: "#fd561e",
      route: "/",
    },
    {
      image: flights,
      title: "Flights",
      description:
        "Quick and hassle-free flight bookings for domestic and international travel. Visit any branch or contact us for bookings.",
      cta: "Search Flights",
      accent: "#2563eb",
      route: "/flights",
    },
    {
      image: bill,
      title: "Bill Payments",
      description:
        "Simplifying your bill payments. Safe, fast, and convenient payments across all services.",
      cta: "Pay Bills",
      accent: "#059669",
      route: "/BillHomePage",
    },
    {
      image: hotels,
      title: "Hotels",
      description:
        "Book comfortable stays at top hotels with ease and flexibility. Visit any branch or contact us for bookings.",
      cta: "Book Stay",
      accent: "#d97706",
      route: "/hotels",
    },
    {
      image: holiday,
      title: "Holiday Package",
      description:
        "Curated travel packages to explore the best destinations. Visit any branch or contact us for bookings.",
      cta: "Plan Trip",
      accent: "#0d9488",
      route: "/Holiday",
    },
    {
      image: cab,
      title: "Cab Service",
      description:
        "Affordable and convenient cab rentals for personal travel or business commute. Visit any branch or contact us for bookings.",
      cta: "Book Cab",
      accent: "#7c3aed",
    },
    {
      image: service,
      title: "IT Services",
      description:
        "Reliable IT services to support your business and enhance your operations. Visit any branch or contact our Business Analyst for more info.",
      cta: "Learn More",
      accent: "#4f46e5",
      route: "/ItService",
    },
  ];

  const trackRef = useRef(null);
  const [paused, setPaused] = useState(false);

  // Continuous auto-scroll (seamless loop). Pauses on hover / touch.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    let raf;
    const tick = () => {
      if (!paused) {
        el.scrollLeft += 0.6; // scroll speed
        const half = el.scrollWidth / 2; // width of one full set
        if (half > 0 && el.scrollLeft >= half) {
          el.scrollLeft -= half; // jump back seamlessly
        }
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused]);

  // Manual scroll by one card via the arrow buttons
  const nudge = (direction) => {
    const el = trackRef.current;
    if (!el) return;
    const amount = 244; // card width + gap
    const half = el.scrollWidth / 2;

    // keep the left direction looping seamlessly
    if (direction === "left" && el.scrollLeft < amount && half > 0) {
      el.scrollLeft += half;
    }
    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

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
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-1.5 text-sm font-semibold text-[#fd561e]">
            Our Services
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
            Everything you need in one place
          </h1>
          <p className="mt-2 text-sm sm:text-base leading-relaxed text-slate-600">
            Clean, modern, and easy-to-use services for travel and business.
          </p>
        </motion.div>

        {/* Carousel: auto-scroll + manual arrows on every screen size.
            Pause handlers live on the WRAPPER so hovering the arrows pauses too,
            which lets the smooth scroll work instead of being overridden. */}
        <div
          className="relative mt-10"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => setPaused(false)}
        >
          <ArrowButton direction="left" onClick={() => nudge("left")} />
          <ArrowButton direction="right" onClick={() => nudge("right")} />

          <div
            ref={trackRef}
            className="flex gap-6 overflow-x-auto px-2 py-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {[...services, ...services].map((s, index) => (
              <ServiceCard key={index} {...s} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}