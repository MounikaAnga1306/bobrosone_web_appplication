import { motion } from "framer-motion";

export default function AppDownload() {
  return (
    <section className="w-full py-16 px-6">
      <div className="max-w-[85%] mx-auto bg-white rounded-3xl p-10 flex flex-col lg:flex-row items-center gap-12">
        {/* LEFT — REAL MOBILE MOCKUP */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full lg:w-1/2 flex justify-center"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            {/* PHONE FRAME */}
            <div className="w-[290px] h-[575px] bg-[#f8f8f8] rounded-[48px] border-3 border-black-200 shadow-lg p-[3px]">
              {" "}
              {/* NOTCH */}
              <div className="absolute top-[2px] left-1/2 -translate-x-1/2 w-[120px] h-[26px] bg-black rounded-b-2xl z-20" />
              {/* SCREEN */}
              <div className="w-full h-full bg-white rounded-[36px] overflow-hidden relative">
                {/* STATUS BAR MOCK */}
                <div className="h-6 bg-white flex items-center justify-between px-4 text-xs font-semibold">
                  <div className="flex gap-1"></div>
                </div>

                {/* APP SCREEN IMAGE */}
                <img
                  src="/assets/Mobile_View.png"
                  alt="App preview"
                  className="w-full h-[calc(100%-32px)] object-cover"
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
          className="w-full lg:w-1/2"
        >
          <p className="text-gray-500 text-lg mb-2">Try on Mobile</p>

          <h2 className="text-4xl lg:text-5xl font-bold leading-tight mb-8">
            Download our app for unbeatable perks!
          </h2>

          <div className="flex items-center gap-6 flex-wrap mt-5">
            {/* QR */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-44 h-44 bg-white p-4 rounded-3xl shadow-2xl border border-gray-100 flex items-center justify-center"
            >
              <img
                src="/assets/QR_code.png"
                alt="Scan to download app"
                className="w-full h-full object-contain"
              />
            </motion.div>

            <div className="flex flex-col items-start">
              {/* GOOGLE PLAY */}
              <motion.div
                whileHover={{ y: -2, scale: 1.04 }}
                className="cursor-pointer"
              >
                <img
                  src="/assets/google_play2.png"
                  alt="Get it on Google Play"
                  className="w-44"
                />
              </motion.div>

              {/* APP STORE */}
              <motion.div
                whileHover={{ y: -2, scale: 1.04 }}
                className="cursor-pointer"
              >
                <img
                  src="/assets/App-Store.png"
                  alt="Download on App Store"
                  className="w-66 -ml-7 mt-2 object-contain"
                />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
