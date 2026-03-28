import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import {
  Bus,
  Plane,
  Building2,
  Umbrella,
  Car,
  CreditCard,
  Monitor,
  ArrowRight,
  Sparkles,
  Shield,
  Clock,
  Star,
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

// ✅ Image hover animation - smoother and more subtle
const imageHover = {
  rest: { y: 0, scale: 1, rotate: 0 },
  hover: {
    y: -8,
    scale: 1.1,
    rotate: 2,
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 14 
    },
  },
};

// ✅ Entry animation - smoother fade from bottom
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

// ✅ Card hover animation - maintains exact same size, only lift and shadow
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
      damping: 18 
    },
  },
  {
    id: "hotels",
    icon: Building2,
    image: hotels,
    title: "Hotel Stays",
    description: "Premium accommodations with best rates and instant confirmation.",
    gradient: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50",
    iconColor: "text-purple-600",
    stat: "5,000+ Hotels",
  },
  {
    id: "holidays",
    icon: Umbrella,
    image: holiday,
    title: "Holiday Packages",
    description: "Curated experiences to breathtaking destinations worldwide.",
    gradient: "from-green-500 to-emerald-500",
    bgColor: "bg-green-50",
    iconColor: "text-green-600",
    stat: "100+ Destinations",
  },
  {
    id: "cabs",
    icon: Car,
    image: cab,
    title: "Cab Services",
    description: "Reliable rides for airport transfers and outstation travel.",
    gradient: "from-teal-500 to-cyan-500",
    bgColor: "bg-teal-50",
    iconColor: "text-teal-600",
    stat: "24/7 Availability",
  },
  {
    id: "bills",
    icon: CreditCard,
    image: bill,
    title: "Bill Payments",
    description: "Secure, instant payments for all utilities and services.",
    gradient: "from-yellow-500 to-orange-500",
    bgColor: "bg-yellow-50",
    iconColor: "text-yellow-600",
    stat: "Instant Processing",
    contain: true,
  },
  {
    id: "it",
    icon: Monitor,
    image: service,
    title: "IT Services",
    description: "Enterprise solutions for digital transformation.",
    gradient: "from-indigo-500 to-purple-500",
    bgColor: "bg-indigo-50",
    iconColor: "text-indigo-600",
    stat: "99.9% Uptime",
    contain: true,
  },
];

// Floating particles background component
const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-orange-200 rounded-full"
        initial={{
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
        }}
        animate={{
          y: [null, -100, -200],
          opacity: [0, 0.5, 0],
        }}
        transition={{
          duration: Math.random() * 10 + 10,
          repeat: Infinity,
          ease: "linear",
          delay: Math.random() * 10,
        }}
      />
    ))}
  </div>
);

// Premium Service Card with unique design
function PremiumServiceCard({ service, index, isLarge = false }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [isHovered, setIsHovered] = useState(false);
  const Icon = service.icon;

// Service Card - EXACT same structure, only animations changed
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
      {/* Image with enhanced animation */}
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

      {/* Title with enhanced animation */}
      <motion.h3
        variants={{
          rest: { y: 0, color: "#111827" },
          hover: { y: -3, color: "#fd561e", scale: 1.02 },
        }}
        transition={{ type: "spring", stiffness: 300, damping: 12 }}
        className="text-base sm:text-lg md:text-xl font-bold mb-2 relative"
      >
        {title}

        {/* Animated underline with smoother transition */}
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
        
        {/* Card Content */}
        <div className="relative bg-white rounded-2xl overflow-hidden h-full shadow-lg hover:shadow-2xl transition-all duration-500">
          {/* Image Section with Parallax */}
          <div className="relative h-64 overflow-hidden">
            <motion.img
              src={service.image}
              alt={service.title}
              className={`w-full h-full ${
                service.contain ? "object-contain p-8 bg-gray-50" : "object-cover"
              }`}
              animate={{ scale: isHovered ? 1.05 : 1 }}
              transition={{ duration: 0.6 }}
            />
            <div className={`absolute inset-0 bg-gradient-to-t ${service.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
            
            {/* Stat Badge */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: isHovered ? 0 : -20, opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-1.5"
            >
              <span className="text-white text-xs font-medium">{service.stat}</span>
            </motion.div>
          </div>

      {/* Description with subtle fade on hover */}
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

      {/* Subtle shine overlay on hover */}
      <motion.div
        variants={{
          rest: { opacity: 0, x: "-100%" },
          hover: { 
            opacity: 0.2, 
            x: "100%",
            transition: { duration: 0.6, ease: "easeInOut" }
          },
        }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none rounded-2xl"
      />
    </motion.div>
  );
}

// Main Page - EXACT same structure
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

        {/* Premium CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-20"
        >
          <div className="relative bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-10" />
            
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

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}