import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import {
  Bus,
  Plane,
  Building2,
  Umbrella,
  Car,
  CreditCard,
  Monitor,
  ChevronRight,
} from "lucide-react";

// Images
import flights from "../../../assets/flights.jpg";
import bus from "../../../assets/bus.jpg";
import hotels from "../../../assets/hotels.jpg";
import holiday from "../../../assets/holiday.jpg";
import cab from "../../../assets/cab.jpg";
import bill from "../../../assets/bill.png";
import service from "../../../assets/IT_Services.jpg";

// Animations
const imageHover = {
  rest: { y: 0, scale: 1, rotate: 0 },
  hover: {
    y: -8,
    scale: 1.1,
    rotate: 2,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 14,
    },
  },
};

const cardEntry = {
  hidden: { opacity: 0, y: 30 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.06,
      duration: 0.5,
      ease: "easeOut",
    },
  }),
};

const cardHover = {
  rest: {
    y: 0,
    boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
    scale: 1,
  },
  hover: {
    y: -8,
    boxShadow: "0 25px 40px rgba(253,86,30,0.15)",
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 18,
    },
  },
};

// Service Card
function ServiceCard({ image, title, description, contain }) {
  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      animate="rest"
      variants={cardHover}
      className="
        group
        relative bg-white 
        hover:bg-gradient-to-br 
        hover:from-[#fff1ea] 
        hover:via-[#ffe2d6] 
        hover:to-[#ffd2c1]
        rounded-2xl
        px-5 sm:px-6
        pb-6 pt-20 sm:pt-24
        flex flex-col items-center text-center
        mt-16
        transition-colors duration-300
        w-full
      "
      style={{
        minHeight: "280px",
        width: "100%",
      }}
    >
      {/* Image */}
      <motion.div
        variants={imageHover}
        className="
          absolute -top-14 sm:-top-16
          left-1/2 -translate-x-1/2
          w-28 h-20
          sm:w-36 sm:h-24
          md:w-40 md:h-28
          rounded-xl overflow-hidden
          border-[5px] sm:border-[6px] border-white
          shadow-xl bg-white
          flex items-center justify-center
          z-10
        "
      >
        <img
          src={image}
          alt={title}
          className={`w-full h-full ${
            contain ? "object-contain p-2" : "object-cover"
          }`}
        />
      </motion.div>

      {/* Title */}
      <motion.h3
        variants={{
          rest: { y: 0, color: "#111827" },
          hover: { y: -3, color: "#fd561e", scale: 1.02 },
        }}
        transition={{ type: "spring", stiffness: 300, damping: 12 }}
        className="text-base sm:text-lg md:text-xl font-bold mb-2 relative"
      >
        {title}

        <motion.span
          variants={{
            rest: { width: 0, opacity: 0, left: "50%" },
            hover: {
              width: "60%",
              opacity: 1,
              left: "20%",
            },
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="absolute -bottom-1 h-[2.5px] bg-gradient-to-r from-[#fd561e] to-[#ff8a5c] rounded-full"
        />
      </motion.h3>

      {/* Description */}
      <motion.p
        variants={{
          rest: { opacity: 0.9, y: 0 },
          hover: { opacity: 1, y: -2 },
        }}
        transition={{ duration: 0.2 }}
        className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed max-w-xs sm:max-w-sm"
      >
        {description}
      </motion.p>

      {/* Shine */}
      <motion.div
        variants={{
          rest: { opacity: 0, x: "-100%" },
          hover: {
            opacity: 0.2,
            x: "100%",
            transition: { duration: 0.6, ease: "easeInOut" },
          },
        }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none rounded-2xl"
      />
    </motion.div>
  );
}

// Main Component
export default function Service() {
  const services = [
    {
      image: bus,
      title: "Bus Ticketing",
      description:
        "Convenient and affordable bus ticket booking through our website and BOBROS mobile app(Get it on Google Play Store).",
    },
    {
      image: flights,
      title: "Flights",
      description:
        "Quick and hassle-free flight bookings(off-line)for domestic and international travel. For bookings, visit any of our branch or contact us",
    },
    {
      image: bill,
      title: "Bill Payments",
      description:
        "Simplifying your bill payments. Safe, fast, and convenient payments across all services.",
      contain: true,
    },
    {
      image: hotels,
      title: "Hotels",
      description:
        "Book comfortable stays at top hotels with ease and flexibility. Visit any branch or contact us for bookings",
    },
    {
      image: holiday,
      title: "Holiday Package",
      description:
        "Curated travel packages to explore the best destinations. To know more about our packages and for bookings,visit any of our branch or contact us",
    },
    {
      image: cab,
      title: "Cab Service",
      description:
        "Affordable cab rentals for personal travel or business commute. For bookings,visit any of our branch or contact us",
    },
    {
      image: service,
      title: "IT Services",
      description:
        "Reliable IT services to support and enhance your business operations. Visit any branch or contact our analyst.",
    },
  ];

  return (
    <div className="bg-white py-16 sm:py-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl -mt-10 sm:text-4xl md:text-5xl font-bold text-center mb-12 sm:mb-16 text-gray-900">
          Our Services
        </h1>

        <div
          className="
            grid 
            grid-cols-1 
            sm:grid-cols-2 
            lg:grid-cols-3 
            gap-x-6 sm:gap-x-10 
            gap-y-16 sm:gap-y-20
            justify-items-center
          "
        >
          {services.map((service, index) => (
            <motion.div
              key={index}
              variants={cardEntry}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
              custom={index}
              className="w-full max-w-[350px]"
            >
              <ServiceCard {...service} />
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-20"
        >
          <div className="relative bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl overflow-hidden">
            <div className="relative px-8 py-12 sm:px-12 sm:py-16 text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Ready to Get Started?
              </h2>
              <p className="text-gray-300 mb-8 max-w-md mx-auto">
                Experience seamless service with our expert support team
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-8 py-3 bg-white text-gray-900 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Contact Our Team
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}