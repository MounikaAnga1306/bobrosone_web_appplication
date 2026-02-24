import { motion } from "framer-motion";

// ✅ Your local images (unchanged)
import flights from "../../../assets/flights.jpg";
import bus from "../../../assets/bus.jpg";
import hotels from "../../../assets/hotels.jpg";
import holiday from "../../../assets/holiday.jpg";
import cab from "../../../assets/cab.jpg";
import bill from "../../../assets/bill.png";
import service from "../../../assets/IT_Services.jpg";

// ✅ Image hover animation (NO looping now)
const imageHover = {
  rest: { y: 0, scale: 1 },
  hover: {
    y: -6,
    scale: 1.12,
    transition: { type: "spring", stiffness: 260, damping: 16 },
  },
};

// ✅ Card hover animation (clean lift)
const cardHover = {
  rest: { y: 0, boxShadow: "0 10px 20px rgba(0,0,0,0.08)" },
  hover: {
    y: -10,
    boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
    transition: { type: "spring", stiffness: 160, damping: 16 },
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
        relative bg-white 
        hover:bg-gradient-to-br 
        hover:from-[#fff1ea] 
        hover:via-[#ffe2d6] 
        hover:to-[#ffd2c1]
        hover:text-[#fd561e]
        rounded-2xl
        px-5 sm:px-6
        pb-6 pt-20 sm:pt-24
        flex flex-col items-center text-center
        mt-16
        transition-all duration-300
      "
    >
      {/* ✅ Responsive Image */}
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

      <h3 className="text-base sm:text-lg md:text-xl font-bold mb-2 text-gray-900">
        {title}
      </h3>

      <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed max-w-xs sm:max-w-sm">
        {description}
      </p>
    </motion.div>
  );
}

// Main Page
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
        "Quick and hassle-free flight bookings(off-line)for domestic and international travel.For bookings, visit any of our branch or contact us",
    },
    {
      image: bill,
      title: "Bill Payment",
      description:
        "Simplifying your bill payments.Safe, fast, and convenient payments across all services.",
      contain: true,
    },
    {
      image: hotels,
      title: "Hotels",
      description:
        "Book comfortable stays at top hotels with ease and flexibility.Visit any branch or contact us for bookings",
    },
    {
      image: holiday,
      title: "Holiday Package",
      description:
        "Curated travel packages to explore the best destinations.To know more about our packages and for bookings,visit any of our branch or contact us",
    },
    {
      image: cab,
      title: "Cab Service",
      description:
        "Affordable cab rentals for personal travel or business commute.For bookings,visit any of our branch or contact us",
    },
    {
      image: service,
      title: "IT Services",
      description:
        "Reliable IT services to support and enhance your business operations. Visit any branch or contact our analyst.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-16 sm:py-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-12 sm:mb-16 text-orange-500">
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
        "
        >
          {services.map((service, index) => (
            <ServiceCard key={index} {...service} />
          ))}
        </div>
      </div>
    </div>
  );
}
