// src/modules/bus/components/ServiceCard.jsx
// PAGE 1 — Bento layout (first image UI)
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

/* =========================================================================
   IMAGES — imports vadaledu. Prati card lo `image` ni string ga pettanu.
   Mee images ni `public/images/` folder lo petti "/images/xxx.jpg" ga vadu,
   leda nerugaa full URL ("https://...") paste chey. Easy ga change cheskovachu.
   ========================================================================= */

/* Card slightly lifts + shadow grows on hover */
const cardLift = {
  rest: { y: 0, boxShadow: "0 8px 22px rgba(15, 23, 42, 0.12)" },
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

/* Extra dark overlay deepens on hover */
const overlayShift = {
  rest: { opacity: 0 },
  hover: { opacity: 1, transition: { duration: 0.3 } },
};

/* Description reveals just below the heading on hover */
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
const arrowNudge = { rest: { x: 0 }, hover: { x: 4 } };

/* Grid entry animation */
const cardEntry = {
  hidden: { opacity: 0, y: 24 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.45, ease: "easeOut" },
  }),
};

/* ---- inline card (peru "Card" — default export ServiceCard tho clash avvakunda) ---- */
function Card({
  image,
  title,
  description,
  contain,
  route,
  light,
  featured,
  imgPosition = "center",
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
      className={`group relative h-full w-full overflow-hidden rounded-[26px] border ${
        light
          ? "border-slate-200 bg-gradient-to-br from-[#f5f6f8] to-[#e7e9ec]"
          : "border-slate-200/40 bg-slate-900"
      } ${route ? "cursor-pointer" : "cursor-default"}`}
    >
      {/* Background image — zooms on hover */}
      <motion.img
        variants={imageZoom}
        src={image}
        alt={title}
        className="absolute inset-0 h-full w-full"
        style={{
          objectFit: contain ? "contain" : "cover",
          objectPosition: imgPosition,
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
          className={`font-bold leading-tight ${
            featured ? "text-xl sm:text-2xl" : "text-lg sm:text-xl"
          } ${light ? "text-slate-900" : "text-white drop-shadow-md"}`}
        >
          {title}
        </h3>

        <motion.div variants={descReveal} className="overflow-hidden">
          <p
            className={`pr-1 text-[13px] leading-snug line-clamp-3 ${
              light ? "text-slate-600" : "text-white/90"
            }`}
          >
            {description}
          </p>
        </motion.div>

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

/* ---- PAGE (default export) ---- */
export default function ServiceCard() {
  const services = [
    {
      image: "/images/bus.jpg", // <- mee image
      title: "Bus Ticketing",
      description:
        "Convenient and affordable online bus ticket booking through our website and BOBROS mobile App (Get it on Google Play Store).",
      route: "/",
      span: "col-span-2 row-span-2",
      featured: true,
    },
    {
      image: "/images/flights.jpg",
      title: "Flights",
      description:
        "Quick and hassle-free flight bookings for domestic and international travel. Visit any branch or contact us for bookings.",
      route: "/flights",
      span: "col-span-2 row-span-1",
      featured: true,
    },
    {
      image: "/images/bill.png",
      title: "Bill Payments",
      description:
        "Simplifying your bill payments. Safe, fast, and convenient payments across all services.",
      contain: true,
      light: true,
      route: "/BillHomePage",
      span: "col-span-1 row-span-1",
    },
    {
      image: "/images/hotels.jpg",
      title: "Hotels",
      description:
        "Book comfortable stays at top hotels with ease and flexibility. Visit any branch or contact us for bookings.",
      route: "/hotels",
      span: "col-span-1 row-span-1",
    },
    {
      image: "/images/holiday.jpg",
      imgPosition: "center 35%", // crop avtundi ante ee value tune chey
      title: "Holiday Package",
      description:
        "Curated travel packages to explore the best destinations. Visit any branch or contact us for bookings.",
      route: "/Holiday",
      span: "col-span-2 row-span-1",
    },
    {
      image: "/images/cab.jpg",
      title: "Cab Service",
      description:
        "Affordable and convenient cab rentals for personal travel or business commute. Visit any branch or contact us for bookings.",
      span: "col-span-1 row-span-1",
    },
    {
      image: "/images/it-services.jpg",
      title: "IT Services",
      description:
        "Reliable IT services to support your business and enhance your operations. Visit any branch or contact our Business Analyst for more info.",
      route: "/ItService",
      span: "col-span-1 row-span-1",
    },

    /* ---------- EXTRA CARDS (image string petti route nuvve add chey) ---------- */
    {
      image: "/images/train.jpg",
      title: "Train Booking",
      description:
        "Book confirmed train tickets across India with live seat availability and instant PNR updates.",
      span: "col-span-1 row-span-1",
    },
    {
      image: "/images/recharge.jpg",
      title: "Recharge",
      description:
        "Instant mobile, DTH, and FASTag recharges. Quick top-ups anytime, anywhere in just a few taps.",
      span: "col-span-1 row-span-1",
    },
    {
      image: "/images/visa.jpg",
      title: "Visa Services",
      description:
        "End-to-end visa assistance for tourist, business, and student travel. Documentation made simple.",
      span: "col-span-1 row-span-1",
    },
    {
      image: "/images/insurance.jpg",
      title: "Travel Insurance",
      description:
        "Stay protected on every trip with affordable travel insurance covering delays, baggage, and medical needs.",
      span: "col-span-1 row-span-1",
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
          className="mx-auto mb-8 max-w-3xl text-center"
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

        {/* Bento grid — 2 cols on mobile, 4 cols on desktop. 11 cards = clean tile. */}
        <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[150px] md:auto-rows-[190px] gap-4">
          {services.map((item, index) => (
            <motion.div
              key={index}
              variants={cardEntry}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              custom={index}
              className={item.span}
            >
              <Card {...item} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}