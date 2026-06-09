import { motion } from "framer-motion";

const BRAND = "#FD561E";
const easeOutExpo = [0.22, 1, 0.36, 1];

export default function AppDownload() {
  return (
    <section className="w-full py-8 sm:py-12 md:py-16 px-3 sm:px-4 md:px-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative max-w-7xl mx-auto bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 overflow-hidden px-5 sm:px-6 md:px-8 lg:px-12 pt-8 sm:pt-10 md:pt-12 pb-0 flex flex-col lg:flex-row items-center lg:items-end justify-between gap-8 lg:gap-6"
      >
        {/* LEFT — heading */}
        <div className="w-full lg:w-[30%] text-center lg:text-left lg:self-center lg:pb-12 order-1">
          <motion.p
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
            className="text-[#fd561e] text-sm sm:text-base md:text-lg lg:text-xl mb-2 sm:mb-3 font-semibold tracking-wide"
          >
            Try on Mobile
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: 0.25, ease: "easeOut" }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight"
          >
            Download our app for{" "}
            <span className="bg-gradient-to-r from-[#FD561E] to-[#ff8a5c] bg-clip-text text-transparent">
              unbeatable perks!
            </span>
          </motion.h2>
        </div>

        {/* CENTER — realistic phone, rises from bottom & half-cut by the card */}
        <motion.div
          initial={{ opacity: 0, y: 150 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.9, ease: easeOutExpo }}
          className="w-full lg:w-auto flex justify-center self-end -mb-[50px] lg:-mb-[130px] order-2"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-[230px] sm:w-[260px] md:w-[280px] lg:w-[300px]"
          >
            {/* glow under phone */}
            <div
              className="pointer-events-none absolute inset-x-6 bottom-10 top-24 rounded-[60px] blur-3xl opacity-40"
              style={{ backgroundColor: `${BRAND}40` }}
            />

            {/* side buttons */}
            <div className="absolute -left-[3px] top-[96px] h-7 w-[3px] rounded-l-md bg-slate-700" />
            <div className="absolute -left-[3px] top-[136px] h-12 w-[3px] rounded-l-md bg-slate-700" />
            <div className="absolute -left-[3px] top-[196px] h-12 w-[3px] rounded-l-md bg-slate-700" />
            <div className="absolute -right-[3px] top-[160px] h-20 w-[3px] rounded-r-md bg-slate-700" />

            {/* frame */}
            <div className="relative rounded-[46px] bg-slate-900 p-[9px] shadow-[0_35px_70px_-20px_rgba(15,23,42,0.55)] ring-1 ring-slate-800">
              <div className="relative h-[470px] sm:h-[520px] md:h-[560px] lg:h-[600px] w-full overflow-hidden rounded-[38px] bg-white">
                {/* dynamic island */}
                <div className="absolute left-1/2 top-2.5 z-20 h-[26px] w-[92px] -translate-x-1/2 rounded-full bg-slate-900" />

                {/* app screen */}
                <img
                  src="/assets/Mobile_View.png"
                  alt="Bobros app preview"
                  className="absolute inset-0 h-full w-full object-cover object-top"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />

                {/* fallback */}
                <div className="absolute inset-0 -z-10 flex items-center justify-center bg-slate-50">
                  <span className="text-2xl font-extrabold" style={{ color: BRAND }}>
                    bobros
                  </span>
                </div>

                {/* subtle reflection */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-transparent" />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* RIGHT — QR + store buttons */}
        <div className="w-full lg:w-[30%] flex flex-col items-center lg:items-start gap-4 sm:gap-5 lg:self-center lg:pb-12 order-3">
          {/* QR Code */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, x: 30 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
            whileHover={{ scale: 1.05 }}
            className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-white p-2.5 md:p-3 rounded-2xl shadow-2xl border border-gray-100 flex items-center justify-center flex-shrink-0"
          >
            <img
              src="/assets/Scanner.png"
              alt="Scan to download app"
              className="w-full h-full cursor-pointer object-contain"
            />
          </motion.div>

          {/* Store buttons */}
          <div className="flex flex-col gap-2.5 md:gap-3">
            <motion.a
              href="https://play.google.com/store/apps/details?id=app.bobrosone.android"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
              whileHover={{ y: -2, scale: 1.04 }}
              className="cursor-pointer"
            >
              <img
                src="/assets/google_play2.png"
                alt="Get it on Google Play"
                className="w-32 sm:w-36 md:w-40 lg:w-44 h-auto"
              />
            </motion.a>

            <motion.a
              href="https://apps.apple.com/in/app/bobros/id6504723845"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
              whileHover={{ y: -2, scale: 1.04 }}
              className="cursor-pointer"
            >
              <img
                src="/assets/App-Store.png"
                alt="Download on App Store"
                className="w-40 sm:w-48 md:w-52 lg:w-56 -ml-1 object-contain"
              />
            </motion.a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}