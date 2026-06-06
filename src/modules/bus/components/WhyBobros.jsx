import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Wallet,
  Bus,
  Lock,
  Gift,
  MonitorSmartphone,
} from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Trusted Travel and IT Services Brand in India",
    description:
      "Bobros is a trusted travel and technology platform delivering reliable booking experiences across India.",
    badge: "Trusted",
    theme: {
      bg: "from-blue-500 to-cyan-400",
      soft: "bg-blue-50",
      border: "border-blue-100",
      text: "text-blue-600",
      glow: "shadow-blue-500/20",
      cardGlow: "from-blue-400 to-cyan-300",
      bar: "from-blue-400 to-cyan-300",
    },
  },
  {
    icon: Wallet,
    title: "Pay Only What You See – No Extra Charges",
    description:
      "Transparent pricing with no hidden fees. What you see is what you pay.",
    badge: "No Hidden Fees",
    theme: {
      bg: "from-emerald-500 to-teal-400",
      soft: "bg-emerald-50",
      border: "border-emerald-100",
      text: "text-emerald-600",
      glow: "shadow-emerald-500/20",
      cardGlow: "from-emerald-400 to-teal-300",
      bar: "from-emerald-400 to-teal-300",
    },
  },
  {
    icon: Bus,
    title: "500+ Bus Operators on 10,000+ Routes",
    description:
      "Access a large network of operators and routes across major cities.",
    badge: "Vast Network",
    theme: {
      bg: "from-violet-500 to-purple-400",
      soft: "bg-violet-50",
      border: "border-violet-100",
      text: "text-violet-600",
      glow: "shadow-violet-500/20",
      cardGlow: "from-violet-400 to-purple-300",
      bar: "from-violet-400 to-purple-300",
    },
  },
  {
    icon: Lock,
    title: "Highly Secured User Journey",
    description:
      "Your bookings and payments are protected with modern security standards.",
    badge: "Secure",
    theme: {
      bg: "from-amber-500 to-orange-400",
      soft: "bg-amber-50",
      border: "border-amber-100",
      text: "text-amber-700",
      glow: "shadow-amber-500/20",
      cardGlow: "from-amber-400 to-orange-300",
      bar: "from-amber-400 to-orange-300",
    },
  },
  {
    icon: Gift,
    title: "Earn Reward Points on Every Journey",
    description:
      "Get reward points for every booking and redeem them for future travel.",
    badge: "Rewards",
    theme: {
      bg: "from-rose-500 to-pink-400",
      soft: "bg-rose-50",
      border: "border-rose-100",
      text: "text-rose-600",
      glow: "shadow-rose-500/20",
      cardGlow: "from-rose-400 to-pink-300",
      bar: "from-rose-400 to-pink-300",
    },
  },
  {
    icon: MonitorSmartphone,
    title: "Affordable, Fast & Easy Digital Services",
    description:
      "Bobros also provides web designing and hosting services for your digital journey.",
    badge: "IT Services",
    theme: {
      bg: "from-sky-500 to-blue-400",
      soft: "bg-sky-50",
      border: "border-sky-100",
      text: "text-sky-600",
      glow: "shadow-sky-500/20",
      cardGlow: "from-sky-400 to-blue-300",
      bar: "from-sky-400 to-blue-300",
    },
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.15,
      staggerChildren: 0.12,
    },
  },
};

const itemVariants = {
  hidden: { y: 40, opacity: 0, scale: 0.96, filter: "blur(6px)" },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      mass: 0.8,
    },
  },
};

