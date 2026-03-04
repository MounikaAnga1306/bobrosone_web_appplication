// src/modules/flights/components/DoMoreWithBobros.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { FaPlane } from "react-icons/fa";

const DoMoreWithBobros = () => {
  const navigate = useNavigate();

  const items = [
    "Flight Tracker",
    "PNR Search",
    "Cruise",
    "Book Visa",
    "Group Booking",
    "Plan",
    "Fare Alerts",
  ];

  const handleItemClick = (item) => {
    switch(item) {
      case "Flight Tracker":
        navigate("/flights/tracker");
        break;
      case "PNR Search":
        navigate("/flights/pnr-search");
        break;
      case "Cruise":
        navigate("/cruise");
        break;
      case "Book Visa":
        navigate("/visa");
        break;
      case "Group Booking":
        navigate("/group-booking");
        break;
      case "Plan":
        navigate("/plan");
        break;
      case "Fare Alerts":
        navigate("/fare-alerts");
        break;
      default:
        break;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8 mt-16">
      <h2 className="text-xl font-bold text-gray-800 mb-6">
        Do More With BOBROS
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-lg transition-all duration-200 cursor-pointer group"
            onClick={() => handleItemClick(item)}
          >
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-orange-50 group-hover:text-[#FD561E] transition-all">
              <FaPlane className="text-gray-600 group-hover:text-[#FD561E]" />
            </div>
            <span className="text-sm font-medium text-gray-700 text-center group-hover:text-[#FD561E]">
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoMoreWithBobros;