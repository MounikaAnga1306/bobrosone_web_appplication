// WhyBobros — accordion left + ANIMATED orbiting brand hub right
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plane,
  Hotel,
  Palmtree,
  Bus,
  MonitorSmartphone,
  Headphones,
  ChevronDown,
  MapPin,
  ShieldCheck,
  Gift,
  Percent,
  Ticket,
  Route,
} from "lucide-react";

import bobrosLogo from "/assets/Bobros_logo.png";
import bobrosWhiteLogo from "/assets/Bobros_whitelogo.png";

const BRAND = "#FD561E";

const features = [
  {
    icon: Plane,
    title: "Flights that fit every plan & pocket",
    description:
      "Search smarter, not harder. Bobros pulls live fares from top airlines so you can lock in the lowest price on domestic and international routes — no hidden charges, no surprises.",
  },
  {
    icon: Hotel,
    title: "Stays you'll actually want to come back to",
    description:
      "Hand-picked hotels, homestays and luxury resorts with verified reviews, free cancellation and pay-at-hotel options. Comfort guaranteed, every single night.",
  },
  {
    icon: Palmtree,
    title: "Holiday packages, planned end-to-end",
    description:
      "Weekend escapes or 15-day grand tours — we bundle flights, stays, sightseeing and transfers into one stress-free package so you only focus on the memories.",
  },
  {
    icon: Bus,
    title: "Bus tickets across 10,000+ Indian routes",
    description:
      "Live seat selection, 500+ trusted operators and on-time guarantees. From metros to small towns, Bobros gets you there safely and on schedule.",
  },
  {
    icon: MonitorSmartphone,
    title: "IT services — websites & hosting that scale",
    description:
      "Beyond travel, Bobros is your digital partner. Fast, modern websites paired with reliable hosting plans built for startups, small businesses and creators.",
  },
  {
    icon: Headphones,
    title: "24×7 human support, not chatbots",
    description:
      "Bookings, refunds, last-minute changes or travel emergencies — our team is one tap away, any hour of the day, every day of the year.",
  },
];

const orbitItems = [
  { icon: Ticket, label: "JOINBOBROS 10%" },
  { icon: Gift, label: "50 Reward Points" },
  { icon: Percent, label: "4% Rewards" },
  { icon: ShieldCheck, label: "Secure Payments" },
  { icon: Route, label: "10,000+ Routes" },
  { icon: Headphones, label: "24×7 Support" },
];

const ORBIT_RADIUS = 185;
const ORBIT_DURATION = 32;

export default function WhyBobros() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-orange-50/30 to-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8 md:p-10 lg:p-12">
            {/* Heading */}
            <div className="mb-3 md:mb-4 text-center md:text-left max-w-3xl mx-auto md:mx-0">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 flex flex-wrap items-center gap-x-3 gap-y-1"
              >
                Why choose{" "}
                <img
                  src={bobrosLogo}
                  alt="Bobros"
                  className="h-10 md:h-12 lg:h-14 w-auto inline-block"
                  style={{ verticalAlign: "middle" }}
                />{" "}
                ?
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mt-3 text-base md:text-lg text-slate-600 leading-relaxed"
              >
                Experience the best travel and digital services with our reliable, secure, and affordable platform.
              </motion.p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center">
              {/* LEFT: Accordion */}
              <div className="space-y-2 order-2 lg:order-1">
                {features.map((feature, idx) => {
                  const Icon = feature.icon;
                  const isOpen = openIndex === idx;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.4, delay: idx * 0.05 }}
                      className="rounded-xl border bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5"
                      style={{
                        borderColor: isOpen ? `${BRAND}55` : "#f1f5f9",
                        boxShadow: isOpen ? `0 4px 12px ${BRAND}1A` : "0 1px 3px rgba(15,23,42,0.05)",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left"
                        aria-expanded={isOpen}
                      >
                        <span
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors"
                          style={{ backgroundColor: isOpen ? BRAND : `${BRAND}15`, color: isOpen ? "#fff" : BRAND }}
                        >
                          <Icon className="h-4 w-4" strokeWidth={2.2} />
                        </span>
                        <h3 className="flex-1 text-sm md:text-base font-semibold text-slate-900 leading-snug">
                          {feature.title}
                        </h3>
                        <motion.span
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.25 }}
                          className="text-slate-400"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </motion.span>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            key="content"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <p className="px-4 pb-4 pl-[52px] text-xs md:text-sm leading-relaxed text-slate-600">
                              {feature.description}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>

              {/* RIGHT: Orbiting brand hub */}
              <div className="relative order-1 lg:order-2 flex items-center justify-center min-h-[420px] md:min-h-[540px]">
                {/* Pulsing glow */}
                <motion.div
                  animate={{ opacity: [0.25, 0.45, 0.25], scale: [1, 1.08, 1] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="pointer-events-none absolute h-[280px] w-[280px] rounded-full blur-3xl"
                  style={{ backgroundColor: `${BRAND}40` }}
                />

                {/* Rotating dashed rings */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                  className="absolute h-[370px] w-[370px] rounded-full border-2 border-dashed"
                  style={{ borderColor: `${BRAND}33` }}
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 75, repeat: Infinity, ease: "linear" }}
                  className="absolute h-[235px] w-[235px] rounded-full border border-dashed"
                  style={{ borderColor: `${BRAND}26` }}
                />

                {/* Central hub */}
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="relative z-10 flex h-28 w-28 md:h-32 md:w-32 flex-col items-center justify-center rounded-full text-white shadow-2xl"
                  style={{ background: `linear-gradient(135deg, ${BRAND}, #ff8a5c)` }}
                >
                  <img
                    src={bobrosWhiteLogo}
                    alt="Bobros"
                    className="h-10 w-auto md:h-14 object-contain"
                  />
                  <span className="mt-1 text-[9px] md:text-[10px] opacity-90 tracking-wide">
                    Travel + Tech
                  </span>
                </motion.div>

                {/* Orbiting offer chips */}
                <div className="absolute inset-0 z-20 scale-[0.7] sm:scale-90 md:scale-100">
                  <motion.div
                    className="absolute inset-0"
                    animate={{ rotate: 360 }}
                    transition={{ duration: ORBIT_DURATION, repeat: Infinity, ease: "linear" }}
                  >
                    {orbitItems.map((item, i) => {
                      const Icon = item.icon;
                      const a = (-90 + (360 / orbitItems.length) * i) * (Math.PI / 180);
                      const x = Math.cos(a) * ORBIT_RADIUS;
                      const y = Math.sin(a) * ORBIT_RADIUS;
                      return (
                        <div
                          key={i}
                          className="absolute"
                          style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)` }}
                        >
                          <div style={{ transform: "translate(-50%, -50%)" }}>
                            <motion.div
                              animate={{ rotate: -360 }}
                              transition={{ duration: ORBIT_DURATION, repeat: Infinity, ease: "linear" }}
                              className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2 shadow-lg ring-1 ring-slate-100"
                            >
                              <span
                                className="flex h-7 w-7 items-center justify-center rounded-lg"
                                style={{ backgroundColor: `${BRAND}15`, color: BRAND }}
                              >
                                <Icon className="h-4 w-4" strokeWidth={2.2} />
                              </span>
                              <span className="text-xs font-semibold text-slate-800 whitespace-nowrap">
                                {item.label}
                              </span>
                            </motion.div>
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                </div>

                {/* Decorative map pin */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-1 left-1/2 -translate-x-1/2 z-10 hidden md:block"
                >
                  <MapPin className="h-7 w-7 drop-shadow-md" fill={BRAND} stroke="#fff" strokeWidth={1.6} />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}