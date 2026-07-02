// WhyBobros — accordion left + orbiting droplet hub right (FINAL)
// Center BOBROS sphere: zoom in/out MATRAME (rotate AVVADHU)
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bus,
  MonitorSmartphone,
  Headphones,
  ChevronDown,
  ShieldCheck,
  Gift,
  Percent,
  Ticket,
  Route,
  Lock,
  IndianRupee,
  BadgeCheck,
  ReceiptText,
  Globe,
} from "lucide-react";

const BRAND = "#FD561E";

const features = [
  {
    icon: BadgeCheck,        // Trust / verified partner
    title: "India's travel & tech partner you can rely on",
    description:
      "Thousands of travellers trust BOBROS for every trip and every digital need, every single day.",
  },
  {
    icon: ReceiptText,       // Transparent pricing / no hidden fees
    title: "The price you see is the price you pay",
    description:
      "Zero hidden fees, zero surprises. Full fare transparency from search to booking confirmation.",
  },
  {
    icon: Bus,               // Bus routes — already correct
    title: "500+ operators. 10,000+ routes. One platform.",
    description:
      "India's widest bus network — from metro corridors to remote routes — all in one seamless search.",
  },
  {
    icon: Lock,              // Security — already correct
    title: "Bank-grade security at every step",
    description:
      "Your data, payments, and identity are protected by industry-standard encryption throughout.",
  },
  {
    icon: IndianRupee,             // Rewards / earn points — already correct
    title: "Earn rewards every time you book",
    description:
      "Collect BOBROS points on every trip. Redeem them for discounts on your next booking — instantly.",
  },
  {
    icon: Globe,             // Websites & digital presence
    title: "Websites and hosting built for growth",
    description:
      "Affordable, fast, and fully managed — your digital presence launched and scaled by our experts.",
  },
];

const orbitItems = [
  { icon: Ticket, label: ["JOINBOBROS", "10%"] },
  { icon: Gift, label: ["50 Reward", "Points"] },
  { icon: Percent, label: ["4%", "Rewards"] },
  { icon: ShieldCheck, label: ["Secure", "Payments"] },
  { icon: Route, label: ["10,000+", "Routes"] },
  { icon: Headphones, label: ["24×7", "Support"] },
];

// Decorative floating mini droplets (image lo unna chinna orange/white balls)
const floatBalls = [
  { size: 14, top: "10%", left: "12%", color: "orange", delay: 0 },
  { size: 11, top: "6%", left: "76%", color: "white", delay: 1.2 },
  { size: 16, top: "66%", left: "5%", color: "white", delay: 0.6 },
  { size: 12, top: "86%", left: "28%", color: "orange", delay: 1.8 },
  { size: 11, top: "56%", left: "93%", color: "white", delay: 0.3 },
  { size: 13, top: "88%", left: "70%", color: "orange", delay: 2.2 },
  { size: 9, top: "30%", left: "90%", color: "white", delay: 1.5 },
];

const ORBIT_RADIUS = 170;
const ORBIT_DURATION = 32;

