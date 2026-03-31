import { motion } from "framer-motion";

export default function AppDownload() {
  return (
    <section className="w-full py-8 sm:py-12 md:py-16 px-3 sm:px-4 md:px-6">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 lg:p-10 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 md:gap-10">
        {/* LEFT — REAL MOBILE MOCKUP */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full md:w-[42%] flex justify-center md:justify-start"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            {/* PHONE FRAME - Reduced size for mobile view */}
            <div className="w-[180px] sm:w-[200px] md:w-[220px] lg:w-[240px] xl:w-[260px] h-[360px] sm:h-[400px] md:h-[440px] lg:h-[480px] xl:h-[520px] bg-[#f8f8f8] rounded-[36px] sm:rounded-[40px] md:rounded-[44px] lg:rounded-[48px] border-3 border-black-200 shadow-lg p-[3px]">
              {/* NOTCH */}
              <div className="absolute top-[2px] left-1/2 -translate-x-1/2 w-[80px] sm:w-[90px] md:w-[100px] lg:w-[110px] h-[18px] sm:h-[20px] md:h-[22px] lg:h-[24px] bg-black rounded-b-2xl z-20" />
              
              {/* SCREEN */}
              <div className="w-full h-full bg-white rounded-[30px] sm:rounded-[32px] md:rounded-[34px] lg:rounded-[36px] overflow-hidden relative">
                {/* STATUS BAR MOCK */}
                <div className="h-4 sm:h-5 md:h-6 bg-white flex items-center justify-between px-2 sm:px-3 md:px-4 text-[8px] sm:text-[10px] md:text-xs font-semibold">
                  <div className="flex gap-1"></div>
                </div>

                {/* APP SCREEN IMAGE */}
                <img
                  src="/assets/Mobile_View.png"
                  alt="App preview"
                  className="w-full h-[calc(100%-16px)] sm:h-[calc(100%-20px)] md:h-[calc(100%-24px)] object-cover object-top"
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
          className="w-full md:w-[58%] text-center md:text-left"
        >
          <p className="text-[#fd561e] text-xs sm:text-sm md:text-base lg:text-lg mb-1 sm:mb-2 font-semibold">
            Try on Mobile
          </p>

          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight mb-3 sm:mb-4 md:mb-6">
            Download our app for{" "}
            <span className="bg-gradient-to-r from-[#FD561E] to-[#ff8a5c] bg-clip-text text-transparent whitespace-nowrap md:whitespace-normal">
              unbeatable perks!
            </span>
          </h2>

          <div className="flex flex-row items-center justify-center md:justify-start gap-3 sm:gap-4 md:gap-5 mt-4 sm:mt-5">
            {/* QR Code - Slightly smaller */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 bg-white p-1.5 sm:p-2 md:p-3 lg:p-4 rounded-2xl shadow-2xl border border-gray-100 flex items-center justify-center flex-shrink-0"
            >
              <img
                src="/assets/Scanner.png"
                alt="Scan to download app"
                className="w-full h-full object-contain"
              />
            </motion.div>

            {/* Store Buttons */}
            <div className="flex flex-col gap-1.5 sm:gap-2 md:gap-2.5">
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
                  className="w-24 sm:w-28 md:w-32 lg:w-36 xl:w-40 h-auto"
                />
              </motion.a>

              {/* APP STORE - Increased width */}
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
                  className="w-32 sm:w-40 md:w-48 lg:w-56 xl:w-64 -ml-2 sm:-ml-3 md:-ml-4 mt-0.5 sm:mt-1 object-contain"
                />
              </motion.a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}