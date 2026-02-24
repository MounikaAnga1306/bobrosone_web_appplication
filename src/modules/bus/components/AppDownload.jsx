import { motion } from "framer-motion";

export default function AppDownload() {
  return (
    <section className="w-full py-16 px-6">
      <div className="max-w-6xl mx-auto bg-gray-100 rounded-3xl p-10 flex flex-col lg:flex-row items-center gap-12">
        {/* LEFT — MOBILE MOCKUP / VIDEO PLACEHOLDER */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full lg:w-1/2 flex justify-center"
        >
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-[260px] h-[480px] rounded-[32px] bg-[#e7cfc8] flex items-center justify-center shadow-xl"
          >
            {/* Replace this div with <video/> later */}
            <span className="text-gray-700 text-lg">Mobile Video</span>
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
            {/* QR / Scanner Placeholder */}
            <div className="w-36 h-28 bg-[#e7cfc8] mb-16 rounded-md flex items-center justify-center text-gray-700">
              Scanner
            </div>

            <div className="flex flex-col items-start ">
              {/* GOOGLE PLAY IMAGE */}
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

              {/* APP STORE IMAGE */}
              <motion.div
                whileHover={{ y: -2, scale: 1.04 }}
                className="cursor-pointer"
              >
                <img
                  src="/assets/App-Store.png"
                  alt="Download on App Store"
                  className="w-74  -ml-10 mb-10 object-contain"
                />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