export default function WhyBobros() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="py-8 md:py-10">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* CARD — light gray gradient (mari dark kaadu), compact */}
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: "linear-gradient(to bottom, #f1ebe5 0%, #ebe4dd 55%, #e6ded6 100%)",
            boxShadow: "0 0 30px rgba(15,23,42,0.14)",
          }}
        >
          <div className="p-6 md:p-8">
            {/* Heading */}
            <div className="mb-2 md:mb-3 text-center md:text-left max-w-3xl mx-auto md:mx-0">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-1"
              >
                Why choose{" "}
                <img
                  src="/assets/Bobros_logo.png"
                  alt="Bobros"
                  className="h-8 md:h-10 lg:h-12 w-auto inline-block"
                  style={{ verticalAlign: "middle" }}
                />{" "}
                ?
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mt-2 text-sm md:text-base text-slate-600 leading-relaxed"
              >
                Experience the best travel and digital services with our reliable, secure, and affordable platform.
              </motion.p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 items-center">
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

              {/* RIGHT: Orbiting droplet hub */}
              <div className="relative order-1 lg:order-2 flex items-center justify-center min-h-[380px] md:min-h-[460px]">
                {/* Soft warm background lighting */}
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(circle at center, rgba(253,86,30,0.08), transparent 70%)",
                  }}
                />

                {/* Pulsing orange glow behind everything */}
                <motion.div
                  animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.06, 1] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="pointer-events-none absolute h-[420px] w-[420px] rounded-full blur-[120px]"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(253,86,30,0.40), rgba(253,86,30,0))",
                  }}
                />

                {/* Floating mini droplet balls */}
                {floatBalls.map((b, i) => (
                  <motion.span
                    key={i}
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: b.delay }}
                    className="pointer-events-none absolute rounded-full"
                    style={{
                      width: b.size,
                      height: b.size,
                      top: b.top,
                      left: b.left,
                      background:
                        b.color === "orange"
                          ? `radial-gradient(circle at 32% 28%, #ff9b6a, ${BRAND} 60%, #c93f0e)`
                          : "radial-gradient(circle at 32% 28%, #ffffff, #f1ebe5 60%, #d9cfc6)",
                      boxShadow:
                        b.color === "orange"
                          ? `0 4px 10px ${BRAND}55`
                          : "0 4px 10px rgba(120,100,80,0.25)",
                    }}
                  />
                ))}

                {/* Rotating dashed rings — droplets tho same scale wrapper,
                     so mobile lo kuda droplets ring MEEDHA ne tirugutayi */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center scale-[0.7] sm:scale-90 md:scale-100">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                    className="absolute h-[345px] w-[345px] rounded-full border-dashed"
                    style={{
                      borderColor: "#FD561E",
                      borderWidth: "3px",
                      boxShadow: "0 0 15px rgba(253,86,30,0.35)",
                    }}
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 75, repeat: Infinity, ease: "linear" }}
                    className="absolute h-[220px] w-[220px] rounded-full border-dashed"
                    style={{
                      borderColor: `${BRAND}CC`,
                      borderWidth: "2px",
                      boxShadow: "0 0 10px rgba(253,86,30,0.25)",
                    }}
                  />
                </div>

                {/* ── CENTRAL HUB: pure CSS zoom (framer-motion ledhu) ──
                     CSS keyframes lo scale matrame undi — rotate avvadam IMPOSSIBLE */}
                <style>{`
                  @keyframes bobros-hub-zoom {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                  }
                  .bobros-hub { animation: bobros-hub-zoom 4s ease-in-out infinite; }
                `}</style>
                <div
                  className="bobros-hub relative z-10 flex h-32 w-32 md:h-40 md:w-40 flex-col items-center justify-center rounded-full text-white overflow-hidden"
                  style={{
                    background:
                      "radial-gradient(circle at 30% 20%, #ffd1bc 0%, #ff9b6a 18%, #ff7a45 35%, #FD561E 65%, #d44410 100%)",
                    boxShadow:
                      "0 0 80px rgba(253,86,30,0.55), 0 25px 50px rgba(253,86,30,0.45), inset 0 -12px 20px rgba(0,0,0,0.15)",
                  }}
                >
                  {/* specular highlight */}
                  <span
                    className="pointer-events-none absolute rounded-full blur-md"
                    style={{
                      width: "46%",
                      height: "30%",
                      top: "10%",
                      left: "14%",
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.85), rgba(255,255,255,0))",
                    }}
                  />
                  <img
                    src="/assets/Bobros_white.png"
                    alt="Bobros"
                    className="relative h-10 w-auto md:h-26 object-contain drop-shadow"
                  />
                  <span className="relative mt-1 text-[9px] md:text-[14px] opacity-95 tracking-wide">
                    Travel + Tech
                  </span>
                </div>

                {/* ── ORBITING DROPLETS (veetiki matrame rotation) ── */}
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
                            {/* Reverse rotation so labels stay straight + local float */}
                            <motion.div
                              animate={{
                                rotate: -360,
                                y: [0, i % 2 === 0 ? 3 : -3, 0],
                                x: [0, i % 2 === 0 ? -2 : 2, 0],
                              }}
                              transition={{
                                rotate: { duration: ORBIT_DURATION, repeat: Infinity, ease: "linear" },
                                y: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 },
                                x: { duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 },
                              }}
                              className="relative flex h-[100px] w-[100px] md:h-[112px] md:w-[112px] flex-col items-center justify-center rounded-full overflow-hidden"
                              style={{
                                // CLEAR glass: center transparent + rim ki DARK shadow (white kaadu)
                                background:
                                  "radial-gradient(circle at 50% 52%, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.03) 70%, rgba(115,95,85,0.05) 80%, rgba(115,95,85,0.16) 87%, rgba(115,95,85,0.07) 93%, rgba(115,95,85,0.02) 100%)",
                                backdropFilter: "blur(2px)",
                                WebkitBackdropFilter: "blur(2px)",
                                border: "1px solid rgba(120,100,90,0.35)",
                                boxShadow:
                                  "0 18px 30px -8px rgba(110,70,40,0.22), inset 0 3px 6px rgba(90,70,60,0.12), inset 0 -4px 8px rgba(90,70,60,0.14)",
                              }}
                            >
                              {/* glass reflection — thin arc */}
                              <span
                                className="pointer-events-none absolute"
                                style={{
                                  width: "38%",
                                  height: "13%",
                                  top: "9%",
                                  left: "13%",
                                  borderRadius: "999px",
                                  background:
                                    "linear-gradient(to bottom, rgba(255,255,255,0.85), rgba(255,255,255,0))",
                                  filter: "blur(2px)",
                                  transform: "rotate(-20deg)",
                                }}
                              />
                              {/* orange ambient reflection — center sphere glow bubble lo reflect */}
                              <span
                                className="pointer-events-none absolute rounded-full"
                                style={{
                                  width: "64%",
                                  height: "20%",
                                  bottom: "9%",
                                  left: "18%",
                                  background:
                                    "radial-gradient(ellipse at center, rgba(253,86,30,0.22), rgba(253,86,30,0) 70%)",
                                  filter: "blur(5px)",
                                }}
                              />
                              <Icon
                                className="relative h-5 w-5 md:h-6 md:w-6 mb-1"
                                style={{ color: BRAND }}
                                strokeWidth={2.2}
                              />
                              <span className="relative text-[10px] md:text-[11px] font-bold text-slate-800 leading-tight text-center px-1">
                                {item.label[0]}
                                <br />
                                {item.label[1]}
                              </span>
                            </motion.div>
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}