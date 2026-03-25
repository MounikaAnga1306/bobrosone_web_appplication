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

const services = [
  {
    id: "bus",
    icon: Bus,
    image: bus,
    title: "Bus Ticketing",
    description: "Seamless travel across 1000+ routes with instant booking and best price guarantee.",
    gradient: "from-orange-500 to-red-500",
    bgColor: "bg-orange-50",
    iconColor: "text-orange-600",
    stat: "1,000+ Routes",
  },
  {
    id: "flights",
    icon: Plane,
    image: flights,
    title: "Flight Booking",
    description: "Global flight network with exclusive deals and flexible payment options.",
    gradient: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600",
    stat: "50+ Airlines",
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

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1, duration: 0.7, ease: [0.21, 0.68, 0.34, 1.02] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group ${isLarge ? "lg:col-span-2" : "lg:col-span-1"}`}
    >
      <div className="relative h-full">
        {/* Gradient Border Effect */}
        <motion.div
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className={`absolute -inset-0.5 bg-gradient-to-r ${service.gradient} rounded-2xl blur-xl opacity-0`}
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

          {/* Content */}
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl ${service.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-6 h-6 ${service.iconColor}`} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{service.title}</h3>
                  <div className="w-8 h-0.5 bg-gradient-to-r from-gray-300 to-transparent mt-1" />
                </div>
              </div>
            </div>
            
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              {service.description}
            </p>
            
            <motion.button
              animate={{ x: isHovered ? 5 : 0 }}
              transition={{ duration: 0.2 }}
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900 group-hover:text-[#FD561E] transition-colors"
            >
              Explore Service
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Main Component
export default function Services() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Split services for asymmetric layout
  const leftColumn = services.slice(0, 3);
  const rightColumn = services.slice(3, 7);

  return (
    <div ref={sectionRef} className="relative bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      {/* Premium Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
        </div>
        <FloatingParticles />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        {/* Hero Section - Bold & Premium */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          {/* Premium Badge */}
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100 mb-6"
          >
            <Sparkles className="w-4 h-4 text-[#FD561E]" />
            <span className="text-sm font-medium text-gray-700">Premium Services</span>
          </motion.div>

          {/* Main Heading with Gradient */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 tracking-tight"
          >
            <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-[#FD561E] bg-clip-text text-transparent">
              Comprehensive
            </span>
            <br />
            <span className="text-gray-900">Solutions for You</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-lg text-gray-500 max-w-2xl mx-auto"
          >
            From travel essentials to business solutions — discover a world of premium services designed to elevate your experience.
          </motion.p>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-wrap justify-center gap-8 mt-10"
          >
            {[
              { icon: Shield, text: "Secure Transactions", color: "text-green-500" },
              { icon: Clock, text: "24/7 Support", color: "text-blue-500" },
              { icon: Star, text: "10,000+ Happy Customers", color: "text-yellow-500" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <item.icon className={`w-4 h-4 ${item.color}`} />
                <span className="text-sm text-gray-600">{item.text}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Asymmetric Services Layout - Breaking the Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Left Column - 3 Services */}
          <div className="space-y-8">
            {leftColumn.map((service, idx) => (
              <PremiumServiceCard key={service.id} service={service} index={idx} />
            ))}
          </div>

          {/* Right Column - 4 Services (2x2 grid) */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {rightColumn.map((service, idx) => (
                <PremiumServiceCard key={service.id} service={service} index={idx + 3} />
              ))}
            </div>
          </div>
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