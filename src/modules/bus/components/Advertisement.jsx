export default function Advertisement() {
  return (
    <div className="w-full h-[150px] flex justify-center my-10 px-4">
      <div className="relative w-full max-w-5xl aspect-[10/3] rounded-2xl overflow-hidden shadow-lg">
        {/* Background Image */}
        <img
          src="/assets/Advertisement_image.jpeg"
          alt="Advertisement"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Soft overlay for readability */}
        <div className="absolute inset-0 bg-black/40"></div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col md:flex-row items-center justify-between px-8 py-6 text-white">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider mb-2 text-[#FD561E]">
              New User Offer
            </p>

            <h3 className="text-2xl md:text-3xl font-bold">
              Get{" "}
              <span className="bg-gradient-to-r from-[#FD561E] to-[#ff8a5c] bg-clip-text text-transparent">
                10% OFF
              </span>{" "}
              on your first booking!
            </h3>

            <p className="text-lg mt-1 opacity-90">
              Use promocode{" "}
              <span className=" font-bold text-[#FD561E]">JOINBOBROS</span> at
              checkout
            </p>
          </div>

          <button className="mt-4 md:mt-0 bg-[#FD561E] text-white font-semibold px-8 py-3 rounded-xl shadow hover:scale-105 transition-all duration-300">
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}
