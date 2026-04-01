import { motion } from "framer-motion";

export default function AppDownload() {
  return (
    <section className="w-full py-8 sm:py-12 md:py-16 px-3 sm:px-4 md:px-6">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 lg:p-10 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 md:gap-10">
        {/* LEFT — REAL MOBILE MOCKUP */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full lg:w-[45%] flex justify-center lg:justify-start mb-6 lg:mb-0"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            {/* PHONE FRAME - Optimized for side-by-side */}
            <div className="w-[200px] sm:w-[220px] md:w-[240px] lg:w-[260px] xl:w-[280px] h-[400px] sm:h-[440px] md:h-[480px] lg:h-[520px] xl:h-[560px] bg-[#f8f8f8] rounded-[40px] sm:rounded-[44px] md:rounded-[48px] lg:rounded-[52px] border-3 border-black-200 shadow-lg p-[3px]">
              {/* NOTCH */}
              <div className="absolute top-[2px] left-1/2 -translate-x-1/2 w-[90px] sm:w-[100px] md:w-[110px] lg:w-[120px] h-[20px] sm:h-[22px] md:h-[24px] lg:h-[26px] bg-black rounded-b-2xl z-20" />
              
              {/* SCREEN */}
              <div className="w-full h-full bg-white rounded-[34px] sm:rounded-[36px] md:rounded-[38px] lg:rounded-[40px] overflow-hidden relative">
                {/* STATUS BAR MOCK */}
                <div className="h-5 sm:h-6 md:h-7 bg-white flex items-center justify-between px-3 sm:px-4 md:px-5 text-[10px] sm:text-xs font-semibold">
                  <div className="flex gap-1"></div>
                </div>

                {/* APP SCREEN IMAGE */}
                <img
                  src="/assets/Mobile_View.png"
                  alt="App preview"
                  className="w-full h-[calc(100%-20px)] sm:h-[calc(100%-24px)] md:h-[calc(100%-28px)] object-cover object-top"
                />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* RIGHT — CONTENT */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="w-full lg:w-[55%] text-center lg:text-left"
        >
          <p className="text-[#fd561e] text-sm sm:text-base md:text-lg lg:text-xl mb-2 sm:mb-3 font-semibold">
            Try on Mobile
          </p>

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-4 sm:mb-5 md:mb-7">
            Download our app for{" "}
            <span className="bg-gradient-to-r from-[#FD561E] to-[#ff8a5c] bg-clip-text text-transparent">
              unbeatable perks!
            </span>
          </h2>

          <div className="flex flex-row items-center justify-center lg:justify-start gap-4 sm:gap-5 md:gap-6 mt-6 sm:mt-7">
            {/* QR Code */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 bg-white p-2 sm:p-2.5 md:p-3 rounded-2xl shadow-2xl border border-gray-100 flex items-center justify-center flex-shrink-0"
            >
              <img
                src="/assets/Scanner.png"
                alt="Scan to download app"
                className="w-full h-full cursor-pointer object-contain"
              />
            </motion.div>

            {/* Store Buttons */}
            <div className="flex flex-col gap-2 sm:gap-2.5 md:gap-3">
              {/* GOOGLE PLAY */}
              <motion.a
                href="https://play.google.com/store/apps/details?id=app.bobrosone.android"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -2, scale: 1.04 }}
                className="cursor-pointer"
              >
                <img
                  src="/assets/google_play2.png"
                  alt="Get it on Google Play"
                  className="w-24 ml-1 sm:w-32 md:w-36 lg:w-40 xl:w-44 h-auto"
                />
              </motion.a>

              {/* APP STORE */}
              <motion.a
                href="https://apps.apple.com/in/app/bobros/id6504723845"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -2, scale: 1.04 }}
                className="cursor-pointer"
              >
                <img
                  src="/assets/App-Store.png"
                  alt="Download on App Store"
                  className="w-36 sm:w-44 md:w-52 lg:w-60 xl:w-68 -ml-3 sm:-ml-4 md:-ml-6 mt-1 sm:mt-1.5 object-contain"
                />
              </motion.a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}