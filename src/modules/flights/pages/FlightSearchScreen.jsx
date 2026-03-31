// src/modules/flights/pages/FlightSearchScreen.jsx
import React from "react";
import FlightHeroSection from "../components/FlightHeroSection";
import Services from "../../bus/components/OurServices";
import WhyBobros from "../../bus/components/WhyBobros";
import AppDownload from "../../bus/components/AppDownload";
import PopularFlightRoutes from "../components/PopularFlightRoutes";
import Quick_Links from "../../bus/components/Quick_Links";
import FlightFAQ from "../components/FlightFAQ";
import Advertisement from "../../bus/components/Advertisement";

const FlightSearchScreen = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        {/* Flight Hero Section - FULL WIDTH */}
        <FlightHeroSection />

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

          {/* Popular Flight Routes */}
          <div className="mt-16">
            <PopularFlightRoutes />
          </div>

          {/* Why Bobros */}
          <div className="mt-16">
            <WhyBobros />
          </div>

          {/* Quick Links */}
          <div className="mt-16">
            <Quick_Links />
          </div>

          {/* Flight FAQ */}
          <div className="mt-16">
            <FlightFAQ />
          </div>
        </div>
      </main>
    </div>
  );
};

export default FlightSearchScreen;