export default function Home() {
  const navigate = useNavigate();

  // "Start Your Journey" click -> homepage ki velli, same page top ki smooth scroll
  const handleStartJourney = () => {
    navigate("/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-white relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(253,86,30,0.05)_0%,transparent_70%)]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.04)_0%,transparent_70%)]" />
        <div className="absolute top-[30%] right-[10%] w-[300px] h-[300px] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.04)_0%,transparent_70%)]" />
      </div>

      <section className="py-20 px-6 min-h-screen flex items-center justify-center font-sans relative z-10">
        <div className="max-w-7xl mx-auto w-full">
          {/* Header Section */}
          <div className="text-center mb-20 max-w-3xl mx-auto relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="mb-6"
            >
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#FD561E] bg-[#FFF1EC] border border-[#FD561E]/20 px-5 py-2 rounded-full tracking-wide uppercase">
                <span className="w-2 h-2 rounded-full bg-[#FD561E] animate-pulse" />
                Our Promise to You
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            >
              <h2 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-5 tracking-tight leading-[1.1]">
                Why Choose{" "}
                <span className="relative inline-block">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FD561E] to-orange-400">
                    BOBROS?
                  </span>
                  <svg
                    className="absolute -bottom-2 left-0 w-full"
                    viewBox="0 0 300 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <motion.path
                      d="M2 8C50 2 100 2 150 6C200 10 250 8 298 4"
                      stroke="url(#grad)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      fill="none"
                      initial={{ pathLength: 0, opacity: 0 }}
                      whileInView={{ pathLength: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, delay: 0.6, ease: "easeInOut" }}
                    />
                    <defs>
                      <linearGradient id="grad" x1="0" y1="0" x2="300" y2="0">
                        <stop offset="0%" stopColor="#fd561e" />
                        <stop offset="100%" stopColor="#fb923c" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
              </h2>
              <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
                Experience the best travel and digital services with our
                reliable, secure, and affordable platform.
              </p>
            </motion.div>

            {/* Decorative dots */}
            <div className="absolute -top-4 left-1/4 hidden lg:block">
              <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                {[0, 1, 2, 3, 4].map((row) =>
                  [0, 1, 2, 3, 4].map((col) => (
                    <circle
                      key={`${row}-${col}`}
                      cx={8 + col * 12}
                      cy={8 + row * 12}
                      r="1.5"
                      fill="#fd561e"
                      opacity={0.15 + (row + col) * 0.03}
                    />
                  ))
                )}
              </svg>
            </div>
            <div className="absolute -bottom-8 right-1/4 hidden lg:block">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                {[0, 1, 2, 3].map((row) =>
                  [0, 1, 2, 3].map((col) => (
                    <circle
                      key={`${row}-${col}`}
                      cx={8 + col * 10}
                      cy={8 + row * 10}
                      r="1.5"
                      fill="#fd561e"
                      opacity={0.1 + (row + col) * 0.04}
                    />
                  ))
                )}
              </svg>
            </div>
          </div>

          {/* Feature Grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const t = feature.theme;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{
                    y: -10,
                    scale: 1.02,
                    transition: { type: "spring", stiffness: 280, damping: 20 },
                  }}
                  className="group relative"
                >
                  {/* Card glow on hover - unique per card */}
                  <div className={`absolute -inset-[1px] bg-gradient-to-br ${t.cardGlow} rounded-[22px] opacity-0 group-hover:opacity-100 blur-[8px] transition-opacity duration-500`} />

                  <div className={`relative ${t.soft} backdrop-blur-xl p-8 rounded-[20px] border ${t.border} shadow-[0_4px_24px_rgba(0,0,0,0.03)] group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-shadow duration-500 h-full`}>
                    {/* Subtle top gradient line */}
                    <div className={`absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent ${t.bar} to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                    <div className="flex flex-col h-full">
                      <div className="flex justify-between items-start mb-7">
                        {/* Icon Badge - unique color */}
                        <motion.div
                          whileHover={{ rotate: -6, scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 280, damping: 14 }}
                          className={`relative w-[52px] h-[52px] rounded-2xl bg-gradient-to-br ${t.bg} flex items-center justify-center shadow-lg ${t.glow}`}
                        >
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
                          <Icon className="w-6 h-6 text-white relative z-10" strokeWidth={2.2} />
                        </motion.div>

                        {/* Badge - matching color */}
                        <span className={`text-[11px] font-bold uppercase tracking-widest ${t.text} ${t.soft} border ${t.border} px-4 py-1.5 rounded-full`}>
                          {feature.badge}
                        </span>
                      </div>

                      {/* Content */}
                      <h3 className="text-[1.15rem] font-bold text-slate-900 mb-3 group-hover:text-[#FD561E] transition-colors duration-400 leading-snug">
                        {feature.title}
                      </h3>
                      <p className="text-slate-500 leading-relaxed flex-grow text-[0.95rem]">
                        {feature.description}
                      </p>

                      {/* Bottom accent bar */}
                      <div className={`mt-6 h-[3px] rounded-full bg-gradient-to-r ${t.bar} opacity-0 group-hover:opacity-70 transition-opacity duration-500 w-16`} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mt-20 text-center"
          >
            <button
              type="button"
              onClick={handleStartJourney}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-[#FD561E] to-orange-500 text-white font-semibold text-sm shadow-lg shadow-[#FD561E]/30 hover:shadow-xl transition-shadow duration-300 cursor-pointer"
            >
              <ShieldCheck className="w-5 h-5" />
              Start Your Journey with Bobros
            </button>
          </motion.div>
        </div>
      </section>
    </main>
  );
}