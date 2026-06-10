// src/modules/bus/pages/HomePage.jsx
import { Helmet } from "react-helmet-async";
import Services from "../components/OurServices";
import WhyBobros from "../components/WhyBobros";
import AppDownload from "../components/AppDownload";
import PopularBusRoutes from "../components/PopularBusRoutes";
import Quick_Links from "../components/Quick_Links";
import BusFAQ from "../components/BusFAQ";
import BookingForm from "../components/BookingForm";
import Advertisement from "../components/Advertisement";
import PopularDestinations from "../components/PopularDestinations";
// import ServiceCard from "../components/ServiceCard";

function HomePage() { 
  return (
    <div className="min-h-screen flex flex-col overflow-x-clip max-w-full">
      <Helmet>
        <title>BOBROS - Bus Booking</title>
        <meta name="description" content="Book bus tickets online at best prices. Fast, easy and secure bus booking with BOBROS." />
        <meta name="keywords" content="bus booking, online bus tickets, BOBROS bus" />
      </Helmet>

      {/* min-w-0 → column-flex item viewport kంటే peరగకుండా shrink avtundi.
          overflow-x-clip → ఏ child wide aయినా clip avtundi (sticky ni break cheయదు). */}
      <main className="flex-grow min-w-0 max-w-full overflow-x-clip">
        {/* Bus Booking Hero Section - FULL WIDTH */}
        <BookingForm />

        {/* Content Sections with consistent spacing */}
        <div className="mt-16 md:mt-20 lg:mt-24">
          {/* Advertisement */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Advertisement />
          </div>

          {/* Services */}
          <div className="mt-8">
            <Services />
          </div>

           {/* Why Bobros */}
          <div className="mt-6">
            <WhyBobros />
          </div>
          
          <div className="mt-5">
            <PopularDestinations />
          </div>

         

           {/* App Download */}
          <div>
            <AppDownload />
          </div>

           {/* <div>
            <ServiceCard />
          </div> */}
           {/* Popular Bus Routes */}
          <div className="mt-14">
            <PopularBusRoutes />
          </div>

          {/* Bus FAQ */}
          <div className="mt-16">
            <BusFAQ />
          </div>

          {/* Quick Links */}
          <div className="mt-6">
            <Quick_Links />
          </div>
        </div>
      </main>
    </div>
  );
}

export default HomePage;