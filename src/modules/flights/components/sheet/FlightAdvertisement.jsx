export default function FlightAdvertisement() {
  return (
    <div className="w-full h-[150px] flex justify-center -mt-6 sm:mt-8 md:-mt-18  px-3 sm:px-4  relative z-0">
      <div className="relative w-full max-w-6xl rounded-xl sm:rounded-2xl overflow-hidden shadow-lg">
        {/* Background Image */}
        <img
          src="/assets/Advertisement_image.jpeg"
          alt="Advertisement"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Soft overlay for readability */}
        <div className="absolute inset-0 bg-black/50"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 md:gap-6 px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 text-white">
          <div className="text-center md:text-left flex-1">
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider mt-5 text-white/90">
              New User Offer
            </p>

            <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold leading-tight">
              Get{" "}
              <span className="bg-gradient-to-r from-[#FD561E] to-[#ff8a5c] bg-clip-text text-transparent">
                10% OFF
              </span>{" "}
              on your first booking!
            </h3>

            <p className="text-[11px] sm:text-xs md:text-sm mt-1 opacity-90">
              Use promocode{" "}
              <span className="font-bold text-[#FD561E]  px-1.5 py-0.5 rounded inline-block text-[10px] sm:text-xs">
                JOINBOBROS
              </span>{" "}
              at checkout
            </p>
          </div>

          <button className="mt-2 md:mt-0 bg-[#FD561E] text-white font-semibold px-4 sm:px-5 md:px-6 py-1.5 sm:py-2 md:py-2 rounded-lg text-[11px] sm:text-xs md:text-sm shadow hover:scale-105 transition-all duration-300 whitespace-nowrap flex-shrink-0">
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}