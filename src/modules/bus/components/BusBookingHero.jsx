import BookingForm from "./BookingForm";

export default function BusBookingHero() {
  return (
    <section className="relative min-h-[750px] flex items-center justify-center">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/assets/hero-bg.jpg" // 🔥 Replace with your sunset road image
          alt="Travel Background"
          className="w-full h-full object-cover"
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pt-32">
        {/* Heading */}
        <div className="text-center text-white mb-12">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
            Your Journey, Our Priority
          </h1>
          <p className="text-lg md:text-xl text-white/80">
            Book buses, flights, hotels & more at the best prices
          </p>
        </div>

        {/* Booking Form */}
        <BookingForm />
      </div>
    </section>
  );
}
