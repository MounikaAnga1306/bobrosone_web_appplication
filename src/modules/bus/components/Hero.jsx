import React, { useRef, useState } from "react";
import HeroCarousel from "./HeroCarousel";
import CityAutoCompleteField from "./CityAutoCompleteField";

const Hero = () => {
  const dateRef = useRef(null);

  // ✅ Store full city object (you can use it anywhere)
  const [fromCity, setFromCity] = useState(null);
  const [toCity, setToCity] = useState(null);
  const [travelDate, setTravelDate] = useState("");

  const handleSearch = () => {
    if (!fromCity) {
      alert("Please select From City");
      return;
    }

    if (!toCity) {
      alert("Please select To City");
      return;
    }

    if (!travelDate) {
      alert("Please select Date");
      return;
    }

    // ✅ You can use response anywhere now
    console.log("FROM CITY OBJECT:", fromCity);
    console.log("TO CITY OBJECT:", toCity);
    console.log("DATE:", travelDate);

    // Example values you can use:
    console.log("From SID:", fromCity.sid);
    console.log("To SID:", toCity.sid);

    // Here you can call your bus search API using fromCity.sid, toCity.sid, travelDate
  };

  return (
    <div className="min-h-screen bg-white-100">
      <div className="max-w-[1450px] mx-auto flex gap-0 pt-20 px-14">
        
        {/* LEFT SIDE FORM */}
        <div className="flex justify-start items-start w-[430px]">
          <div className="w-full h-[430px] max-w-md bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
            
            <div className="bg-[#fd561e] text-white text-center py-3 text-xl font-semibold">
              Bus Tickets
            </div>

            <div className="p-6 space-y-4">

              {/* FROM */}
              <CityAutoCompleteField
                label="From:"
                placeholder="Enter origin"
                onCitySelected={(city) => setFromCity(city)}
              />

              {/* TO */}
              <CityAutoCompleteField
                label="To:"
                placeholder="Enter destination"
                onCitySelected={(city) => setToCity(city)}
              />

              {/* DATE */}
              <div>
                <label className="block mb-1 font-medium">Date:</label>
                <input
                  ref={dateRef}
                  type="date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  onClick={() =>
                    dateRef.current && dateRef.current.showPicker()
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#fd561e] cursor-pointer"
                />
              </div>

              {/* SEARCH BUTTON */}
              <button
                onClick={handleSearch}
                className="w-full bg-[#fd561e] text-white py-2 rounded-md font-semibold hover:bg-blue-900 transition"
              >
                Search for Bus
              </button>

            </div>
          </div>
        </div>

        {/* RIGHT SIDE CAROUSEL */}
        <HeroCarousel />
      </div>
    </div>
  );
};

export default Hero;
