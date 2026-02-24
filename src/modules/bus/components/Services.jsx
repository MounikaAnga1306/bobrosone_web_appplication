// import React from "react";

// const services = [
//   {
//     title: "IT Services",
//     desc: "Reliable IT services to support and enhance your business operations. For more information, visit any of our branch or contact our Business Analyst",
//     img: "/assets/ItService.png",
//     // highlight: true, // first card highlighted like screenshot
//   },
//   {
//     title: "Bus Ticketing",
//     desc: "Convenient and affordable online bus ticket booking through our website and BOBROS mobile App (Get it on Google Play Store)",
//     img: "/assets/busticket.jpg",
//   },
//   {
//     title: "Flight Ticketing",
//     desc: "Quick and hassle-free flight bookings (off-line) for domestic and international travel. For bookings, visit any of our branch or contact us",
//     img: "/assets/flightticket.png",
//   },
//   {
//     title: "Holiday Packages",
//     desc: "Curated holiday packages to explore the best travel destinations. To know more about our packages and for bookings, visit any of our branch or contact us",
//     img: "/assets/Holidaypackage.jpg",
//   },
//   {
//     title: "Hotel Booking",
//     desc: "Book comfortable stays at top hotels with ease and flexibility. For bookings, visit any of our branch or contact us",
//     img: "/assets/hotel.jpg",
//   },
//   {
//     title: "Cab Rent",
//     desc: "Affordable and convenient cab rentals for your personal travel or Business Commute. For bookings, visit any of our branch or contact us",
//     img: "/assets/cabrent.jpg",
//   },
// ];

// const Services = () => {
//   return (
//     <div className="w-full pt-0 pb-20 bg-white -mt-14">
//       <h2 className="text-4xl font-semibold text-[#fd561e] text-center mb-24">
//         What We Do
//       </h2>

//       <div className="max-w-8xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-20 px-6">
//         {services.map((item, index) => (
//           <div
//             key={index}
//             className={`group relative rounded-2xl p-0 text-center shadow-[0_0_25px_rgba(0,0,0,0.15)] transition-all duration-300 pt-14
//   ${
//     item.highlight
//       ? "bg-indigo-600 text-white"
//       : "bg-white hover:bg-[rgb(253,86,30)] hover:text-white hover:shadow-none"
//   }`}
//           >
//             <div className="flex flex-col items-center text-center relative">
//               {/* Image - move up only */}
//               <div className="absolute -top-24 left-1/2 -translate-x-1/2">
//                 <img
//                   src={item.img}
//                   alt={item.title}
//                   className="w-20 h-21 object-contain   shadow-md"
//                 />
//               </div>

//               {/* Add space for image */}
//               <div className="pt-1">
//                 <h3 className="text-2xl font-medium mb-3 group-hover:text-white">
//                   {item.title}
//                 </h3>

//                 <p className="text-[15px] leading-relaxed max-w-[320px] group-hover:text-white">
//                   {item.desc}
//                 </p>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default Services;
import { motion } from "framer-motion";

// ✅ Your local images (unchanged)
import flights from "../../../assets/flights.jpg";
import bus from "../../../assets/bus.jpg";
import hotels from "../../../assets/hotels.jpg";
import holiday from "../../../assets/holiday.jpg";
import cab from "../../../assets/cab.jpg";
import bill from "../../../assets/bill.png";

// ✅ Image hover animation (NO looping now)
const imageHover = {
  rest: { y: 0, scale: 1 },
  hover: {
    y: -6,
    scale: 1.12,
    transition: { type: "spring", stiffness: 260, damping: 16 },
  },
};

// ✅ Card hover animation (clean lift)
const cardHover = {
  rest: { y: 0, boxShadow: "0 10px 20px rgba(0,0,0,0.08)" },
  hover: {
    y: -10,
    boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
    transition: { type: "spring", stiffness: 160, damping: 16 },
  },
};

// Service Card
function ServiceCard({ image, title, description, contain }) {
  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      animate="rest"
      variants={cardHover}
      className="
        relative bg-white rounded-2xl
        px-6 pb-8 pt-24
        flex flex-col items-center text-center
        mt-16
      "
    >
      {/* ✅ PERFECT CENTERED IMAGE */}
      <motion.div
        variants={imageHover}
        className="
          absolute -top-16 left-[26%] -translate-x-1/2
          w-40 h-28
          rounded-xl overflow-hidden
          border-[6px] border-white
          shadow-xl bg-white
          flex items-center justify-center
        "
      >
        <img
          src={image}
          alt={title}
          className={`w-full h-full ${contain ? "object-contain p-2" : "object-cover"}`}
        />
      </motion.div>

      <h3 className="text-lg font-bold mb-2 text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed max-w-xs">
        {description}
      </p>
    </motion.div>
  );
}

// Main Page
export default function Service() {
  const services = [
    {
      image: flights,
      title: "Flights",
      description:
        "Reliable IT services to support and enhance your business operations. Visit any branch or contact our analyst.",
    },
    {
      image: bus,
      title: "Bus Ticketing",
      description:
        "Convenient and affordable bus ticket booking via website and mobile app.",
    },
    {
      image: hotels,
      title: "Hotels",
      description:
        "Book comfortable stays at top hotels with ease and flexibility.",
    },
    {
      image: holiday,
      title: "Holiday Package",
      description: "Curated travel packages to explore the best destinations.",
    },
    {
      image: cab,
      title: "Cab Service",
      description:
        "Affordable cab rentals for personal travel or business commute.",
    },
    {
      image: bill,
      title: "Bill Payment",
      description: "Safe, fast, and convenient payments across all services.",
      contain: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-16 text-orange-500">
          Our Services
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-20 max-w-5xl mx-auto">
          {services.map((service, index) => (
            <ServiceCard key={index} {...service} />
          ))}
        </div>
      </div>
    </div>
  );
}
