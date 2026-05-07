import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Turnstile } from "@marsidev/react-turnstile";
import {
  FaCheck,
  FaBox,
  FaChartLine,
  FaBolt,
  FaMobileAlt,
  FaLayerGroup,
  FaRocket,
  FaCogs,
  FaTachometerAlt,
  FaLock,
  FaDatabase,
  FaShieldAlt,
  FaCloudUploadAlt,
  FaTimes,
  FaCheckCircle,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const BRAND = "#fd561e";

// ─────────────────────────────────────────────
// Helper: Scroll to section
// ─────────────────────────────────────────────
const scrollToSection = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
};

const Header = () => null;

// ─────────────────────────────────────────────
// Success Popup Modal
// ─────────────────────────────────────────────
const SuccessModal = ({ isOpen, onClose }) => {
  // Auto-close after 6 seconds
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => onClose(), 6000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    if (isOpen) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
          >
            {/* Modal Card */}
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 30 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-auto overflow-hidden"
            >
              {/* Top accent bar */}
              <div className="h-2 w-full" style={{ background: `linear-gradient(90deg, ${BRAND}, #ff8c5a)` }} />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition p-1 rounded-full hover:bg-gray-100"
                aria-label="Close"
              >
                <FaTimes size={18} />
              </button>

              <div className="px-8 py-8 text-center">
                {/* Animated checkmark */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.15 }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-5"
                  style={{ backgroundColor: "#fff1ec" }}
                >
                  <FaCheckCircle size={44} style={{ color: BRAND }} />
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="text-2xl font-bold text-gray-800 mb-2"
                >
                  We've Received Your Message!
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.32 }}
                  className="text-gray-500 text-sm leading-relaxed mb-6"
                >
                  Thank you for reaching out to <span className="font-semibold" style={{ color: BRAND }}>BOBROS</span>.<br />
                  Our team will get back to you within <strong>24 hours</strong>.
                </motion.p>

                {/* Progress bar auto-close indicator */}
                <div className="w-full bg-gray-100 rounded-full h-1.5 mb-6 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: BRAND }}
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: 6, ease: "linear" }}
                  />
                </div>

                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  onClick={onClose}
                  className="cursor-pointer w-full text-white font-semibold py-3 rounded-xl hover:opacity-90 transition text-sm"
                  style={{ backgroundColor: BRAND }}
                >
                  Got it, thanks! 👍
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ─────────────────────────────────────────────
// Hero Section — FIXED spacing (matches local)
// ─────────────────────────────────────────────
const Hero = () => (
  <motion.section
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    viewport={{ once: true }}
    className="container mx-auto px-6 md:px-12 pt-10 pb-12"
  >
    <div className="flex flex-col md:flex-row items-center gap-8">
      <div className="md:w-7/12">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold">
          Looking for Professional Website or Product Development?
        </h1>
        <h2 className="text-2xl md:text-3xl font-bold mt-3">
          <span style={{ color: BRAND }}>You Are At The Right Place!</span>
        </h2>
        <p className="text-gray-600 mt-4">
          BOBROS delivers modern, enterprise-grade Technology Solutions designed for scale, performance, and security.
          With capabilities in custom web development, mobile apps, full-stack product development, eCommerce engineering,
          hosting, and domain services, we help organizations accelerate their digital journey with confidence and clarity.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => scrollToSection("contact-form")}
            style={{ backgroundColor: BRAND }}
            className="cursor-pointer text-white font-semibold py-3 px-6 rounded-full hover:opacity-90 transition"
          >
            Book a Call with us
          </button>
          <button
            onClick={() => scrollToSection("itpackages")}
            className="cursor-pointer border-2 font-semibold py-3 px-6 rounded-full 
             text-[#fd561e] border-[#fd561e] 
             hover:bg-[#fd561e] hover:text-white transition"
          >
            View Pricing
          </button>
        </div>
      </div>
      <div className="md:w-7/12  -mr-10 -mt-14 text-center">
        <img src="/assets/hero-web-mobile-development-india.png" alt="web-mobile-development" className="img-fluid rounded-lg" />
      </div>
    </div>
  </motion.section>
);

// ─────────────────────────────────────────────
// Services Cards
// ─────────────────────────────────────────────
const services = [
  { img: "/assets/frontendbg.png",  title: "FrontEnd Development" },
  { img: "/assets/backendbg.png",   title: "BackEnd Development" },
  { img: "/assets/mobiledevbg.png", title: "Mobile App Development" },
  { img: "/assets/domainbg.png",    title: "Domain Registration & Hosting Services" },
];

const Services = () => (
  <section className="bg-gradient-to-b from-orange-50 to-white py-16">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {services.map((s, i) => (
          <motion.div key={i} whileHover={{ scale: 1.05 }} className="bg-white rounded-2xl p-3 text-center shadow-md hover:shadow-lg transition cursor-pointer">
            <img src={s.img} alt={s.title} className="w-24 mx-auto mb-2" />
            <h5 className="font-bold text-gray-800 text-sm md:text-base">{s.title}</h5>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

// ─────────────────────────────────────────────
// IT About Section
// ─────────────────────────────────────────────
const ItSection = () => (
  <section className="py-16 bg-gray-50">
    <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-8">
      <div className="md:w-1/2">
        <img src="/assets/aboutus.jpg" alt="IT Services" className="rounded-lg shadow" />
      </div>
      <div className="md:w-1/2">
        <h2 className="text-3xl font-bold mb-4">Build Your Digital Presence with Us</h2>
        <p className="text-gray-600 mb-6">
          As a trusted IT services provider in India, we offer reliable and affordable solutions designed to help your
          business grow online. Our team delivers custom website development services, professional web design &
          development, and full-stack development solutions tailored to your business needs. We also provide secure
          hosting, mobile-responsive designs, API integrations, and end-to-end technical support to ensure smooth
          performance at every stage. Whether you're a startup or an established business, our expertise as a mobile app
          development company and IT service provider makes it easier for you to build a strong and scalable digital
          presence.
        </p>
        <button
          onClick={() => scrollToSection("contact-form")}
          style={{ backgroundColor: BRAND }}
          className="cursor-pointer text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition"
        >
          Get A Quote
        </button>
      </div>
    </div>
  </section>
);

// ─────────────────────────────────────────────
// Our Services (Compact Postcards)
// ─────────────────────────────────────────────
const postcards = [
  {
    img: "/assets/e-commerce.jpg",
    title: "E-commerce Website Development",
    popular: true,
    desc: "Empowering businesses to sell digitally through modern and user-friendly E-Commerce websites. Our package includes domain, secure hosting, product catalog setup, shopping cart, and payment gateway integration.",
    tags: ["Custom Design", "Payment Gateway", "SEO Ready", "Clean UI/UX"],
  },
  {
    img: "/assets/appdev.jpg",
    title: "Mobile Application Development",
    popular: false,
    desc: "We offer end-to-end Android and iOS app development solutions for businesses across all industries. From design to deployment, we build high-performance mobile apps that enhance customer engagement and drive growth.",
    tags: ["Android & iOS Apps", "Secure & Scalable", "High Performance"],
  },
  {
    img: "/assets/domainreg.jpg",
    title: "Domain Registration Services",
    popular: false,
    desc: "We provide professional domain registration services for businesses of all sizes. Secure your brand identity online with the right domain name and take the first step toward building a strong digital presence.",
    tags: ["Affordable Pricing", "Instant Booking"],
  },
  {
    img: "/assets/websitedevelopment.jpg",
    title: "Static Website Development",
    popular: false,
    desc: "Grow your business online with our static website services tailored for small companies. We provide end-to-end support including domain registration, custom website development, and secure hosting.",
    tags: ["Responsive Design", "Clean UI/UX", "Quick Delivery"],
  },
];

const Postcards = () => (
  <section className="py-16 bg-gray-100">
    <div className="container mx-auto px-4">
      <h2 className="text-3xl font-bold text-center mb-10">Our Services</h2>
      <div className="space-y-5">
        {postcards.map((card, idx) => {
          const imgLeft = idx % 2 === 0;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: imgLeft ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(253,86,30,0.18)" }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row bg-white rounded-xl shadow-md overflow-hidden transition cursor-pointer"
              style={{ flexDirection: imgLeft ? undefined : "row-reverse" }}
            >
              {/* Image — full width on mobile, fixed on desktop */}
              <div className="relative w-full md:w-80 flex-shrink-0" style={{ minHeight: "200px", maxHeight: "260px", overflow: "hidden" }}>
                <motion.img
                  src={card.img}
                  alt={card.title}
                  className="w-full h-full object-cover"
                  style={{ display: "block", minHeight: "200px" }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.35 }}
                />
                {card.popular && (
                  <div
                    className="absolute top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-white text-xs font-bold shadow-lg whitespace-nowrap z-10"
                    style={{ backgroundColor: BRAND }}
                  >
                    ⭐ Most Popular
                  </div>
                )}
              </div>
              <div className="flex-1 px-6 py-4 flex flex-col justify-center">
                <h3 className="text-lg font-bold mb-1">{card.title}</h3>
                <div className="w-10 h-1 mb-3 rounded-full" style={{ backgroundColor: BRAND }} />
                <p className="text-gray-600 text-sm leading-relaxed mb-3">{card.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {card.tags.map((tag, i) => (
                    <span key={i} className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full border border-gray-200">{tag}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  </section>
);

// ─────────────────────────────────────────────
// E-Commerce Packages
// ─────────────────────────────────────────────
const ecomPackages = [
  { icon: <FaBox />,       title: "Starter",    desc: "A simple, budget‑friendly e‑commerce solution for growing businesses.",       features: ["Up to 100 products", "Payment gateway integration", "Mobile responsive", "Order management", "Custom API Integration"] },
  { icon: <FaChartLine />, title: "Growth",     desc: "A powerful, scalable package for businesses ready to expand.",                 features: ["Unlimited products", "Payment gateway integration", "Custom features", "Inventory management", "Custom API Integration"] },
  { icon: <FaBolt />,      title: "Enterprise", desc: "A fully customizable, enterprise‑grade ecosystem for large businesses.",       features: ["Unlimited products and admin users", "Custom features", "Dedicated support", "Multiple Payment gateway integration", "Custom API Integration"] },
];

const EcomPackages = () => (
  <section className="py-16 bg-white">
    <div className="container mx-auto px-4 text-center">
      <h2 className="text-3xl md:text-4xl font-bold">E-Commerce <span style={{ color: BRAND }}>Packages</span></h2>
      <p className="text-gray-500 max-w-2xl mx-auto mt-4">
        E-commerce website pricing varies based on features, integrations, and business requirements. We customize each solution to perfectly match your needs.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 items-stretch">
        {ecomPackages.map((pkg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }} viewport={{ once: true }}
            whileHover={{ y: -8 }}
            className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition flex flex-col cursor-pointer"
          >
            <div className="text-4xl mb-4" style={{ color: BRAND }}>{pkg.icon}</div>
            <h3 className="text-2xl font-bold mb-2">{pkg.title}</h3>
            <p className="text-gray-500 mb-4">{pkg.desc}</p>
            <ul className="space-y-2 flex-1">
              {pkg.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: BRAND }} /> {f}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
      <div className="mt-10">
        <button onClick={() => scrollToSection("contact-form")} style={{ backgroundColor: BRAND }} className="cursor-pointer text-white font-semibold py-3 px-8 rounded-lg hover:opacity-90 transition">
          Get A Quote
        </button>
      </div>
    </div>
  </section>
);

// ─────────────────────────────────────────────
// App Packages
// ─────────────────────────────────────────────
const appPackages = [
  { icon: <FaMobileAlt />, title: "Essential",    platform: "Android or iOS",       desc: "A solid, single‑platform app solution for startups and small businesses.",    features: ["Native development", "Basic features", "API integration", "End-to-end delivery", "3 months support"] },
  { icon: <FaLayerGroup />, title: "Professional", platform: "Android + iOS",        desc: "A feature‑rich, cross‑platform app for growing businesses.",                  features: ["Cross-platform development", "Custom features", "Multiple API integrations", "Push notifications", "End-to-end delivery", "6 months support"] },
  { icon: <FaRocket />,    title: "Enterprise",   platform: "Android + iOS + Web",  desc: "A high‑end, fully customizable ecosystem for enterprise clients.",             features: ["Cross-platform development", "Custom features", "Multiple API integrations", "Admin dashboard", "Push notifications", "End-to-end delivery", "12 months support"] },
];

const AppPackages = () => (
  <section className="py-16 bg-gray-50">
    <div className="container mx-auto px-4 text-center">
      <h2 className="text-3xl md:text-4xl font-bold">App Development <span style={{ color: BRAND }}>Packages</span></h2>
      <p className="text-gray-500 max-w-2xl mx-auto mt-4">
        Android and iOS app development packages differ based on platform, features, API integrations, and timelines. We build apps that users love.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 items-stretch">
        {appPackages.map((pkg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }} viewport={{ once: true }}
            whileHover={{ y: -8 }}
            className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition flex flex-col cursor-pointer"
          >
            <div className="text-4xl mb-4" style={{ color: BRAND }}>{pkg.icon}</div>
            <h3 className="text-2xl font-bold">{pkg.title}</h3>
            <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full mt-2" style={{ backgroundColor: "#fff1ec", color: BRAND }}>{pkg.platform}</span>
            <p className="text-gray-500 mt-3">{pkg.desc}</p>
            <ul className="mt-4 space-y-2 flex-1">
              {pkg.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: BRAND }} /> {f}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
      <div className="mt-10">
        <button onClick={() => scrollToSection("contact-form")} style={{ backgroundColor: BRAND }} className="cursor-pointer text-white font-semibold py-3 px-8 rounded-lg hover:opacity-90 transition">
          Discuss Your App Idea
        </button>
      </div>
    </div>
  </section>
);

// ─────────────────────────────────────────────
// Static Website Pricing
// ─────────────────────────────────────────────
const pricingPlans = [
  {
    title: "Go Digital - Standard", price: "₹599", period: "per month", popular: true,
    features: ["Hosting", "Domain", "Free SSL Certificate(HTTPS)", "5 Business Email IDs", "500 MB per Email", "Mobile Responsive", "20 Support Hours (Post Go Live)", "Extra Hours : ₹150/- per hour", "Annual Contract", "Get 2 months free! Pay ₹5990/year in advance"],
  },
  {
    title: "Go Digital - Switch", price: "₹499", period: "per month", popular: false,
    features: ["Hosting", "Free SSL Certificate(HTTPS)", "5 Business Email IDs", "500 MB per Email", "Mobile Responsive", "20 Support Hours (Post Go Live)", "Extra Hours : ₹150/- per hour", "Annual Contract", "Get 2 months free! Pay ₹4990/year in advance"],
  },
  {
    title: "Go Digital - Build and Deploy", price: "₹399", period: "per month", popular: false,
    features: ["Hosting", "Free SSL Certificate(HTTPS)", "5 Business Email IDs", "500 MB per Email", "Mobile Responsive", "Extra Hours : ₹150/- per hour", "Annual Contract", "Get 2 months free! Pay ₹3990/year in advance"],
  },
  {
    title: "Go Digital - Host", price: "₹199", period: "per month", popular: false,
    features: ["Hosting", "Free SSL Certificate(HTTPS)", "No Development", "No Standard Support Hours", "Hosting for just ₹199/month", "Extra Hours : ₹150/- per hour", "Annual Contract", "Get 2 months free! Pay ₹1990/year in advance"],
  },
];

const PricingCard = ({ plan, index }) => (
  <div className="pt-5 flex flex-col h-full">
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ y: -10, boxShadow: "0 20px 40px rgba(253,86,30,0.18)" }}
      className="bg-white rounded-2xl shadow-md overflow-visible flex flex-col flex-1 relative"
      style={plan.popular ? { outline: `2px solid ${BRAND}` } : { outline: "2px solid transparent" }}
    >
      {plan.popular && (
        <div
          className="absolute left-1/2 -translate-x-1/2 -top-4 px-5 py-1.5 rounded-full text-white text-xs font-bold shadow-md whitespace-nowrap z-10"
          style={{ backgroundColor: BRAND }}
        >
          ⭐ Most Popular
        </div>
      )}
      <div
        className="p-5 text-white rounded-t-2xl"
        style={{ background: `linear-gradient(135deg, ${BRAND} 0%, #ff8c5a 100%)`, paddingTop: plan.popular ? "28px" : "20px" }}
      >
        <h3 className="text-lg font-bold leading-tight">{plan.title}</h3>
        <div className="mt-3 flex items-end gap-1">
          <span className="text-4xl font-extrabold">{plan.price}</span>
          <span className="text-sm opacity-80 mb-1">/{plan.period}</span>
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <ul className="space-y-2 flex-1">
          {plan.features.map((feat, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
              <FaCheck className="mt-0.5 flex-shrink-0" style={{ color: BRAND }} />
              <span>{feat}</span>
            </li>
          ))}
        </ul>
        <button
          onClick={() => scrollToSection("contact-form")}
          className="cursor-pointer mt-6 w-full text-white font-semibold py-2.5 rounded-full hover:opacity-90 transition"
          style={{ backgroundColor: BRAND }}
        >
          Get Quote
        </button>
      </div>
    </motion.div>
  </div>
);

const PricingSectionFlutter = () => (
  <section id="itpackages" className="py-16 bg-gray-50">
    <div className="container mx-auto px-4 text-center">
      <h2 className="text-3xl font-bold mb-2">Static Website <span style={{ color: BRAND }}>Packages</span></h2>
      <p className="text-gray-500 mb-1">Choose the perfect package for your business needs</p>
      <p className="text-gray-400 text-sm mb-8">All packages include 5 Business email IDs</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {pricingPlans.map((plan, idx) => <PricingCard key={idx} plan={plan} index={idx} />)}
      </div>
    </div>
  </section>
);

// ─────────────────────────────────────────────
// What We Do
// ─────────────────────────────────────────────
const whatWeDoItems = [
  { icon: <FaCogs />,          title: "Settings",    desc: "We provide flexible options to configure your site according to your business needs." },
  { icon: <FaTachometerAlt />, title: "Speedup",     desc: "Our optimization techniques ensure a seamless user experience for your visitors." },
  { icon: <FaLock />,          title: "Privacy",     desc: "We implement best practices to protect sensitive information and ensure privacy compliance." },
  { icon: <FaCloudUploadAlt />,title: "Backups",     desc: "Quickly restore your site to its previous state in case of data corruption or issues." },
  { icon: <FaShieldAlt />,     title: "SSL Secured", desc: "Build trust with your users by offering safe and secure browsing experiences." },
  { icon: <FaDatabase />,      title: "Database",    desc: "We offer timely assistance and ongoing maintenance for your peace of mind." },
];

const WhatWeDo = () => {
  const [selected, setSelected] = useState(-1);
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-10" style={{ color: BRAND }}>What We Do</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {whatWeDoItems.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.07 }} viewport={{ once: true }}
              whileHover={{ y: -8, boxShadow: "0 16px 40px rgba(253,86,30,0.14)" }}
              onClick={() => setSelected(selected === idx ? -1 : idx)}
              className="p-8 rounded-2xl shadow-md cursor-pointer transition-all duration-300"
              style={selected === idx
                ? { background: `linear-gradient(135deg, ${BRAND} 0%, #ff8c5a 100%)`, color: "#fff" }
                : { backgroundColor: "#fff", color: "#1f2937" }}
            >
              <div className="text-5xl mb-4" style={selected === idx ? { color: "#fff" } : { color: BRAND }}>{item.icon}</div>
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              <p className="text-sm leading-relaxed" style={selected === idx ? { color: "#ffe0d6" } : { color: "#6b7280" }}>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────
// Our Partners
// ─────────────────────────────────────────────
const partnerLogos = [
  { src: "/assets/sectigo.png", name: "sectigo", maxWidth: "130px" },
  { src: "/assets/Google-Partner.png", name: "google", maxWidth: "300px" },
  { src: "/assets/Godaddy-logo.png", name: "godaddy", maxWidth: "150px" },
  { src: "/assets/aws5.png", name: "aws", maxWidth: "100px" },
  { src: "/assets/razorpay_icon.webp", name: "razorpay", maxWidth: "150px" },
];

const PartnerCarousel = () => {
  const all = [...partnerLogos, ...partnerLogos, ...partnerLogos];
  return (
    <div className="py-12 bg-gray-50">
      <style>{`
        @keyframes scrollLeft {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.3333%); }
        }
        .partners-belt {
          display: inline-flex;
          gap: 56px;
          align-items: center;
          animation: scrollLeft 22s linear infinite;
          will-change: transform;
        }
        .partners-belt:hover { animation-play-state: paused; }
        .partners-viewport {
          overflow: hidden;
          max-width: 860px;
          margin: 0 auto;
          position: relative;
        }
        .partners-viewport::before,
        .partners-viewport::after {
          content: "";
          position: absolute; top: 0; bottom: 0; width: 72px; z-index: 2; pointer-events: none;
        }
        .partners-viewport::before { left:  0; background: linear-gradient(to right, #f9fafb, transparent); }
        .partners-viewport::after  { right: 0; background: linear-gradient(to left,  #f9fafb, transparent); }
        .partner-logo {
          height: 130px;
          width: auto;
          object-fit: contain;
          opacity: 0.6;
          transition: all 0.3s ease;
          flex-shrink: 0;
        }
        .partner-logo:hover {
          opacity: 1;
          transform: scale(1.05);
        }
      `}</style>
      <h3 className="text-center text-2xl font-bold mb-8">Our Partners</h3>
      <div className="partners-viewport">
        <div className="partners-belt">
          {all.map((logo, i) => (
            <img
              key={i}
              src={logo.src}
              alt={logo.name}
              className="partner-logo"
              style={{ maxWidth: logo.maxWidth }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Why Choose Us
// ─────────────────────────────────────────────
const whyChoose = [
  { title: "Modern UI/UX",        desc: "Beautiful, intuitive designs that engage users and drive conversions" },
  { title: "Fast Delivery",       desc: "Quick turnaround times without compromising on quality" },
  { title: "Secure & Optimized",  desc: "Enterprise-grade security and performance optimization" },
  { title: "Affordable Packages", desc: "Competitive pricing with transparent annual contracts" },
  { title: "Ongoing Support",     desc: "Dedicated support team ready to help whenever you need" },
  { title: "Proven Track Record", desc: "Successfully delivered multiple projects across industries" },
];

const WhyChoose = () => (
  <section className="py-16 bg-white">
    <div className="container mx-auto px-4 text-center">
      <h2 className="text-3xl md:text-4xl font-bold">Why We're the <span style={{ color: BRAND }}>Right Choice</span></h2>
      <p className="text-gray-500 mt-2">Because your business deserves nothing less than excellence.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12 items-stretch">
        {whyChoose.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.08 }} viewport={{ once: true }}
            whileHover={{ y: -6, boxShadow: "0 12px 32px rgba(253,86,30,0.10)" }}
            className="p-8 border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition flex flex-col justify-center min-h-[160px] cursor-pointer"
          >
            <h3 className="text-xl font-bold mb-3" style={{ color: BRAND }}>{item.title}</h3>
            <p className="text-gray-600">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

// ─────────────────────────────────────────────
// Contact Form — FIXED with Success Modal
// ─────────────────────────────────────────────
const staticPkgOptions = [
  "Go Digital - Standard (Rs.599/mo)",
  "Go Digital - Switch (Rs.499/mo)",
  "Go Digital - Build and Deploy (Rs.399/mo)",
  "Go Digital - Host (Rs.199/mo)",
];
const ecomPkgOptions = [
  "E-Commerce Starter",
  "E-Commerce Growth",
  "E-Commerce Enterprise",
];

// Pre-filled mailto body
const MAIL_TO_HREF =
  "mailto:customersupport@bobrosone.com" +
  "?subject=Enquiry%20About%20Your%20Services" +
  "&body=Hi%20BOBROS%20Team%2C%0A%0AI%20want%20to%20know%20about%20your%20services.%20Could%20you%20please%20share%20more%20details%20and%20get%20in%20touch%20with%20me%3F%0A%0ARegards";

const ContactForm = ({ onSuccess }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    serviceType: "",
    selectedPackage: "",
    billingCycle: "",
  });
  const [turnstileToken, setTurnstileToken] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(false);
  const turnstileRef = useRef();

  useEffect(() => {
    setForm((p) => ({ ...p, selectedPackage: "" }));
  }, [form.serviceType]);

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const validate = () => {
    const e = {};
    if (!form.name || !/^[A-Za-z\s]+$/.test(form.name) || form.name.length > 40)
      e.name = "Valid name required (letters only, max 40)";
    if (!form.email || !validateEmail(form.email) || form.email.length > 100)
      e.email = "Enter a valid email address (e.g., name@example.com)";
    if (!form.phone || !/^[6-9]\d{9}$/.test(form.phone))
      e.phone = "Valid 10-digit mobile number required";
    if (!form.serviceType) e.serviceType = "Please select a service type";
    if (!form.selectedPackage) e.selectedPackage = "Please select a package";
    if (!form.billingCycle) e.billingCycle = "Please select billing preference";
    if (!turnstileToken) e.turnstile = "Please complete the security check";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (ev) => {
    const { name, value } = ev.target;
    let v = value;
    if (name === "name") v = value.replace(/[^A-Za-z\s]/g, "");
    if (name === "phone") v = value.replace(/\D/g, "").slice(0, 10);
    if (name === "email") v = value.trim();
    setForm((p) => ({ ...p, [name]: v }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: undefined }));
    setApiError(false);
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setApiError(false);

    const payload = {
      userName: form.name.trim(),
      userEmail: form.email.trim(),
      userMobile: form.phone.trim(),
      packageName: form.selectedPackage,
      serviceType: form.serviceType,
      additionalInfo: "No additional notes",
      paymentPlan: form.billingCycle === "monthly" ? "Monthly" : "Annual",
      captchaToken: turnstileToken,
    };

    try {
      const res = await axios.post(
        "https://api.bobros.co.in/email/it-service-enquiry",
        payload,
        { headers: { "Content-Type": "application/json" } }
      );
      if (res.status === 200) {
        // Reset form
        setForm({ name: "", email: "", phone: "", serviceType: "", selectedPackage: "", billingCycle: "" });
        setTurnstileToken(null);
        turnstileRef.current?.reset();
        setErrors({});
        // Show success popup
        onSuccess();
      } else {
        setApiError(true);
      }
    } catch (err) {
      console.error("API call failed:", err.response?.data || err.message);
      setApiError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const PillRadio = ({ fieldName, options, value }) => (
    <div className="flex flex-wrap gap-3">
      {options.map((opt) => (
        <label
          key={opt.value}
          className={`flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-xl border-2 text-sm font-medium select-none transition-all duration-200 ${
            value === opt.value
              ? "border-[#fd561e] bg-[#fff1ec] text-[#fd561e]"
              : "border-gray-200 bg-gray-50 text-gray-600"
          }`}
        >
          <input
            type="radio"
            name={fieldName}
            value={opt.value}
            checked={value === opt.value}
            onChange={handleChange}
            className="w-4 h-4 cursor-pointer"
            style={{ accentColor: BRAND }}
          />
          {opt.label}
        </label>
      ))}
    </div>
  );

  const pkgOptions = form.serviceType === "ecommerce" ? ecomPkgOptions : staticPkgOptions;
  const packageLabel = form.serviceType === "ecommerce" ? "Select E-Commerce Package" : "Select Package";

  return (
    <section id="contact-form" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">
            Let's Start Your <span style={{ color: BRAND }}>Project</span>
          </h2>
          <p className="text-gray-500 mt-2">
            Get in touch with us today and transform your digital presence
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 max-w-5xl mx-auto">
          {/* Form panel */}
          <div className="lg:w-1/2 bg-white rounded-2xl p-6 shadow-md">
            <form onSubmit={handleSubmit} noValidate>
              {/* Service Type */}
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2 text-gray-700">Service Type</label>
                <PillRadio
                  fieldName="serviceType"
                  value={form.serviceType}
                  options={[
                    { value: "static", label: "📄 Static Website" },
                    { value: "ecommerce", label: "🛒 E-Commerce" },
                  ]}
                />
                {errors.serviceType && <p className="text-red-500 text-xs mt-1">{errors.serviceType}</p>}
              </div>

              {/* Package selector — shown only after serviceType chosen */}
              {form.serviceType && (
                <motion.div
                  key={form.serviceType}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25 }}
                  className="mb-5"
                >
                  <label className="block text-sm font-semibold mb-2 text-gray-700">{packageLabel}</label>
                  <select
                    name="selectedPackage"
                    value={form.selectedPackage}
                    onChange={handleChange}
                    className="cursor-pointer w-full border border-gray-300 rounded-lg p-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#fd561e]"
                  >
                    <option value="">-- {packageLabel} --</option>
                    {pkgOptions.map((p, i) => (
                      <option key={i} value={p}>{p}</option>
                    ))}
                  </select>
                  {errors.selectedPackage && <p className="text-red-500 text-xs mt-1">{errors.selectedPackage}</p>}
                </motion.div>
              )}

              {/* Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#fd561e]"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* Email */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#fd561e]"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div className="mb-5">
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Mobile No <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#fd561e]"
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              {/* Billing */}
              <div className="mb-5">
                <label className="block text-sm font-semibold mb-2 text-gray-700">Billing Preference</label>
                <PillRadio
                  fieldName="billingCycle"
                  value={form.billingCycle}
                  options={[
                    { value: "monthly", label: "📅 Monthly" },
                    { value: "annual", label: "📆 Annual (Save 2 months!)" },
                  ]}
                />
                {errors.billingCycle && <p className="text-red-500 text-xs mt-1">{errors.billingCycle}</p>}
              </div>

              {/* Turnstile */}
              <div className="mb-4 flex justify-center">
                <Turnstile
                  ref={turnstileRef}
                  siteKey="0x4AAAAAABvRHvXzt4EuTFLs"
                  onSuccess={(token) => setTurnstileToken(token)}
                  onError={() => setTurnstileToken(null)}
                  onExpire={() => setTurnstileToken(null)}
                />
              </div>
              {errors.turnstile && <p className="text-red-500 text-xs text-center mb-2">{errors.turnstile}</p>}

              {/* API error inline */}
              {apiError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-center text-sm">
                  ❌ Something went wrong. Please try again or contact us directly.
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="cursor-pointer w-full text-white font-semibold py-3 rounded-lg hover:opacity-90 transition flex items-center justify-center gap-2"
                style={{ backgroundColor: BRAND, opacity: isSubmitting ? 0.75 : 1 }}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Sending...
                  </>
                ) : (
                  "Get Free Quote"
                )}
              </button>
            </form>
          </div>

          {/* Quick Contact panel */}
          <div className="lg:w-1/2">
            <div className="mb-6">
              <h3 className="text-2xl font-bold">Quick Contact</h3>
              <p className="text-gray-500 mt-2">
                Begin your digital growth journey with us. Reach out via WhatsApp or email for a quick response.
              </p>
            </div>

            {/* WhatsApp */}
            <button
              onClick={() => window.open("https://wa.me/9133133456", "_blank")}
              className="cursor-pointer w-full flex items-center gap-4 border border-gray-200 rounded-xl p-4 mb-4 hover:shadow-md hover:border-orange-200 transition-all duration-200 bg-white"
            >
              <span className="text-2xl">💬</span>
              <div className="text-left">
                <div className="font-semibold">WhatsApp Us</div>
                <div className="text-sm text-gray-500">+91-9133 133 456</div>
              </div>
            </button>

            {/* Email — pre-filled subject + body */}
            <button
              onClick={() => (window.location.href = MAIL_TO_HREF)}
              className="cursor-pointer w-full flex items-center gap-4 border border-gray-200 rounded-xl p-4 mb-4 hover:shadow-md hover:border-orange-200 transition-all duration-200 bg-white"
            >
              <span className="text-2xl">📧</span>
              <div className="text-left">
                <div className="font-semibold">Email Us</div>
                <div className="text-sm text-gray-500">customersupport@bobrosone.com</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────
// Main Page Export
// ─────────────────────────────────────────────
const ItServicesPage = () => {
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  return (
    <div className="overflow-x-hidden pt-20">
      <Header />
      <Hero />
      <Services />
      <ItSection />
      <Postcards />
      <EcomPackages />
      <AppPackages />
      <PricingSectionFlutter />
      <WhatWeDo />
      <PartnerCarousel />
      <WhyChoose />
      <ContactForm onSuccess={() => setShowSuccessModal(true)} />

      {/* Global Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
      />
    </div>
  );
};

export default ItServicesPage;