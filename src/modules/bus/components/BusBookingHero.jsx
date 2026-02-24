import BookingForm from "./BookingForm";
export default function HeroSection() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(https://images.unsplash.com/photo-1749961347714-7d1bbb4b30b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaWdod2F5JTIwcm9hZCUyMHN1bnNldCUyMHRyYXZlbHxlbnwxfHx8fDE3NzE4MzQ1Mjd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral)`,
        }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
      <div className="relative z-10 max-w-6xl mx-auto pt-32 px-8">
        <BookingForm />
      </div>
    </div>
  );
}
