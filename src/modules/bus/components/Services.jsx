import React from "react";

const services = [
  {
    title: "IT Services",
    desc: "Reliable IT services to support and enhance your business operations. For more information, visit any of our branch or contact our Business Analyst",
    img: "/assets/ItService.png",
    // highlight: true, // first card highlighted like screenshot
  },
  {
    title: "Bus Ticketing",
    desc: "Convenient and affordable online bus ticket booking through our website and BOBROS mobile App (Get it on Google Play Store)",
    img: "/assets/busticket.jpg",
  },
  {
    title: "Flight Ticketing",
    desc: "Quick and hassle-free flight bookings (off-line) for domestic and international travel. For bookings, visit any of our branch or contact us",
    img: "/assets/flightticket.png",
  },
  {
    title: "Holiday Packages",
    desc: "Curated holiday packages to explore the best travel destinations. To know more about our packages and for bookings, visit any of our branch or contact us",
    img: "/assets/Holidaypackage.jpg",
  },
  {
    title: "Hotel Booking",
    desc: "Book comfortable stays at top hotels with ease and flexibility. For bookings, visit any of our branch or contact us",
    img: "/assets/hotel.jpg",
  },
  {
    title: "Cab Rent",
    desc: "Affordable and convenient cab rentals for your personal travel or Business Commute. For bookings, visit any of our branch or contact us",
    img: "/assets/cabrent.jpg",
  },
];

const Services = () => {
  return (
    <div className="w-full pt-0 pb-20 bg-white -mt-14">
      <h2 className="text-4xl font-semibold text-[#fd561e] text-center mb-24">
        What We Do
      </h2>

      <div className="max-w-8xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-20 px-6">
        {services.map((item, index) => (
          <div
            key={index}
            className={`group relative rounded-2xl p-0 text-center shadow-[0_0_25px_rgba(0,0,0,0.15)] transition-all duration-300 pt-14 
  ${
    item.highlight
      ? "bg-indigo-600 text-white"
      : "bg-white hover:bg-[rgb(253,86,30)] hover:text-white hover:shadow-none"
  }`}
          >
            <div className="flex flex-col items-center text-center relative">
              {/* Image - move up only */}
              <div className="absolute -top-24 left-1/2 -translate-x-1/2">
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-20 h-21 object-contain   shadow-md"
                />
              </div>

              {/* Add space for image */}
              <div className="pt-1">
                <h3 className="text-2xl font-medium mb-3 group-hover:text-white">
                  {item.title}
                </h3>

                <p className="text-[15px] leading-relaxed max-w-[320px] group-hover:text-white">
                  {item.desc}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Services;
