import Services from "../components/Services";
import WhyBobros from "../components/WhyBobros";
import AppDownload from "../components/AppDownload";
import PopularBusRoutes from "../components/PopularBusRoutes";
import Quick_Links from "../components/Quick_Links";
import BusFAQ from "../components/BusFAQ";
import BookingForm from "../components/BookingForm";
import Advertisement from "../components/Advertisement";
//import Navbar from "../../../globalfiles/Navbar";

function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Main Content */}
      {/* <Navbar /> */}
      <main className="flex-grow">
        {/* Bus Booking Hero Section - NO CONTAINER, FULL WIDTH */}
        <BookingForm />

        {/* Your existing page content - these can stay in containers */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Advertisement />
        </div>

        <Services />

        <AppDownload />
        <PopularBusRoutes />

        <WhyBobros />

        <Quick_Links />

        <BusFAQ />
      </main>
    </div>
  );
}

export default HomePage;
