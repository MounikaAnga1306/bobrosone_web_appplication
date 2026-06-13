import { motion } from "framer-motion";

const BRAND = "#FD561E";
const easeOutExpo = [0.22, 1, 0.36, 1];

export default function AppDownload() {
  return (
    <section className="w-full py-6 sm:py-8 md:py-10 px-3 sm:px-4 md:px-6">
      <div
        className="relative w-full max-w-6xl mx-auto rounded-3xl overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, #FFE8D6 0%, #FFD3B0 55%, #FFC79A 100%)",
        }}
      >
        {/* ── Desert background SVG ── */}
        <div className="absolute inset-0 pointer-events-none">
          <svg
            viewBox="0 0 1200 500"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full"
          >
            <path
              d="M0,360 L180,230 L320,310 L470,200 L640,300 L820,210 L980,300 L1200,240 L1200,500 L0,500 Z"
              fill="#F5B07E"
              opacity="0.55"
            />
            <path
              d="M0,400 L160,300 L320,370 L520,290 L720,360 L900,300 L1100,360 L1200,330 L1200,500 L0,500 Z"
              fill="#EE9A66"
              opacity="0.55"
            />
            <g fill="#D97A4A" opacity="0.45">
              <rect x="560" y="330" width="14" height="50" />
              <rect x="578" y="315" width="18" height="65" />
              <rect x="600" y="325" width="12" height="55" />
              <rect x="616" y="300" width="22" height="80" />
              <rect x="642" y="320" width="14" height="60" />
              <rect x="660" y="310" width="18" height="70" />
              <rect x="682" y="328" width="12" height="52" />
              <rect x="698" y="318" width="16" height="62" />
            </g>
            <path
              d="M-20,500 C 200,460 350,470 500,450 C 700,425 850,460 1050,430 C 1150,415 1220,420 1240,418"
              stroke="#C26A3E"
              strokeWidth="80"
              fill="none"
              opacity="0.55"
              strokeLinecap="round"
            />
            <path
              d="M-20,500 C 200,460 350,470 500,450 C 700,425 850,460 1050,430 C 1150,415 1220,420 1240,418"
              stroke="#FFFFFF"
              strokeWidth="3"
              fill="none"
              strokeDasharray="14 18"
              opacity="0.75"
            />
          </svg>
        </div>

        {/* ── Main grid ── */}
        <div className="relative grid grid-cols-1 lg:grid-cols-[42%_58%] gap-4 lg:gap-0 p-4 sm:p-6 md:p-8 lg:p-10">

          {/* ── LEFT: Black phone frame, tilted, float ── */}
          <div className="flex justify-center lg:justify-start items-center py-6 lg:py-0">
            <div className="lg:sticky lg:top-24">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.9, ease: easeOutExpo }}
                style={{ transform: "rotate(-18deg)", transformOrigin: "bottom center" }}
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                  className="relative w-[165px] sm:w-[185px] md:w-[205px] lg:w-[225px]"
                >
                  {/* shadow under phone */}
                  <div className="absolute -bottom-5 left-5 right-5 h-8 rounded-full bg-black/25 blur-2xl" />

                  {/* side buttons */}
                  <div className="absolute -left-[3px] top-[90px]  h-6  w-[3px] rounded-l-md bg-slate-800" />
                  <div className="absolute -left-[3px] top-[122px] h-10 w-[3px] rounded-l-md bg-slate-800" />
                  <div className="absolute -left-[3px] top-[168px] h-10 w-[3px] rounded-l-md bg-slate-800" />
                  <div className="absolute -right-[3px] top-[138px] h-16 w-[3px] rounded-r-md bg-slate-800" />

                  {/* black phone frame */}
                  <div className="relative rounded-[44px] bg-slate-900 p-[8px] shadow-[0_28px_55px_-12px_rgba(15,23,42,0.6)] ring-1 ring-slate-800">
                    <div className="relative overflow-hidden rounded-[37px] bg-white" style={{ aspectRatio: "9/19.5" }}>
                      {/* dynamic island */}
                      <div className="flex h-7 items-center justify-center bg-slate-900">
                        <div className="h-[18px] w-[68px] rounded-full bg-black border border-slate-700" />
                      </div>
                      {/* app screenshot fills rest */}
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
          <div className="flex flex-col justify-center lg:pl-4">

            {/* eyebrow */}
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: easeOutExpo }}
              className="tracking-[0.25em] text-xs sm:text-sm font-semibold text-neutral-700 mb-3"
            >
              TRY ON MOBILE
            </motion.p>

            {/* heading */}
            <motion.h2
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.05, ease: easeOutExpo }}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-extrabold leading-tight text-neutral-900"
            >
              Download our app for
              <br />
              <span style={{ color: BRAND }}>unbeatable perks!</span>
            </motion.h2>

            {/* ── QR row: pin → dashed → QR → dashed → orange pin ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15, ease: easeOutExpo }}
              className="mt-7 sm:mt-9 mb-6 sm:mb-7 flex items-center w-full"
            >
              {/* Left black location pin */}
              <div className="flex-shrink-0">
                <svg width="22" height="28" viewBox="0 0 28 34" fill="none">
                  <path
                    d="M14 0C6.27 0 0 6.27 0 14c0 9.5 14 20 14 20s14-10.5 14-20C28 6.27 21.73 0 14 0z"
                    fill="#1a1a1a"
                  />
                  <circle cx="14" cy="13" r="5" fill="#FFE8D6" />
                </svg>
              </div>

              {/* Dashed line left side */}
              <div className="flex-1 relative h-10 mx-1">
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                  <path
                    d="M0,20 C 25,5 50,35 75,20 C 87,13 94,27 100,20"
                    stroke="#1a1a1a"
                    strokeWidth="2.5"
                    strokeDasharray="5 5"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* QR circle */}
              <div className="flex-shrink-0 relative z-10 bg-white rounded-full p-2.5 sm:p-3 shadow-xl">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://bobros.app"
                  alt="QR code"
                  className="w-20 h-20 sm:w-24 sm:h-24"
                />
              </div>

              {/* Dashed line right side */}
              <div className="flex-1 relative h-10 mx-1">
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                  <path
                    d="M0,20 C 6,13 13,27 25,20 C 50,5 75,35 100,20"
                    stroke="#1a1a1a"
                    strokeWidth="2.5"
                    strokeDasharray="5 5"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Right orange download pin */}
              <div
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md"
                style={{ backgroundColor: BRAND }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 4v12m0 0l-5-5m5 5l5-5M4 20h16"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </motion.div>

            {/* Store buttons — using image assets */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.25, ease: easeOutExpo }}
              className="flex flex-wrap gap-3 items-center"
            >
              <a
                href="https://play.google.com/store/apps/details?id=app.bobrosone.android"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-[1.03] transition-transform"
              >
                <img
                  src="/assets/google_play2.png"
                  alt="Get it on Google Play"
                  className="h-[52px] sm:h-[60px] w-auto object-contain"
                />
              </a>
              <a
                href="https://apps.apple.com/in/app/bobros/id6504723845"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-[1.03] transition-transform"
              >
                <img
                  src="/assets/App-Store.png"
                  alt="Download on App Store"
                  className="h-[52px] sm:h-[60px] w-auto object-contain"
                />
              </a>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}