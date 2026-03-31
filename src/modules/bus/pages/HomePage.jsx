// src/modules/bus/pages/HomePage.jsx
import Services from "../components/OurServices";
import WhyBobros from "../components/WhyBobros";
import AppDownload from "../components/AppDownload";
import PopularBusRoutes from "../components/PopularBusRoutes";
import Quick_Links from "../components/Quick_Links";
import BusFAQ from "../components/BusFAQ";
import BookingForm from "../components/BookingForm";
import Advertisement from "../components/Advertisement";

function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        {/* Bus Booking Hero Section - FULL WIDTH */}
        <BookingForm />

        {/* Content Sections with consistent spacing */}
        <div className="mt-16 md:mt-20 lg:mt-24">
          {/* Advertisement */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Advertisement />
          </div>

          {/* Services */}
          <div className="mt-16">
            <Services />
          </div>

          {/* App Download */}
          <div className="mt-16">
            <AppDownload />
          </div>

          {/* Popular Bus Routes */}
          <div className="mt-16">
            <PopularBusRoutes />
          </div>

          {/* Why Bobros */}
          <div className="mt-16">
            <WhyBobros />
          </div>

          {/* Quick Links */}
          <div className="mt-16">
            <Quick_Links />
          </div>

          {/* Bus FAQ */}
          <div className="mt-16">
            <BusFAQ />
          </div>
        </div>
      </main>
    </div>
  );
}

export default HomePage;