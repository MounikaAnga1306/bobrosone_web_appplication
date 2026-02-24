import Hero from "../components/Hero";
import Services from "../components/Services";
import WhyBobros from "../components/WhyBobros";
import BusBookingHero from "../components/BusBookingHero";
import AppDownload from "../components/AppDownload";

function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Main Content */}
      <main className="flex-grow">
        {/* Bus Booking Hero Section - NO CONTAINER, FULL WIDTH */}
        <BusBookingHero />

        {/* Your existing page content - these can stay in containers */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Hero />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Services />
        </div>
        <AppDownload />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <WhyBobros />
        </div>
      </main>
    </div>
  );
}

export default HomePage;
