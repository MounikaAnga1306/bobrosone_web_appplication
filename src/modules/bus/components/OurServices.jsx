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
import service from "../../../assets/IT_Services.jpg";

const imageHover = {
  rest: { y: 0, scale: 1, rotate: 0 },
  hover: {
    y: -8,
    scale: 1.1,
    rotate: 2,
    transition: { type: "spring", stiffness: 300, damping: 14 },
  },
};

const cardEntry = {
  hidden: { opacity: 0, y: 30 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: "easeOut" },
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
    transition: { type: "spring", stiffness: 200, damping: 18 },
  },
};

function ServiceCard({ image, title, description, contain, route }) {
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
      variants={cardHover}
      onClick={handleClick}
      className={`group relative bg-white hover:bg-gradient-to-br hover:from-[#fff1ea] hover:via-[#ffe2d6] hover:to-[#ffd2c1] rounded-2xl px-5 pb-6 pt-24 flex flex-col items-center text-center transition-colors duration-300 w-full h-full ${
        route ? "cursor-pointer" : "cursor-default"
      }`}
    >
      {/* Fixed size image box - same for ALL cards */}
      <motion.div
        variants={imageHover}
        className="absolute -top-14 left-1/2 -translate-x-1/2 z-10"
        style={{
          width: "120px",
          height: "90px",
          minWidth: "120px",
          minHeight: "90px",
        }}
      >
        <div className="w-full h-full rounded-xl overflow-hidden border-[5px] border-white shadow-xl bg-white flex items-center justify-center">
          <img
            src={image}
            alt={title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: contain ? "contain" : "cover",
              padding: contain ? "6px" : "0",
            }}
          />
        </div>
      </motion.div>

      {/* Title - orange line anni cards ki */}
      <motion.h3
        variants={{
          rest: { y: 0, color: "#111827" },
          hover: { y: -3, color: "#fd561e", scale: 1.02 },
        }}
        className="text-base sm:text-lg font-bold mb-2 relative"
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
      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}

export default function OurServices() {
  const services = [
    {
      image: bus,
      title: "Bus Ticketing",
      description:
        "Convenient and affordable online bus ticket booking through our website and BOBROS mobile App (Get it on Google Play Store)",
      route: "/",
    },
    {
      image: flights,
      title: "Flights",
      description:
        "Quick and hassle-free flight bookings(off-line) for domestic and international travel. For bookings, visit any of our branch or contact us",
      route: "/flights",
    },
    {
      image: bill,
      title: "Bill Payments",
      description:
        "Simplifying your bill payments. Safe, fast, and convenient payments across all services.",
      contain: true,
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
        "Reliable IT services to support your business and enhance your business operations. Visit any branch or contact our Business Analyst for more info.",
         route: "/ItService",
    },
  ];

  return (
    <div className="bg-white py-16 sm:py-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-12 text-gray-900">
          Our Services
        </h1>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-20 items-stretch">
          {services.map((service, index) => (
            <motion.div
              key={index}
              variants={cardEntry}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              custom={index}
              className="mt-14 flex"
            >
              <ServiceCard {...service} />
            </motion.div>
          ))}
        </div>

        {/* CTA SECTION */}
        <div className="mt-14">
          <div className="relative bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl overflow-hidden">
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
              </button>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}