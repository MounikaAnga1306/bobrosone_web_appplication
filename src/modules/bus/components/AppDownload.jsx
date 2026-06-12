import { motion } from "framer-motion";

const BRAND = "#FD561E";
const easeOutExpo = [0.22, 1, 0.36, 1];

export default function AppDownload() {
  return (
    <section className="w-full py-8 sm:py-10 md:py-12 px-3 sm:px-4 md:px-6">
      {/* max-w-7xl => match the width of the section below it (e.g. Popular Bus Routes).
         If that section uses a different container width, set the same value here. */}
      <div className="relative max-w-7xl mx-auto bg-slate-50 rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col lg:flex-row items-stretch">
        {/* soft brand glow */}
        <div
          className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full blur-3xl opacity-25"
          style={{ backgroundColor: `${BRAND}40` }}
        />

        {/* ───────── LEFT — phone, cropped higher (shows less) ───────── */}
        <div className="relative lg:w-[40%] flex justify-center items-start overflow-hidden px-4 pt-7 sm:pt-8">
          <motion.div
            initial={{ opacity: 0, y: 150 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.9, ease: easeOutExpo }}
            /* bigger negative margin = crops higher / shows less of the phone.
               increase it to cut higher, decrease to reveal more */
            className="relative w-[260px] sm:w-[285px] md:w-[300px] mb-[-330px] sm:mb-[-370px] md:mb-[-400px]"
          >
            <motion.div
              animate={{ y: [0, -7, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              {/* glow under phone */}
              <div
                className="pointer-events-none absolute inset-x-6 bottom-6 top-24 rounded-[60px] blur-3xl opacity-40"
                style={{ backgroundColor: `${BRAND}40` }}
              />

              {/* side buttons */}
              <div className="absolute -left-[3px] top-[100px] h-7 w-[3px] rounded-l-md bg-slate-700" />
              <div className="absolute -left-[3px] top-[142px] h-12 w-[3px] rounded-l-md bg-slate-700" />
              <div className="absolute -left-[3px] top-[202px] h-12 w-[3px] rounded-l-md bg-slate-700" />
              <div className="absolute -right-[3px] top-[166px] h-20 w-[3px] rounded-r-md bg-slate-700" />

              {/* frame */}
              <div className="relative rounded-[46px] bg-slate-900 p-[9px] shadow-[0_30px_60px_-20px_rgba(15,23,42,0.5)] ring-1 ring-slate-800">
                <div className="relative h-[560px] sm:h-[620px] md:h-[680px] w-full overflow-hidden rounded-[38px] bg-white">
                  {/* dynamic island */}
                  <div className="relative z-20 flex h-9 items-center justify-center bg-white">
                    <div className="h-[26px] w-[92px] rounded-full bg-slate-900" />
                  </div>

                  {/* app screen */}
                  <div className="relative h-[calc(100%-2.25rem)] w-full overflow-hidden">
                    <img
                      src="/assets/Mobile_View.png"
                      alt="Bobros app preview"
                      className="absolute inset-0 h-full w-full object-contain object-top"
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
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* ───────── RIGHT — heading (from top) + scanner & equal buttons ───────── */}
        <div className="relative lg:w-[60%] flex flex-col justify-center px-6 sm:px-8 md:px-12 py-8 lg:py-10 text-center lg:text-left">
          {/* eyebrow — from the top */}
          <motion.p
            initial={{ opacity: 0, y: -30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="text-slate-800 text-sm sm:text-base font-medium tracking-[0.18em] uppercase"
          >
            Try on Mobile
          </motion.p>

          {/* heading — from the top (smaller => shorter card) */}
          <motion.h2
            initial={{ opacity: 0, y: -40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-semibold leading-[1.12] text-slate-900"
          >
            Download our app for{" "}
            <span className="bg-gradient-to-r from-[#FD561E] to-[#ff8a5c] bg-clip-text text-transparent">
              unbeatable perks!
            </span>
          </motion.h2>

          {/* scanner (from bottom) + store buttons (from right) */}
          <div className="mt-6 sm:mt-7 flex items-center justify-center lg:justify-start gap-5 sm:gap-7">
            {/* QR — from the bottom */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
              whileHover={{ scale: 1.05 }}
              className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-white p-2.5 rounded-2xl shadow-md border border-gray-100 flex items-center justify-center flex-shrink-0"
            >
              <img
                src="/assets/qrcode_final.png"
                alt="Scan to download the Bobros app"
                className="w-full h-full object-contain cursor-pointer"
              />
            </motion.div>

            {/* store buttons — from the right.
               App-Store.png has extra padding baked in, so its width is set larger
               than Google Play's so the two badges READ as the same size.
               Tweak only the App Store widths (or both) until they look equal. */}
            <div className="flex flex-col gap-2 sm:gap-3 items-start">
              <motion.a
                href="https://play.google.com/store/apps/details?id=app.bobrosone.android"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: 60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.55, delay: 0.5, ease: "easeOut" }}
                whileHover={{ y: -2, scale: 1.04 }}
                className="cursor-pointer"
              >
                <img
                  src="/assets/google_play2.png"
                  alt="Get it on Google Play"
                  className="w-40 sm:w-44 md:w-46 h-auto object-contain"
                />
              </motion.a>

              <motion.a
                href="https://apps.apple.com/in/app/bobros/id6504723845"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: 60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.55, delay: 0.62, ease: "easeOut" }}
                whileHover={{ y: -2, scale: 1.04 }}
                className="cursor-pointer"
              >
                <img
                  src="/assets/App-Store.png"
                  alt="Download on App Store"
                  className="w-52 sm:w-60 md:w-70 h-auto object-contain -ml-8"
                />
              </motion.a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}