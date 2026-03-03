import { motion } from "framer-motion";
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
  },
  {
    icon: Wallet,
    title: "Pay Only What You See – No Extra Charges",
    description:
      "Transparent pricing with no hidden fees. What you see is what you pay.",
    badge: "No Hidden Fees",
  },
  {
    icon: Bus,
    title: "500+ Bus Operators on 10,000+ Routes",
    description:
      "Access a large network of operators and routes across major cities.",
    badge: "Vast Network",
  },
  {
    icon: Lock,
    title: "Highly Secured User Journey",
    description:
      "Your bookings and payments are protected with modern security standards.",
    badge: "Secure",
  },
  {
    icon: Gift,
    title: "Earn Reward Points on Every Journey",
    description:
      "Get reward points for every booking and redeem them for future travel.",
    badge: "Rewards",
  },
  {
    icon: MonitorSmartphone,
    title: "Affordable, Fast & Easy Digital Services",
    description:
      "Bobros also provides web designing and hosting services for your digital journey.",
    badge: "IT Services",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

export default function Home() {
  return (
    <main className="min-h-screen bg-white mt-10">
      <section className="py-20 px-6 bg-gradient-to-b from-orange-50 to-white min-h-screen flex items-center justify-center font-sans overflow-hidden">
        <div className="max-w-7xl mx-auto w-full">
          {/* Header Section */}
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
                Why Choose{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fd561e] to-orange-400">
                  BOBROS?
                </span>
              </h2>
              <p className="text-lg text-slate-600">
                Experience the best travel and digital services with our
                reliable, secure, and affordable platform.
              </p>
            </motion.div>
          </div>

          {/* Feature Grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  className="group relative bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(253,86,30,0.1)] transition-all duration-300 border border-slate-100/50 z-10"
                >
                  {/* Glow Effect behind the card on hover */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-[#fd561e] to-orange-400 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-500 -z-10"></div>

                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-6">
                      {/* Icon Badge */}
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#fd561e] to-orange-400 flex items-center justify-center shadow-lg shadow-orange-500/30 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                        <Icon className="w-7 h-7 text-white" />
                      </div>

                      {/* Optional Highlight Badge */}
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#fd561e] bg-orange-100 px-3 py-1 rounded-full">
                        {feature.badge}
                      </span>
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-[#fd561e] transition-colors duration-300 leading-tight">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed flex-grow">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>
    </main>
  );
}
