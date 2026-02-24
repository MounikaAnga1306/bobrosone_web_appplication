// src/components/SpecialFares.jsx
import React from "react";

const SpecialFares = ({ specialFares, setSpecialFares }) => {
  const fares = [
    { id: "regular", name: "Regular", discount: "Regular fares" },
    { id: "student", name: "Student", discount: "Extra discount/baggage" },
    { id: "seniorCitizen", name: "Senior Citizen", discount: "Upto 15% off" },
    { id: "armed", name: "Armed Force", discount: "Upto 600 off" },
    { id: "doctors", name: "Doctors & Nurses", discount: "Upto 600 off" },
  ];

  const handleToggle = (fareId) => {
    setSpecialFares((prev) => ({
      ...prev,
      [fareId]: !prev[fareId],
    }));
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <h3 className="text-sm font-medium text-gray-700 mb-3">
        Special Fares (Optional):
      </h3>
      <div className="flex gap-3">
        {fares.map((fare) => (
          <button
            key={fare.id}
            onClick={() => handleToggle(fare.id)}
            className={`flex-1 flex flex-col items-center justify-center py-2 px-3 border rounded-lg transition-all duration-200 ${
              specialFares[fare.id]
                ? "bg-blue-50 border-blue-200 text-blue-800"
                : "bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300"
            }`}
          >
            <span className="font-semibold text-sm">{fare.name}</span>
            <span className="text-xs mt-0.5">{fare.discount}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SpecialFares;
