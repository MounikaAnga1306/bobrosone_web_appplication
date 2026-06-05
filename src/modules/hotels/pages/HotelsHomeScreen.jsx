import React from "react";
import { Helmet } from "react-helmet-async";
import HotelHeroSection from "../components/HotelHeroSection";
import Services from "../../bus/components/OurServices";
import WhyBobros from "../../bus/components/WhyBobros";
import AppDownload from "../../bus/components/AppDownload";
import Quick_Links from "../../bus/components/Quick_Links";

const HotelsHomeScreen = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>BOBROS - Hotel Booking</title>
        <meta name="description" content="Find and book best hotels at lowest prices with BOBROS." />
        <meta name="keywords" content="hotel booking, cheap hotels, BOBROS hotels, online hotel reservation" />
      </Helmet>

      <main className="flex-grow">
        <HotelHeroSection />
        <div className="md:mt-10 lg:mt-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8"></div>
          <div className="sm:-mt-10">
            {/* <Services /> */}
          </div>
          {/* <AppDownload /> */}
          {/* <WhyBobros /> */}
          <Quick_Links />
        </div>
      </main>
    </div>
  );
};

export default HotelsHomeScreen;