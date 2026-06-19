import { motion } from "framer-motion";

const BRAND = "#FD561E";
const easeOutExpo = [0.22, 1, 0.36, 1];

export default function AppDownload() {
  return (
    <section className="w-full py-6 sm:py-8 md:py-10 px-3 sm:px-4 md:px-6">
      <div
        className="relative w-full max-w-6xl mx-auto rounded-3xl overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #FFE8D6 0%, #FFD3B0 55%, #FFC79A 100%)",
          minHeight: "360px",
        }}
      >
        {/* ── Desert background SVG ── */}
        <div className="absolute inset-0 pointer-events-none">
          <svg viewBox="0 0 1200 500" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
            <path d="M0,320 L150,200 L300,270 L450,160 L620,260 L800,170 L960,260 L1200,200 L1200,500 L0,500 Z" fill="#F5B07E" opacity="0.55" />
            <path d="M0,380 L140,280 L300,340 L500,270 L700,340 L900,270 L1100,330 L1200,300 L1200,500 L0,500 Z" fill="#EE9A66" opacity="0.55" />
            <g fill="#D97A4A" opacity="0.45">
              <rect x="560" y="310" width="14" height="70" />
              <rect x="578" y="290" width="18" height="90" />
              <rect x="600" y="300" width="12" height="80" />
              <rect x="616" y="270" width="22" height="110" />
              <rect x="642" y="295" width="14" height="85" />
              <rect x="660" y="285" width="18" height="95" />
              <rect x="682" y="305" width="12" height="75" />
              <rect x="698" y="292" width="16" height="88" />
            </g>
            <path d="M-20,500 C 200,460 350,470 500,450 C 700,425 850,460 1050,430 C 1150,415 1220,420 1240,418" stroke="#C26A3E" strokeWidth="90" fill="none" opacity="0.55" strokeLinecap="round" />
            <path d="M-20,500 C 200,460 350,470 500,450 C 700,425 850,460 1050,430 C 1150,415 1220,420 1240,418" stroke="#FFFFFF" strokeWidth="3" fill="none" strokeDasharray="14 18" opacity="0.75" />
          </svg>
        </div>

        {/* ── Main grid ── */}
        <div className="relative grid grid-cols-1 lg:grid-cols-[40%_60%] gap-0">

          {/* ── LEFT: Phone column ── */}
          <div className="flex justify-start items-end" style={{ minHeight: "360px" }}>

            {/* sticky so phone doesn't move on scroll */}
            <div className="sticky top-8 flex items-end justify-start pb-0">

              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.9, ease: easeOutExpo }}
                style={{
                  /* top leans LEFT (counter-clockwise), bottom stays right — exactly like 2nd image */
                  transform: "rotate(-18deg)",
                  transformOrigin: "bottom right",
                  marginLeft: "clamp(10px, 2vw, 24px)",
                  marginBottom: "24px",
                  marginLeft:"100px",
                }}
              >
                {/* Gentle float */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                  className="relative"
                  style={{ width: "clamp(140px, 16vw, 205px)" }}
                >
                  {/* Shadow */}
                  <div
                    className="absolute -bottom-4 left-4 right-4 h-7 rounded-full blur-2xl"
                    style={{ background: "rgba(0,0,0,0.28)" }}
                  />

                  {/* Side buttons */}
                  <div className="absolute -left-[3px] top-[90px]  h-6  w-[3px] rounded-l-md bg-slate-800" />
                  <div className="absolute -left-[3px] top-[122px] h-10 w-[3px] rounded-l-md bg-slate-800" />
                  <div className="absolute -left-[3px] top-[168px] h-10 w-[3px] rounded-l-md bg-slate-800" />
                  <div className="absolute -right-[3px] top-[138px] h-16 w-[3px] rounded-r-md bg-slate-800" />

                  {/* Black phone frame */}
                  <div
                    className="relative rounded-[44px] p-[8px] ring-1 ring-slate-800"
                    style={{
                      background: "#0f172a",
                      boxShadow: "0 28px 55px -12px rgba(15,23,42,0.6)",
                    }}
                  >
                    <div
                      className="relative overflow-hidden rounded-[37px] bg-white"
                      style={{ aspectRatio: "9/19.5" }}
                    >
                      {/* Dynamic island */}
                      <div className="flex h-7 items-center justify-center bg-slate-900">
                        <div className="h-[18px] w-[68px] rounded-full bg-black border border-slate-700" />
                      </div>
                      {/* App screenshot */}
                      <div className="absolute inset-0 top-7">
                        <img
                          src="/assets/Mobile_View.png"
                          alt="Bobros app"
                          className="w-full h-full object-cover object-top select-none pointer-events-none"
                          draggable={false}
                          onError={(e) => {
                            if (!e.currentTarget.dataset.tried) {
                              e.currentTarget.dataset.tried = "1";
                              e.currentTarget.src = "/assets/mobile_view.png";
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

            </div>
          </div>

          {/* ── RIGHT: Content ── */}
          <div className="flex flex-col justify-center py-8 px-4 sm:px-6 lg:pl-4 lg:pr-10">

            {/* Eyebrow */}
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: easeOutExpo }}
              className="tracking-[0.25em] text-xs sm:text-sm font-semibold text-neutral-700 mb-3"
            >
              TRY ON MOBILE
            </motion.p>

            {/* Heading */}
            <motion.h2
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.05, ease: easeOutExpo }}
              className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight text-neutral-900"
            >
              Download our app for
              <br />
              <span style={{ color: BRAND }}>unbeatable perks!</span>
            </motion.h2>

            {/* ── QR row ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15, ease: easeOutExpo }}
              className="mt-7 sm:mt-9 mb-6 sm:mb-7 flex items-center w-full"
            >
              {/* Left black location pin */}
              <div className="flex-shrink-0">
                <svg width="24" height="30" viewBox="0 0 28 36" fill="none">
                  <path d="M14 0C6.27 0 0 6.27 0 14c0 9.5 14 22 14 22S28 23.5 28 14C28 6.27 21.73 0 14 0z" fill="#1a1a1a" />
                  <circle cx="14" cy="13" r="5" fill="#FFE8D6" />
                </svg>
              </div>

              {/* Dashed curved path left */}
              <div className="flex-1 relative mx-1" style={{ height: "48px" }}>
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 48" preserveAspectRatio="none">
                  <path d="M2,34 C 20,34 30,10 50,10 C 70,10 80,34 98,34" stroke="#1a1a1a" strokeWidth="2.2" strokeDasharray="5 5" fill="none" strokeLinecap="round" />
                </svg>
              </div>

              {/* QR circle */}
              <div
                className="flex-shrink-0 relative z-10 rounded-4xl p-2.5 sm:p-3"
                style={{ background: "#fff", boxShadow: "0 4px 24px rgba(0,0,0,0.18)" }}
              >
                <img
                  src="/assets/qrcode_final.png"
                  alt="QR code"
                  className="w-20 h-20 sm:w-26 sm:h-26"
                />
              </div>

              {/* Dashed curved path right */}
              <div className="flex-1 relative mx-1" style={{ height: "48px" }}>
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 48" preserveAspectRatio="none">
                  <path d="M2,34 C 20,34 30,10 50,10 C 70,10 80,34 98,34" stroke="#1a1a1a" strokeWidth="2.2" strokeDasharray="5 5" fill="none" strokeLinecap="round" />
                </svg>
              </div>

              {/* Orange download pin */}
              <div
                className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
                style={{ backgroundColor: BRAND, boxShadow: "0 3px 10px rgba(253,86,30,0.4)" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M12 4v12m0 0l-5-5m5 5l5-5M4 20h16" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </motion.div>

            {/* Store buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.25, ease: easeOutExpo }}
              className="flex flex-wrap gap-3 items-center"
            >
              <a href="https://play.google.com/store/apps/details?id=app.bobrosone.android" target="_blank" rel="noopener noreferrer" className="hover:scale-[1.03] transition-transform">
                <img src="/assets/google_play2.png" alt="Get it on Google Play" className="h-[52px] sm:h-[60px] w-auto object-contain" />
              </a>
              <a href="https://apps.apple.com/in/app/bobros/id6504723845" target="_blank" rel="noopener noreferrer" className="hover:scale-[1.03] transition-transform">
                <img src="/assets/App-Store.png" alt="Download on App Store" className="h-[52px] sm:h-[124px] w-auto object-contain" />
              </a>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}