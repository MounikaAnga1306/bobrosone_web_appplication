import Services from "../../bus/components/OurServices";
import WhyBobros from "../../bus/components/WhyBobros";
import AppDownload from "../../bus/components/AppDownload";
import PopularBusRoutes from "../../bus/components/PopularBusRoutes";
import Quick_Links from "../../bus/components/Quick_Links";
import BusFAQ from "../../bus/components/BusFAQ";
import BookingForm from "../../bus/components/BookingForm";
import Advertisement from "../../bus/components/Advertisement";
//import Navbar from "../../../globalfiles/Navbar";

function BillHomeScreen() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Main Content */}
      {/* <Navbar /> */}
      <main className="flex-grow">
        {/* Bus Booking Hero Section - NO CONTAINER, FULL WIDTH */}
        <BookingForm />

        {/* Your existing page content - these can stay in containers */}
        {/* <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Advertisement />
        </div> */}

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

export default BillHomeScreen;
