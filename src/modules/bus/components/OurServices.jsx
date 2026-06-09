// src/modules/bus/components/OurServices.jsx
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

// Images
import flights from "../../../assets/flights.jpg";
import bus from "../../../assets/bus.jpg";
import hotels from "../../../assets/hotels.jpg";
import holiday from "../../../assets/holiday.jpg";
import cab from "../../../assets/cab.jpg";
import bill from "../../../assets/bill.png";
import service from "../../../../public/assets/Service.jpg";

/* Card slightly lifts + shadow grows on hover */
const cardLift = {
  rest: {
    y: 0,
    boxShadow: "0 8px 22px rgba(15, 23, 42, 0.12)",
  },
  hover: {
    y: -6,
    boxShadow: "0 26px 55px rgba(15, 23, 42, 0.28)",
    transition: { type: "spring", stiffness: 220, damping: 18 },
  },
};

/* Background image zoom in / zoom out */
const imageZoom = {
  rest: { scale: 1 },
  hover: { scale: 1.12, transition: { duration: 0.6, ease: "easeOut" } },
};

/* Extra dark overlay deepens on hover (so revealed text is readable) */
const overlayShift = {
  rest: { opacity: 0 },
  hover: { opacity: 1, transition: { duration: 0.3 } },
};

/* Description reveals just below the heading on hover (last image effect) */
const descReveal = {
  rest: { height: 0, opacity: 0, marginTop: 0 },
  hover: {
    height: "auto",
    opacity: 1,
    marginTop: 8,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

/* CTA arrow nudge */
const arrowNudge = {
  rest: { x: 0 },
  hover: { x: 4 },
};

/* Desktop grid entry animation */
const cardEntry = {
  hidden: { opacity: 0, y: 24 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.45, ease: "easeOut" },
  }),
};

function ServiceCard({ image, title, description, contain, route, light }) {
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
      className={`group relative w-[74vw] sm:w-[300px] md:w-full max-w-[360px] h-52 sm:h-56 md:h-60 flex-shrink-0 md:flex-shrink overflow-hidden rounded-[26px] border ${
        light
          ? "border-slate-200 bg-gradient-to-br from-[#f5f6f8] to-[#e7e9ec]"
          : "border-slate-200/40 bg-slate-900"
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
          padding: contain ? "30px" : "0",
        }}
      />

      {/* Dark gradients ONLY for image cards (not the light Bill Payments card) */}
      {!light && (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/5" />
          <motion.div
            variants={overlayShift}
            className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/10"
          />
        </>
      )}

      {/* Content pinned to bottom — grows upward as description reveals */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-5 text-left">
        <h3
          className={`text-lg sm:text-xl font-bold leading-tight ${
            light ? "text-slate-900" : "text-white drop-shadow-md"
          }`}
        >
          {title}
        </h3>

        {/* Description — hidden by default, slides open below heading on hover */}
        <motion.div variants={descReveal} className="overflow-hidden">
          <p
            className={`pr-1 text-[13px] leading-snug line-clamp-4 ${
              light ? "text-slate-600" : "text-white/90"
            }`}
          >
            {description}
          </p>
        </motion.div>

        {/* CTA */}
        <div
          className={`mt-3 flex items-center gap-1.5 text-sm font-semibold ${
            light ? "text-[#fd561e]" : "text-white"
          }`}
        >
          <span>Explore Service</span>
          <motion.svg
            variants={arrowNudge}
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fd561e"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 18l6-6-6-6" />
          </motion.svg>
        </div>
      </div>
    </motion.div>
  );
}

export default function OurServices() {
  const services = [
    {
      image: bus,
      title: "Bus Ticketing",
      description:
        "Convenient and affordable online bus ticket booking through our website and BOBROS mobile App (Get it on Google Play Store).",
      route: "/",
    },
    {
      image: flights,
      title: "Flights",
      description:
        "Quick and hassle-free flight bookings for domestic and international travel. Visit any branch or contact us for bookings.",
      route: "/flights",
    },
    {
      image: bill,
      title: "Bill Payments",
      description:
        "Simplifying your bill payments. Safe, fast, and convenient payments across all services.",
      contain: true,
      light: true,
      route: "/BillHomePage",
    },
    {
      image: hotels,
      title: "Hotels",
      description:
        "Book comfortable stays at top hotels with ease and flexibility. Visit any branch or contact us for bookings.",
      route: "/hotels",
    },
    {
      image: holiday,
      title: "Holiday Package",
      description:
        "Curated travel packages to explore the best destinations. Visit any branch or contact us for bookings.",
      route: "/Holiday",
    },
    {
      image: cab,
      title: "Cab Service",
      description:
        "Affordable and convenient cab rentals for personal travel or business commute. Visit any branch or contact us for bookings.",
    },
    {
      image: service,
      title: "IT Services",
      description:
        "Reliable IT services to support your business and enhance your operations. Visit any branch or contact our Business Analyst for more info.",
      route: "/ItService",
    },
  ];

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

        {/* Mobile auto scroll */}
        <div className="mt-8 md:hidden overflow-hidden">
          <motion.div
            className="flex w-max gap-4"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              duration: 22,
              ease: "linear",
              repeat: Infinity,
            }}
          >
            {[...services, ...services].map((service, index) => (
              <div key={index} className="flex-shrink-0">
                <ServiceCard {...service} />
              </div>
            ))}
          </motion.div>
        </div>

        {/* Desktop grid */}
        <div className="mt-10 hidden md:grid grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              variants={cardEntry}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              custom={index}
              className="flex justify-center"
            >
              <ServiceCard {...service} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}