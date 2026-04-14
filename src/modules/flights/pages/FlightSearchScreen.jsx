// src/modules/flights/pages/FlightSearchScreen.jsx
import React from "react";
import FlightHeroSection from "../components/FlightHeroSection";
import Services from "../../bus/components/OurServices";
import WhyBobros from "../../bus/components/WhyBobros";
import AppDownload from "../../bus/components/AppDownload";
import PopularFlightRoutes from "../components/PopularFlightRoutes";
import Quick_Links from "../../bus/components/Quick_Links";
import FlightFAQ from "../components/FlightFAQ";
import FlightAdvertisement from "../../flights/components/sheet/FlightAdvertisement";

const FlightSearchScreen = () => {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden w-full max-w-full">
      <main className="flex-grow w-full max-w-full overflow-x-hidden">
        {/* Flight Hero Section - FULL WIDTH */}
        <FlightHeroSection />

        {/* Advertisement - Added spacing from hero section */}
        <div className="container mx-auto px-3 sm:px-4 md:px-5 lg:px-6 xl:px-8 mt-4 sm:mt-6 md:mt-24 lg:mt-24">
          <FlightAdvertisement />
        </div>

        {/* Content Sections with consistent spacing */}
        <div className="mt-8 sm:mt-12 md:mt-16 lg:mt-20 xl:mt-24">
          {/* Services */}
          <div className="mt-8 sm:mt-10 md:mt-12 lg:mt-16">
            <Services />
          </div>

          {/* App Download */}
          <div className="mt-8 sm:mt-10 md:mt-12 lg:mt-16">
            <AppDownload />
          </div>

          {/* Popular Flight Routes */}
          <div className="mt-8 sm:mt-10 md:mt-12 lg:mt-16">
            <PopularFlightRoutes />
          </div>

          {/* Why Bobros */}
          <div className="mt-8 sm:mt-10 md:mt-12 lg:mt-16">
            <WhyBobros />
          </div>

          {/* Quick Links */}
          <div className="mt-8 sm:mt-10 md:mt-12 lg:mt-16">
            <Quick_Links />
          </div>

          {/* Flight FAQ */}
          <div className="mt-8 sm:mt-10 md:mt-12 lg:mt-16">
            <FlightFAQ />
          </div>
        </div>
      </main>
    </div>
  );
};

export default FlightSearchScreen;