// src/modules/bus/components/OurServices.jsx
import { motion } from "framer-motion";
import { 
  ChevronRight, 
  Bus, 
  Plane, 
  Building2, 
  Palmtree, 
  Car, 
  CreditCard, 
  Code2,
  ArrowRight,
  Sparkles,
  Shield,
  Clock,
  Headphones
} from "lucide-react";

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
    y: -10,
    scale: 1.15,
    rotate: 3,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 12,
    },
  },
};

// Entry animation
const cardEntry = {
  hidden: { opacity: 0, y: 40 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.6,
      ease: "easeOut",
    },
  }),
};

// Card hover animation
const cardHover = {
  rest: {
    y: 0,
    boxShadow: "0 20px 35px -12px rgba(0,0,0,0.1)",
    scale: 1,
  },
  hover: {
    y: -12,
    boxShadow: "0 30px 50px -15px rgba(253,86,30,0.25)",
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  },
};

// Service Card Component
function ServiceCard({ image, title, description, contain, icon: Icon, color }) {
  const colors = {
    orange: "from-orange-500 to-red-500",
    blue: "from-blue-500 to-cyan-500",
    green: "from-green-500 to-emerald-500",
    purple: "from-purple-500 to-pink-500",
    red: "from-red-500 to-rose-500",
    teal: "from-teal-500 to-cyan-500",
    indigo: "from-indigo-500 to-purple-500",
  };

  const gradientColor = colors[color] || colors.orange;

  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      animate="rest"
      variants={cardHover}
      className="group relative bg-white rounded-2xl px-6 pb-8 pt-24 flex flex-col items-center text-center transition-all duration-300 w-full cursor-pointer"
      style={{ minHeight: "300px" }}
    >
      {/* Gradient Border Effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gray-100 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
      
      {/* Image Circle with Icon */}
      <motion.div
        variants={imageHover}
        className={`absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-gradient-to-br ${gradientColor} flex items-center justify-center z-10`}
      >
        {Icon ? (
          <Icon className="w-10 h-10 text-white" />
        ) : (
          <img
            src={image}
            alt={title}
            className={`w-full h-full ${contain ? "object-contain p-3" : "object-cover"}`}
          />
        )}
      </motion.div>

      {/* Decorative Line */}
      <motion.div
        variants={{
          rest: { width: 40, backgroundColor: "#e5e7eb" },
          hover: { width: 80, backgroundColor: "#fd561e" },
        }}
        className="h-1 rounded-full mb-4"
      />

      {/* Title */}
      <motion.h3
        variants={{
          rest: { y: 0, color: "#111827" },
          hover: { y: -3, color: "#fd561e", scale: 1.02 },
        }}
        className="text-xl font-bold mb-3 relative"
      >
        {title}
        <motion.span
          variants={{
            rest: { width: 0, opacity: 0, left: "50%" },
            hover: { width: "100%", opacity: 1, left: "0%" },
          }}
          className="absolute -bottom-2 h-0.5 bg-gradient-to-r from-[#fd561e] to-[#ff8a5c] rounded-full"
        />
      </motion.h3>

      {/* Description */}
      <motion.p 
        variants={{
          rest: { color: "#6b7280" },
          hover: { color: "#4b5563" },
        }}
        className="text-sm text-gray-600 leading-relaxed"
      >
        {description}
      </motion.p>

      {/* Learn More Link */}
      <motion.div
        variants={{
          rest: { opacity: 0, y: 10 },
          hover: { opacity: 1, y: 0 },
        }}
        className="mt-4 flex items-center gap-1 text-[#fd561e] text-sm font-semibold"
      >
        Learn More <ArrowRight className="w-3 h-3" />
      </motion.div>
    </motion.div>
  );
}

// Feature Item Component
function FeatureItem({ icon: Icon, title, description }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/10 transition-all duration-300 group cursor-pointer"
    >
      <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1">
        <h3 className="text-white font-semibold mb-1">{title}</h3>
        <p className="text-gray-300 text-sm">{description}</p>
      </div>
    </motion.div>
  );
}

// Main Component
export default function OurServices() {
  const services = [
    {
      image: bus,
      title: "Bus Ticketing",
      description: "Convenient and affordable bus ticket booking through our website and BOBROS mobile app.",
      icon: Bus,
      color: "orange"
    },
    {
      image: flights,
      title: "Flight Booking",
      description: "Quick and hassle-free flight bookings for domestic and international travel.",
      icon: Plane,
      color: "blue"
    },
    {
      image: bill,
      title: "Bill Payments",
      description: "Safe, fast, and convenient payments across all services.",
      icon: CreditCard,
      color: "green",
      contain: true
    },
    {
      image: hotels,
      title: "Hotel Booking",
      description: "Book comfortable stays at top hotels with ease and flexibility.",
      icon: Building2,
      color: "purple"
    },
    {
      image: holiday,
      title: "Holiday Packages",
      description: "Curated travel packages to explore the best destinations worldwide.",
      icon: Palmtree,
      color: "teal"
    },
    {
      image: cab,
      title: "Cab Service",
      description: "Affordable cab rentals for personal and business travel.",
      icon: Car,
      color: "red"
    },
    {
      image: service,
      title: "IT Services",
      description: "Reliable IT services to support your business operations.",
      icon: Code2,
      color: "indigo"
    },
  ];

  const features = [
    {
      icon: Sparkles,
      title: "Best Price Guarantee",
      description: "We ensure you get the most competitive rates"
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "100% secure transactions with multiple payment options"
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Round-the-clock customer service assistance"
    },
    {
      icon: Headphones,
      title: "Expert Assistance",
      description: "Dedicated team to help you plan your journey"
    }
  ];

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white py-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-orange-600" />
            <span className="text-orange-600 text-sm font-semibold">What We Offer</span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Our Premium Services
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Comprehensive travel and technology solutions tailored to meet all your needs
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-20">
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

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
        >
          {features.map((feature, index) => (
            <FeatureItem key={index} {...feature} />
          ))}
        </motion.div>

        {/* Enhanced CTA SECTION */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-14"
        >
          <div className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-3xl overflow-hidden shadow-2xl">
            {/* Animated Background Pattern */}
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 via-transparent to-orange-600/20" />

            <div className="relative px-8 py-16 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
                  Ready to Start Your Journey?
                </h2>
                <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                  Join thousands of satisfied customers who trust BOBROS for their travel and service needs
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Get Started Now
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-white/10 backdrop-blur-sm text-white rounded-full font-semibold border border-white/20 hover:bg-white/20 transition-all duration-300"
                  >
                    Contact Our Team
                    <Headphones className="w-4 h-4" />
                  </motion.button>
                </div>

                {/* Trust Badges */}
                <div className="mt-8 flex flex-wrap justify-center gap-6 text-gray-400 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-orange-500 rounded-full" />
                    <span>10,000+ Happy Customers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-orange-500 rounded-full" />
                    <span>4.8 Rating</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-orange-500 rounded-full" />
                    <span>24/7 Support</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}