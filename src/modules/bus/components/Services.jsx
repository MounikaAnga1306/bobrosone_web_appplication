import { motion, useInView } from "framer-motion";
import { useRef } from "react";

// ✅ Your local images
import flights from "../../../assets/flights.jpg";
import bus from "../../../assets/bus.jpg";
import hotels from "../../../assets/hotels.jpg";
import holiday from "../../../assets/holiday.jpg";
import cab from "../../../assets/cab.jpg";
import bill from "../../../assets/bill.png";
import service from "../../../assets/IT_Services.jpg";

// ✅ Professional icons from lucide-react
import {
  Bus,
  Plane,
  Building2,
  Umbrella,
  Car,
  CreditCard,
  Monitor,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

// Service data with professional structure
const services = [
  {
    id: "bus",
    icon: Bus,
    image: bus,
    title: "Bus Ticketing",
    description: "Book bus tickets across 1000+ routes with instant confirmation and best price guarantee.",
    features: ["Instant Confirmation", "Best Price Guarantee", "24/7 Support"],
    isFeatured: true,
  },
  {
    id: "flights",
    icon: Plane,
    image: flights,
    title: "Flight Booking",
    description: "Domestic and international flight bookings with exclusive deals and flexible payment options.",
    features: ["Domestic & International", "Best Deals", "Flexible Payments"],
    isFeatured: true,
  },
  {
    id: "hotels",
    icon: Building2,
    image: hotels,
    title: "Hotel Stays",
    description: "Curated selection of premium hotels with best rates and easy cancellation policy.",
    features: ["5000+ Hotels", "Best Rates", "Easy Cancellation"],
    isFeatured: false,
  },
  {
    id: "holidays",
    icon: Umbrella,
    image: holiday,
    title: "Holiday Packages",
    description: "Thoughtfully crafted travel experiences to the world's most breathtaking destinations.",
    features: ["Custom Packages", "Expert Guides", "Group Discounts"],
    isFeatured: false,
  },
  {
    id: "cabs",
    icon: Car,
    image: cab,
    title: "Cab Services",
    description: "Reliable airport transfers and outstation cabs with professional drivers.",
    features: ["Airport Transfers", "Outstation Trips", "Clean Vehicles"],
    isFeatured: false,
  },
  {
    id: "bills",
    icon: CreditCard,
    image: bill,
    title: "Bill Payments",
    description: "Secure and instant bill payments for utilities, recharges, and more.",
    features: ["All Utilities", "Secure Payments", "Instant Receipts"],
    isFeatured: false,
    contain: true,
  },
  {
    id: "it",
    icon: Monitor,
    image: service,
    title: "IT Services",
    description: "Enterprise-grade IT solutions including development, support, and consulting.",
    features: ["Business Solutions", "Expert Support", "Custom Development"],
    isFeatured: false,
    contain: true,
  },
];

// Featured Service Card - Larger, more prominent
function FeaturedServiceCard({ service, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const Icon = service.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      className="group relative lg:col-span-2"
    >
      <div className="relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
        {/* Image Section */}
        <div className="relative h-80 overflow-hidden">
          <img
            src={service.image}
            alt={service.title}
            className={`w-full h-full ${
              service.contain ? "object-contain p-12 bg-gray-50" : "object-cover"
            } transition-transform duration-700 group-hover:scale-105`}
          />
          {/* Dark Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <div className="flex items-center gap-3 mb-3">
              <Icon className="w-6 h-6" />
              <span className="text-sm font-medium tracking-wide uppercase">Featured Service</span>
            </div>
            <h3 className="text-3xl font-bold mb-2">{service.title}</h3>
            <p className="text-white/90 text-base max-w-md">{service.description}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Standard Service Card - Clean, minimal, professional
function StandardServiceCard({ service, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const Icon = service.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      className="group"
    >
      <div className="bg-white rounded-xl border border-gray-100 hover:border-gray-200 p-6 transition-all duration-300 hover:shadow-lg">
        {/* Icon */}
        <div className="mb-5">
          <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-[#FD561E] transition-colors duration-300">
            <Icon className="w-6 h-6 text-gray-700 group-hover:text-white transition-colors duration-300" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-[#FD561E] transition-colors duration-300">
          {service.title}
        </h3>

        {/* Description */}
        <p className="text-gray-500 text-sm leading-relaxed mb-4">
          {service.description}
        </p>

        {/* Features */}
        <div className="space-y-2 mb-6">
          {service.features.map((feature, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#FD561E]" />
              <span className="text-xs text-gray-500">{feature}</span>
            </div>
          ))}
        </div>

        {/* Link */}
        <button className="text-sm font-medium text-gray-900 group-hover:text-[#FD561E] flex items-center gap-1 transition-colors duration-300">
          Learn more
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
        </button>
      </div>
    </motion.div>
  );
}

// Main Component
export default function Services() {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true });

  // Separate featured and standard services
  const featuredServices = services.filter(s => s.isFeatured);
  const standardServices = services.filter(s => !s.isFeatured);

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section - Professional & Minimal */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          {/* Small Label */}
          <span className="text-sm font-medium text-[#FD561E] uppercase tracking-wider mb-3 block">
            Our Services
          </span>
          
          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Comprehensive Solutions
            <span className="block text-gray-700 mt-2">For Every Need</span>
          </h1>
          
          {/* Description */}
          <p className="text-lg text-gray-500 leading-relaxed">
            From travel to technology, we provide premium services designed to simplify your life and elevate your experiences.
          </p>
        </motion.div>

        {/* Featured Services Section - Hero Style */}
        <div className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {featuredServices.map((service, idx) => (
              <FeaturedServiceCard key={service.id} service={service} index={idx} />
            ))}
            {/* Placeholder for alignment - empty div to maintain grid */}
            <div className="hidden lg:block" />
          </div>
        </div>

        {/* Standard Services Section */}
        <div>
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">All Services</h2>
            <div className="w-12 h-0.5 bg-[#FD561E] mx-auto" />
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {standardServices.map((service, idx) => (
              <StandardServiceCard key={service.id} service={service} index={idx} />
            ))}
          </div>
        </div>

        {/* CTA Section - Minimal & Professional */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-20 pt-12 border-t border-gray-100"
        >
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Need Assistance?
            </h3>
            <p className="text-gray-500 mb-6">
              Our team is available 24/7 to help you with any questions
            </p>
            <button className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-[#FD561E] transition-colors duration-300 text-sm font-medium">
              Contact Support
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}