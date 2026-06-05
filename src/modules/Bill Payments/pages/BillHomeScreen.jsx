import Services from "../../bus/components/OurServices";
import WhyBobros from "../../bus/components/WhyBobros";
import AppDownload from "../../bus/components/AppDownload";
import PopularBusRoutes from "../../bus/components/PopularBusRoutes";
import Quick_Links from "../../bus/components/Quick_Links";
import BusFAQ from "../../bus/components/BusFAQ";
import BillBookingForm from "../../Bill Payments/components/Billbookingform";       // ← new form
import Advertisement from "../../bus/components/Advertisement";

function BillHomeScreen() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        {/* Bill Payments Hero Section - NO CONTAINER, FULL WIDTH */}
        <BillBookingForm />
      {/* <Advertisement /> */}

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