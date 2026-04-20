import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReCAPTCHA from "react-google-recaptcha";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import {
  FaPhone,
  FaWhatsapp,
  FaEnvelope,
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
} from "react-icons/fa";
import { motion } from "framer-motion";

// ------------------------------------------------------------
// Brand color
// ------------------------------------------------------------
const BRAND = "#fd561e";

// ------------------------------------------------------------
// Helper: smooth scroll
// ------------------------------------------------------------
const scrollToSection = (id) => {
  const element = document.getElementById(id);
  if (element) element.scrollIntoView({ behavior: "smooth" });
};

// ------------------------------------------------------------
// Header (unchanged, with mobile menu)
// ------------------------------------------------------------
const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef(null);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuOpen && navRef.current && !navRef.current.contains(e.target) && !e.target.closest(".menu-toggle")) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [menuOpen]);
};

// ------------------------------------------------------------
// Hero Section (unchanged)
// ------------------------------------------------------------
const Hero = () => (
  <motion.section
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    viewport={{ once: true }}
    className="container mx-auto -mt-6 px-4 pt-28 md:pt-32 pb-12"
  >
    <div className="flex flex-col md:flex-row items-center gap-8">
      <div className="md:w-7/12">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold">Looking for Professional Website or Product Development?</h1>
        <h2 className="text-2xl md:text-3xl font-bold mt-3"><span style={{ color: BRAND }}>You Are At The Right Place!</span></h2>
        <p className="text-gray-600 mt-4">BOBROS delivers modern, enterprise-grade Technology Solutions designed for scale, performance, and security. With capabilities in custom web development, mobile apps, full-stack product development, eCommerce engineering, hosting, and domain services, we help organizations accelerate their digital journey with confidence and clarity.</p>
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <button onClick={() => scrollToSection("contact-form")} style={{ backgroundColor: BRAND }} className="text-white font-semibold py-3 px-6 rounded-full hover:opacity-90 transition">Book a Call with us</button>
          <button onClick={() => scrollToSection("itpackages")} style={{ borderColor: BRAND, color: BRAND }} className="border-2 font-semibold py-3 px-6 rounded-full hover:opacity-80 transition">View Pricing</button>
        </div>
      </div>
      <div className="md:w-5/12 text-center">
        <img src="/assets/hero-web-mobile-development-india.png" alt="web-mobile-development" className="img-fluid" />
      </div>
    </div>
  </motion.section>
);

// ------------------------------------------------------------
// Services Cards (unchanged)
// ------------------------------------------------------------
const services = [
  { img: "/assets/frontendbg.png", title: "FrontEnd Development" },
  { img: "/assets/backendbg.png", title: "BackEnd Development" },
  { img: "/assets/mobiledevbg.png", title: "Mobile App Development" },
  { img: "/assets/domainbg.png", title: "Domain Registration & Hosting Services" },
];

