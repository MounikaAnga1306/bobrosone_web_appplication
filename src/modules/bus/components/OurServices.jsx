// src/modules/bus/components/OurServices.jsx
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

// Images
import flights from "../../../assets/flights.jpg";
import bus from "../../../assets/bus.jpg";
import hotels from "../../../assets/hotels.jpg";
import holiday from "../../../assets/holiday.jpg";
import cab from "../../../assets/cab.jpg";
import bill from "../../../assets/bill.png";
import service from "../../../assets/IT_Services.jpg";

// Image hover animation
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

// Entry animation
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

// Card hover animation
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

// Service Card Component
function ServiceCard({ image, title, description, contain }) {
  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      animate="rest"
      variants={cardHover}
      className="group relative bg-white hover:bg-gradient-to-br hover:from-[#fff1ea] hover:via-[#ffe2d6] hover:to-[#ffd2c1] rounded-2xl px-5 sm:px-6 pb-6 pt-20 sm:pt-24 flex flex-col items-center text-center mt-16 transition-colors duration-300 w-full"
      style={{ minHeight: "280px" }}
    >
      {/* Image */}
      <motion.div
        variants={imageHover}
        className="absolute -top-14 sm:-top-16 left-1/2 -translate-x-1/2 w-28 h-20 sm:w-36 sm:h-24 md:w-40 md:h-28 rounded-xl overflow-hidden border-[5px] sm:border-[6px] border-white shadow-xl bg-white flex items-center justify-center z-10"
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
        className="text-base sm:text-lg md:text-xl font-bold mb-2 relative"
      >
        {title}

        <motion.span
          variants={{
            rest: { width: 0, opacity: 0, left: "50%" },
            hover: { width: "60%", opacity: 1, left: "20%" },
          }}
          className="absolute -bottom-1 h-[2.5px] bg-gradient-to-r from-[#fd561e] to-[#ff8a5c] rounded-full"
        />
      </motion.h3>

      {/* Description */}
      <motion.p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed max-w-xs sm:max-w-sm">
        {description}
      </motion.p>
    </motion.div>
  );
}

// Main Component
export default function OurServices() {
  const services = [
    {
      image: bus,
      title: "Bus Ticketing",
      description:
        "Convenient and affordable bus ticket booking through our website and BOBROS mobile app.",
    },
    {
      image: flights,
      title: "Flights",
      description:
        "Quick and hassle-free flight bookings for domestic and international travel.",
    },
    {
      image: bill,
      title: "Bill Payments",
      description:
        "Safe, fast, and convenient payments across all services.",
      contain: true,
    },
    {
      image: hotels,
      title: "Hotels",
      description:
        "Book comfortable stays at top hotels with ease and flexibility.",
    },
    {
      image: holiday,
      title: "Holiday Package",
      description:
        "Curated travel packages to explore the best destinations.",
    },
    {
      image: cab,
      title: "Cab Service",
      description:
        "Affordable cab rentals for personal and business travel.",
    },
    {
      image: service,
      title: "IT Services",
      description:
        "Reliable IT services to support your business operations.",
    },
  ];

  return (
    <div className="bg-white py-16 sm:py-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-12 text-gray-900">
          Our Services
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {services.map((service, index) => (
            <motion.div
              key={index}
              variants={cardEntry}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              custom={index}
            >
              <ServiceCard {...service} />
            </motion.div>
          ))}
        </div>

        {/* CTA SECTION */}
        <div className="mt-14">
          <div className="relative bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl overflow-hidden">
            
            {/* ✅ FIXED BACKGROUND */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='none'/%3E%3Cpath d='M20 0v40M0 20h40' stroke='%23ffffff' stroke-width='0.5'/%3E%3C/svg%3E")`,
              }}
            ></div>

            {/* <div className="relative px-8 py-12 text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Ready to Get Started?
              </h2>
              <p className="text-gray-300 mb-6">
                Experience seamless service with our expert support team
              </p>

              <button className="inline-flex items-center gap-2 px-8 py-3 bg-white text-gray-900 rounded-full font-semibold">
                Contact Our Team
                <ChevronRight className="w-4 h-4" />
              </button>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}