const Services = () => (
  <section className="bg-gradient-to-b from-orange-50 to-white py-16">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {services.map((service, idx) => (
          <motion.div key={idx} whileHover={{ scale: 1.05 }} className="bg-white rounded-2xl p-5 text-center shadow-md hover:shadow-lg transition">
            <img src={service.img} alt={service.title} className="w-28 mx-auto mb-4" />
            <h5 className="font-bold text-gray-800">{service.title}</h5>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

// ------------------------------------------------------------
// IT Section (unchanged)
// ------------------------------------------------------------
const ItSection = () => (
  <section className="py-16 bg-gray-50">
    <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-8">
      <div className="md:w-1/2"><img src="/assets/aboutus.jpg" alt="IT Services" className="rounded-lg shadow" /></div>
      <div className="md:w-1/2">
        <h2 className="text-3xl font-bold mb-4">Build Your Digital Presence with Us</h2>
        <p className="text-gray-600 mb-6">As a trusted IT services provider in India, we offer reliable and affordable solutions designed to help your business grow online. Our team delivers custom website development services, professional web design & development, and full-stack development solutions tailored to your business needs. We also provide secure hosting, mobile-responsive designs, API integrations, and end-to-end technical support to ensure smooth performance at every stage. Whether you're a startup or an established business, our expertise as a mobile app development company and IT service provider makes it easier for you to build a strong and scalable digital presence.</p>
        <button onClick={() => scrollToSection("contact-form")} style={{ backgroundColor: BRAND }} className="text-white font-semibold cursor-pointer py-3 px-6 rounded-lg hover:opacity-90 transition">Get A Quote</button>
      </div>
    </div>
  </section>
);

// ------------------------------------------------------------
// Carousel Slider — ConnectingSection removed, appears here
// ------------------------------------------------------------
const carouselItems = [
  { image: "assets/images/5.jpg", title: "Go Digital - Standard Plan", subtitle: "The perfect solution for businesses looking to go digital effortlessly." },
  { image: "assets/images/6.jpeg", title: "Go Digital - Build and Maintain Plan", subtitle: "Seamlessly build and maintain your digital presence." },
  { image: "assets/images/7.png", title: "Go Digital - Build and Deploy Plan", subtitle: "Launch your website quickly without ongoing support." },
  { image: "assets/images/8.jpg", title: "Go Digital - Host Plan", subtitle: "Simple and affordable hosting for your business." },
];

const CarouselSlider = () => (
  <div className="my-8 container mx-auto px-4">
    <Swiper
      modules={[Autoplay, Pagination, EffectFade]}
      spaceBetween={0}
      slidesPerView={1}
      autoplay={{ delay: 3000, disableOnInteraction: false }}
      pagination={{ clickable: true }}
      effect="fade"
      className="rounded-xl shadow-lg"
    >
      {carouselItems.map((item, idx) => (
        <SwiperSlide key={idx}>
          <div className="relative h-64 md:h-96 w-full">
            <img src={item.image} alt={item.title} className="w-full h-full object-cover" onError={(e) => e.target.src = "https://via.placeholder.com/800x400?text=Image+Not+Found"} />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
              <h3 className="text-xl md:text-2xl font-bold">{item.title}</h3>
              {item.subtitle && <p className="text-sm md:text-base">{item.subtitle}</p>}
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  </div>
);

// ------------------------------------------------------------
// Postcards — alternating left/right image, hover zoom on image
// ------------------------------------------------------------
const postcards = [
  { img: "/assets/e-commerce.jpg", title: "E-commerce Website Development", desc: "Empowering businesses to sell digitally through modern and user-friendly E-Commerce websites. Our package includes domain, secure hosting, product catalog setup, shopping cart, and payment gateway integration.", tags: ["Custom Design", "Payment Gateway", "SEO Ready", "Clean UI/UX"] },
  { img: "/assets/appdev.jpg", title: "Mobile Application Development", desc: "We offer end-to-end Android and iOS app development solutions for businesses across all industries. From design to deployment, we build high-performance mobile apps that enhance customer engagement and drive growth.", tags: ["Android & iOS Apps", "Secure & Scalable", "High Performance"] },
  { img: "/assets/domainreg.jpg", title: "Domain Registration Services", desc: "We provide professional domain registration services for businesses of all sizes. Secure your brand identity online with the right domain name and take the first step toward building a strong digital presence.", tags: ["Affordable Pricing", "Instant Booking"] },
  { img: "/assets/websitedevelopment.jpg", title: "Static Website Development", desc: "Grow your business online with our static website services tailored for small companies. We provide end-to-end support including domain registration, custom website development, and secure hosting.", tags: ["Responsive Design", "Clean UI/UX", "Quick Delivery"] },
];

const Postcards = () => (
  <section className="py-16 bg-gray-100">
    <div className="container mx-auto px-4">
      <h2 className="text-3xl font-bold text-center mb-10">Our Services</h2>
      <div className="space-y-8">
        {postcards.map((card, idx) => {
          const isEven = idx % 2 === 0;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: isEven ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
              style={!isEven ? { flexDirection: "row-reverse" } : {}}
            >
              {/* Image with zoom on hover */}
              <div className="md:w-2/5 overflow-hidden">
                <motion.img
                  src={card.img}
                  alt={card.title}
                  className="w-full h-64 object-cover"
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 0.35 }}
                />
              </div>
              <div className="md:w-3/5 p-6 flex flex-col justify-center">
                <h3 className="text-2xl font-bold mb-2">{card.title}</h3>
                <div className="w-12 h-1 mb-4 rounded-full" style={{ backgroundColor: BRAND }}></div>
                <p className="text-gray-600 mb-4">{card.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {card.tags.map((tag, i) => (
                    <span key={i} className="bg-gray-200 text-gray-700 text-sm px-3 py-1 rounded-full">{tag}</span>
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

// ------------------------------------------------------------
// E-Commerce Packages
// ------------------------------------------------------------
const ecomPackages = [
  { icon: <FaBox />, title: "Starter", desc: "A simple, budget‑friendly e‑commerce solution for growing businesses.", features: ["Up to 100 products", "Payment gateway integration", "Mobile responsive", "Order management", "Custom API Integration"] },
  { icon: <FaChartLine />, title: "Growth", desc: "A powerful, scalable package for businesses ready to expand.", features: ["Unlimited products", "Payment gateway integration", "Custom features", "Inventory management", "Custom API Integration"] },
  { icon: <FaBolt />, title: "Enterprise", desc: "A fully customizable, enterprise‑grade ecosystem for large businesses.", features: ["Unlimited products and admin users", "Custom features", "Dedicated support", "Multiple Payment gateway integration", "Custom API Integration"] },
];

const EcomPackages = () => (
  <section className="py-16 bg-white">
    <div className="container mx-auto px-4 text-center">
      <h2 className="text-3xl md:text-4xl font-bold">E-Commerce <span style={{ color: BRAND }}>Packages</span></h2>
      <p className="text-gray-500 max-w-2xl mx-auto mt-4">E-commerce website pricing varies based on features, integrations, and business requirements. We customize each solution to perfectly match your needs.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 items-stretch">
        {ecomPackages.map((pkg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ y: -8 }}
            className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition flex flex-col"
          >
            <div className="text-4xl mb-4" style={{ color: BRAND }}>{pkg.icon}</div>
            <h3 className="text-2xl font-bold mb-2">{pkg.title}</h3>
            <p className="text-gray-500 mb-4">{pkg.desc}</p>
            <ul className="space-y-2 flex-1">
              {pkg.features.map((feat, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: BRAND }}></span> {feat}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
      <div className="mt-10">
        <button onClick={() => scrollToSection("contact-form")} style={{ backgroundColor: BRAND }} className="cursor-pointer text-white font-semibold py-3 px-8 rounded-lg hover:opacity-90 transition">Get A Quote</button>
      </div>
    </div>
  </section>
);

// ------------------------------------------------------------
// App Packages
// ------------------------------------------------------------
const appPackages = [
  { icon: <FaMobileAlt />, title: "Essential", platform: "Android or iOS", desc: "A solid, single‑platform app solution for startups and small businesses.", features: ["Native development", "Basic features", "API integration", "End-to-end delivery", "3 months support"] },
  { icon: <FaLayerGroup />, title: "Professional", platform: "Android + iOS", desc: "A feature‑rich, cross‑platform app for growing businesses.", features: ["Cross-platform development", "Custom features", "Multiple API integrations", "Push notifications", "End-to-end delivery", "6 months support"] },
  { icon: <FaRocket />, title: "Enterprise", platform: "Android + iOS + Web", desc: "A high‑end, fully customizable ecosystem for enterprise clients.", features: ["Cross-platform development", "Custom features", "Multiple API integrations", "Admin dashboard", "Push notifications", "End-to-end delivery", "12 months support"] },
];

const AppPackages = () => (
  <section className="py-16 bg-gray-50">
    <div className="container mx-auto px-4 text-center">
      <h2 className="text-3xl md:text-4xl font-bold">App Development <span style={{ color: BRAND }}>Packages</span></h2>
      <p className="text-gray-500 max-w-2xl mx-auto mt-4">Android and iOS app development packages differ based on platform, features, API integrations, and timelines. We build apps that users love.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 items-stretch">
        {appPackages.map((pkg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ y: -8 }}
            className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition flex flex-col"
          >
            <div className="text-4xl mb-4" style={{ color: BRAND }}>{pkg.icon}</div>
            <h3 className="text-2xl font-bold">{pkg.title}</h3>
            <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full mt-2" style={{ backgroundColor: "#fff1ec", color: BRAND }}>{pkg.platform}</span>
            <p className="text-gray-500 mt-3">{pkg.desc}</p>
            <ul className="mt-4 space-y-2 flex-1">
              {pkg.features.map((feat, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: BRAND }}></span> {feat}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
      <div className="mt-10">
        <button onClick={() => scrollToSection("contact-form")} style={{ backgroundColor: BRAND }} className="text-white font-semibold py-3 px-8 rounded-lg hover:opacity-90 transition">Discuss Your App Idea</button>
      </div>
    </div>
  </section>
);

// ------------------------------------------------------------
// Static Website Pricing — brand color gradient, equal card height
// ------------------------------------------------------------
const pricingPlansFlutter = [
  {
    title: "Go Digital - Standard",
    price: "₹599",
    period: "per month",
    popular: true,
    features: ["Hosting", "Domain", "Free SSL Certificate(HTTPS)", "5 Business Email IDs", "500 MB per Email", "Mobile Responsive", "20 Support Hours (Post Go Live)", "Extra Hours : ₹150/- per hour", "Annual Contract", "Get 2 months free! Pay ₹5990/year in advance"],
  },
  {
    title: "Go Digital - Switch",
    price: "₹499",
    period: "per month",
    popular: false,
    features: ["Hosting", "Free SSL Certificate(HTTPS)", "5 Business Email IDs", "500 MB per Email", "Mobile Responsive", "20 Support Hours (Post Go Live)", "Extra Hours : ₹150/- per hour", "Annual Contract", "Get 2 months free! Pay ₹4990/year in advance"],
  },
  {
    title: "Go Digital - Build and Deploy",
    price: "₹399",
    period: "per month",
    popular: false,
    features: ["Hosting", "Free SSL Certificate(HTTPS)", "5 Business Email IDs", "500 MB per Email", "Mobile Responsive", "Extra Hours : ₹150/- per hour", "Annual Contract", "Get 2 months free! Pay ₹3990/year in advance"],
  },
  {
    title: "Go Digital - Host",
    price: "₹199",
    period: "per month",
    popular: false,
    features: ["Hosting", "Free SSL Certificate(HTTPS)", "No Development", "No Standard Support Hours", "Hosting for just ₹199/month", "Extra Hours : ₹150/- per hour", "Annual Contract", "Get 2 months free! Pay ₹1990/year in advance"],
  },
];

const PricingCardFlutter = ({ plan, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.1 }}
    viewport={{ once: true }}
    whileHover={{ y: -10, boxShadow: "0 20px 40px rgba(253,86,30,0.18)" }}
    className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col"
    style={plan.popular ? { outline: `2px solid ${BRAND}` } : {}}
  >
    {plan.popular && (
      <div className="text-center text-xs font-bold py-1.5 text-white tracking-widest" style={{ backgroundColor: BRAND }}>
        ⭐ MOST POPULAR
      </div>
    )}
    {/* Header with brand gradient */}
    <div className="p-5 text-white" style={{ background: `linear-gradient(135deg, ${BRAND} 0%, #ff8c5a 100%)` }}>
      <h3 className="text-lg font-bold leading-tight">{plan.title}</h3>
      <div className="mt-3 flex items-end gap-1">
        <span className="text-4xl font-extrabold">{plan.price}</span>
        <span className="text-sm opacity-80 mb-1">/{plan.period}</span>
      </div>
    </div>
    {/* Features */}
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
        className="mt-6 w-full text-white font-semibold py-2.5 rounded-full hover:opacity-90 transition"
        style={{ backgroundColor: BRAND }}
      >
        Get Quote
      </button>
    </div>
  </motion.div>
);

const PricingSectionFlutter = () => (
  <section id="itpackages" className="py-16 bg-gray-50">
    <div className="container mx-auto px-4 text-center">
      <h2 className="text-3xl font-bold mb-2">Static Website <span style={{ color: BRAND }}>Packages</span></h2>
      <p className="text-gray-500 mb-1">Choose the perfect package for your business needs</p>
      <p className="text-gray-400 text-sm mb-10">All packages include 5 Business email IDs</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {pricingPlansFlutter.map((plan, idx) => (
          <PricingCardFlutter key={idx} plan={plan} index={idx} />
        ))}
      </div>
    </div>
  </section>
);

// ------------------------------------------------------------
// What We Do — 3+3 grid, bigger cards, brand color gradient on select
// ------------------------------------------------------------
const whatWeDoItems = [
  { icon: <FaCogs />, title: "Settings", desc: "We provide flexible options to configure your site according to your business needs." },
  { icon: <FaTachometerAlt />, title: "Speedup", desc: "Our optimization techniques ensure a seamless user experience for your visitors." },
  { icon: <FaLock />, title: "Privacy", desc: "We implement best practices to protect sensitive information and ensure privacy compliance." },
  { icon: <FaCloudUploadAlt />, title: "Backups", desc: "Quickly restore your site to its previous state in case of data corruption or issues." },
  { icon: <FaShieldAlt />, title: "SSL Secured", desc: "Build trust with your users by offering safe and secure browsing experiences." },
  { icon: <FaDatabase />, title: "Database", desc: "We offer timely assistance and ongoing maintenance for your peace of mind." },
];

const WhatWeDo = () => {
  const [selected, setSelected] = useState(-1);
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-10" style={{ color: BRAND }}>What We Do</h2>
        {/* strict 3+3 grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {whatWeDoItems.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.07 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, boxShadow: "0 16px 40px rgba(253,86,30,0.14)" }}
              onClick={() => setSelected(selected === idx ? -1 : idx)}
              className="p-8 rounded-2xl shadow-md cursor-pointer transition-all duration-300"
              style={
                selected === idx
                  ? { background: `linear-gradient(135deg, ${BRAND} 0%, #ff8c5a 100%)`, color: "#fff" }
                  : { backgroundColor: "#fff", color: "#1f2937" }
              }
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

// ------------------------------------------------------------
// Our Partners — smooth continuous CSS animation (right to left)
// ------------------------------------------------------------
const partnerLogos = [
  "/images/sectigo.png",
  "/images/openprovider_logo.webp",
  "/images/Godaddy-logo.png",
  "/images/aws5.png",
  "/images/razorpay_icon.webp",
  "/images/Google-Partner.png",
];

const PartnerCarousel = () => {
  // triple duplicate for seamless infinite loop
  const allLogos = [...partnerLogos, ...partnerLogos, ...partnerLogos];

  return (
    <div className="py-12 bg-gray-50 overflow-hidden">
      <style>{`
        @keyframes partnersScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.3333%); }
        }
        .partners-track {
          animation: partnersScroll 20s linear infinite;
          will-change: transform;
        }
        .partners-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="container mx-auto px-4 mb-8">
        <h3 className="text-center text-2xl font-bold">Our Partners</h3>
      </div>

      <div className="relative">
        {/* soft fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to right, #f9fafb 0%, transparent 100%)" }}></div>
        <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to left, #f9fafb 0%, transparent 100%)" }}></div>

        <div className="partners-track flex gap-16 items-center" style={{ width: "max-content" }}>
          {allLogos.map((src, idx) => (
            <img
              key={idx}
              src={src}
              alt="partner"
              className="h-12 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0"
              style={{ flexShrink: 0 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------
// Why Choose Us — taller cards, brand color
// ------------------------------------------------------------
const whyChoose = [
  { title: "Modern UI/UX", desc: "Beautiful, intuitive designs that engage users and drive conversions" },
  { title: "Fast Delivery", desc: "Quick turnaround times without compromising on quality" },
  { title: "Secure & Optimized", desc: "Enterprise-grade security and performance optimization" },
  { title: "Affordable Packages", desc: "Competitive pricing with transparent annual contracts" },
  { title: "Ongoing Support", desc: "Dedicated support team ready to help whenever you need" },
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
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.08 }}
            viewport={{ once: true }}
            whileHover={{ y: -6, boxShadow: "0 12px 32px rgba(253,86,30,0.10)" }}
            className="p-8 border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition flex flex-col justify-center min-h-[160px]"
          >
            <h3 className="text-xl font-bold mb-3" style={{ color: BRAND }}>{item.title}</h3>
            <p className="text-gray-600">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

// ------------------------------------------------------------
// Contact Form — radio for Static/E-Commerce, package select,
//               billing cycle radio, same existing layout
// ------------------------------------------------------------
const staticPackageOptions = [
  "Go Digital - Standard (₹599/mo)",
  "Go Digital - Switch (₹499/mo)",
  "Go Digital - Build and Deploy (₹399/mo)",
  "Go Digital - Host (₹199/mo)",
];

const ecomPackageOptions = [
  "E-Commerce Starter",
  "E-Commerce Growth",
  "E-Commerce Enterprise",
];

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    business_name: "",
    email: "",
    phone: "",
    city: "",
    country: "",
    message: "",
    serviceType: "static",
    selectedPackage: "",
    billingCycle: "monthly",
  });
  const [captchaToken, setCaptchaToken] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null);
  const recaptchaRef = useRef();

  // Reset package when service type changes
  useEffect(() => {
    setFormData((prev) => ({ ...prev, selectedPackage: "" }));
  }, [formData.serviceType]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name || !/^[A-Za-z\s]+$/.test(formData.name) || formData.name.length > 40) newErrors.name = "Valid name required (max 40 chars, letters only)";
    if (formData.business_name && (!/^[A-Za-z\s]+$/.test(formData.business_name) || formData.business_name.length > 50)) newErrors.business_name = "Business name: letters only, max 50";
    if (!formData.email || !/^(?!.*@(http|https|www|localhost|local|test|example)\.)[a-zA-Z0-9._%+-]+@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(formData.email)) newErrors.email = "Valid email required";
    if (!formData.phone || !/^[6-9]\d{9}$/.test(formData.phone)) newErrors.phone = "Valid 10-digit mobile number required";
    if (!formData.city || !/^[A-Za-z\s]+$/.test(formData.city) || formData.city.length > 30) newErrors.city = "City: letters only, max 30";
    if (!formData.country || !/^[A-Za-z\s]+$/.test(formData.country) || formData.country.length > 30) newErrors.country = "Country: letters only, max 30";
    if (!formData.message || !/^[A-Za-z\s.,]+$/.test(formData.message) || formData.message.length > 1000) newErrors.message = "Message: letters, spaces, comma, dot only, max 1000 chars";
    if (!captchaToken) newErrors.captcha = "Please complete the reCAPTCHA";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let sanitized = value;
    if (["name", "business_name", "city", "country"].includes(name)) sanitized = value.replace(/[^A-Za-z\s]/g, "");
    if (name === "phone") sanitized = value.replace(/\D/g, "").slice(0, 10);
    setFormData({ ...formData, [name]: sanitized });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const response = await axios.post("/api/contact", { ...formData, captchaToken });
      if (response.data.success) {
        setSubmitStatus("success");
        setFormData({ name: "", business_name: "", email: "", phone: "", city: "", country: "", message: "", serviceType: "static", selectedPackage: "", billingCycle: "monthly" });
        recaptchaRef.current.reset();
        setCaptchaToken(null);
        setTimeout(() => setSubmitStatus(null), 5000);
      } else setSubmitStatus("error");
    } catch { setSubmitStatus("error"); }
  };

  const packageOptions = formData.serviceType === "static" ? staticPackageOptions : ecomPackageOptions;

  return (
    <section id="contact-form" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Let's Start Your <span style={{ color: BRAND }}>Project</span></h2>
          <p className="text-gray-500 mt-2">Get in touch with us today and transform your digital presence</p>
        </div>
        <div className="flex flex-col lg:flex-row gap-8 max-w-5xl mx-auto">

          {/* ── Form ── */}
          <div className="lg:w-1/2 bg-white rounded-2xl p-6 shadow-md">
            <form onSubmit={handleSubmit}>

              {/* Basic text fields */}
              {["name", "business_name", "email", "phone", "city", "country"].map((field) => (
                <div key={field} className="mb-4">
                  <label className="block text-sm font-medium mb-1 capitalize after:content-['*'] after:text-red-500 after:ml-1">{field.replace("_", " ")}</label>
                  <input
                    type={field === "email" ? "email" : "text"}
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none transition"
                    onFocus={(e) => (e.target.style.boxShadow = `0 0 0 2px ${BRAND}44`)}
                    onBlur={(e) => (e.target.style.boxShadow = "")}
                  />
                  {errors[field] && <p className="text-red-500 text-xs mt-1">{errors[field]}</p>}
                </div>
              ))}

              {/* Message */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 after:content-['*'] after:text-red-500 after:ml-1">Your requirements</label>
                <textarea
                  name="message"
                  rows="3"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none transition"
                  onFocus={(e) => (e.target.style.boxShadow = `0 0 0 2px ${BRAND}44`)}
                  onBlur={(e) => (e.target.style.boxShadow = "")}
                ></textarea>
                {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
              </div>

              {/* ── Service type radio ── */}
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2 text-gray-700">Select Service Type</label>
                <div className="flex gap-3 flex-wrap">
                  {[
                    { value: "static", label: "📄 Static Website" },
                    { value: "ecommerce", label: "🛒 E-Commerce" },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-xl border-2 transition-all duration-200 text-sm font-medium select-none"
                      style={
                        formData.serviceType === opt.value
                          ? { borderColor: BRAND, backgroundColor: "#fff1ec", color: BRAND }
                          : { borderColor: "#e5e7eb", backgroundColor: "#f9fafb", color: "#6b7280" }
                      }
                    >
                      <input
                        type="radio"
                        name="serviceType"
                        value={opt.value}
                        checked={formData.serviceType === opt.value}
                        onChange={handleChange}
                        className="w-4 h-4"
                        style={{ accentColor: BRAND }}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* ── Package select (changes based on serviceType) ── */}
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2 text-gray-700">Select Package</label>
                <select
                  name="selectedPackage"
                  value={formData.selectedPackage}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none transition bg-white"
                  onFocus={(e) => (e.target.style.boxShadow = `0 0 0 2px ${BRAND}44`)}
                  onBlur={(e) => (e.target.style.boxShadow = "")}
                >
                  <option value="">-- Select a package --</option>
                  {packageOptions.map((pkg, i) => (
                    <option key={i} value={pkg}>{pkg}</option>
                  ))}
                </select>
              </div>

              {/* ── Billing cycle radio ── */}
              <div className="mb-5">
                <label className="block text-sm font-semibold mb-2 text-gray-700">Billing Preference</label>
                <div className="flex gap-3 flex-wrap">
                  {[
                    { value: "monthly", label: "📅 Monthly" },
                    { value: "annual", label: "📆 Annual (Save 2 months!)" },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-xl border-2 transition-all duration-200 text-sm font-medium select-none"
                      style={
                        formData.billingCycle === opt.value
                          ? { borderColor: BRAND, backgroundColor: "#fff1ec", color: BRAND }
                          : { borderColor: "#e5e7eb", backgroundColor: "#f9fafb", color: "#6b7280" }
                      }
                    >
                      <input
                        type="radio"
                        name="billingCycle"
                        value={opt.value}
                        checked={formData.billingCycle === opt.value}
                        onChange={handleChange}
                        className="w-4 h-4"
                        style={{ accentColor: BRAND }}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* reCAPTCHA */}
              <div className="mb-4 flex justify-center">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey="6LdiGHoqAAAAAN90VCdcRejhGX7BiLhO1679ITMK"
                  onChange={(token) => setCaptchaToken(token)}
                  onExpired={() => setCaptchaToken(null)}
                />
              </div>
              {errors.captcha && <p className="text-red-500 text-xs text-center mb-2">{errors.captcha}</p>}
              {submitStatus === "success" && <p className="text-green-600 text-center mb-2">Thank you! We'll get back to you soon.</p>}
              {submitStatus === "error" && <p className="text-red-600 text-center mb-2">Something went wrong. Please try again.</p>}

              <button
                type="submit"
                className="w-full text-white font-semibold py-3 rounded-lg hover:opacity-90 transition"
                style={{ backgroundColor: BRAND }}
              >
                Get Free Quote
              </button>
            </form>
          </div>

          {/* ── Quick Contact ── */}
          <div className="lg:w-1/2">
            <div className="mb-6">
              <h3 className="text-2xl font-bold">Quick Contact</h3>
              <p className="text-gray-500 mt-2">Begin your digital growth journey with us. Reach out via WhatsApp or email for a quick response.</p>
            </div>
            <button onClick={() => window.open("https://wa.me/9133133456", "_blank")} className="w-full flex items-center gap-4 border border-gray-200 rounded-xl p-4 mb-4 hover:shadow-md transition">
              <span className="text-2xl">💬</span>
              <div>
                <div className="font-semibold">WhatsApp Us</div>
                <div className="text-sm text-gray-500">+91-9133 133 456</div>
              </div>
            </button>
            <button className="w-full flex items-center gap-4 border border-gray-200 rounded-xl p-4 mb-4 hover:shadow-md transition">
              <span className="text-2xl">📧</span>
              <div>
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

// ------------------------------------------------------------
// Footer (unchanged)
// ------------------------------------------------------------
const Footer = () => (
  <footer className="bg-gray-200 py-6 border-t-4 border-red-600">
    <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="text-center md:text-left">
        <p className="text-gray-700">Narasaraopet & Hyderabad</p>
        <p className="text-gray-700">© BOBROS Consultancy Services Pvt. Ltd., India.</p>
        <div className="flex flex-wrap justify-center md:justify-start gap-2 text-sm">
          <a href="/aboutus.html" className="hover:underline">About Us</a> | <a href="/PrivacyPolicy.html" className="hover:underline">Privacy Policy</a> | <a href="/disclaimerpolicy.html" className="hover:underline">Disclaimer Policy</a> | <a href="/cancellationandrefund.html" className="hover:underline">Cancellation & Refund Policy</a> | <a href="/termsandconditions.html" className="hover:underline">Terms</a> | <a href="/contactus.html" className="hover:underline">Contact</a>
        </div>
      </div>
      <div className="flex gap-4">
        <img src="/images/cards1.png" alt="cards" className="h-12" />
        <img src="/images/cards2.jpg" alt="cards" className="h-12" />
      </div>
    </div>
  </footer>
);

// ------------------------------------------------------------
// WhatsApp Float (unchanged)
// ------------------------------------------------------------
const WhatsAppFloat = () => (
  <a href="https://wa.me/9133133456" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 bg-green-500 rounded-full p-3 shadow-lg hover:scale-110 transition z-50">
    <img src="/images/WhatsApp.webp" alt="WhatsApp" className="w-8 h-8" />
  </a>
);

// ------------------------------------------------------------
// Main Page
// ------------------------------------------------------------
const ItServicesPage = () => {
  return (
    <div className="overflow-x-hidden">
      <Header />
      <Hero />
      <Services />
      <ItSection />
      <CarouselSlider />
      <Postcards />
      <EcomPackages />
      <AppPackages />
      <PricingSectionFlutter />
      <WhatWeDo />
      <PartnerCarousel />
      <WhyChoose />
      <ContactForm />
      <Footer />
      <WhatsAppFloat />
    </div>
  );
};

export default ItServicesPage;