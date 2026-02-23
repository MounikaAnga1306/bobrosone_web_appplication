import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import oauthApi from "../../../globalfiles/oauthApiClient";



const CityAutoCompleteField = ({
  label,
  placeholder,
  onCitySelected,
  inputClassName = "",
}) => {
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  // ✅ API Call Function
  const fetchCities = async (query) => {
  try {
    const res = await oauthApi.get(
      `https://api.bobros.co.in/cities?name=${query}`
    );

    return res.data;
  } catch (error) {
    console.error("City API Error:", error);
    return [];
  }
};


  // ✅ Input Change Handler with Debounce
  const handleChange = (e) => {
    const text = e.target.value;
    setValue(text);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      if (text.length >= 2) {
        const results = await fetchCities(text);
        setSuggestions(results);
        setShowDropdown(true);
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    }, 300);
  };

  // ✅ Close dropdown when clicked outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // ✅ When user selects a city
  const handleSelectCity = (city) => {
    setValue(city.cityname); // showing cityname in input
    setShowDropdown(false);

    // send full city object to parent
    onCitySelected(city);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      {label && (
        <label className="block text-gray-700 mb-1 font-medium">{label}</label>
      )}

      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
        className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#fd561e] ${inputClassName}`}
      />

      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-md shadow-md mt-1 max-h-48 overflow-y-auto">
          {suggestions.map((city) => (
            <div
              key={city.sid}
              onClick={() => handleSelectCity(city)}
              className="px-3 py-2 cursor-pointer hover:bg-gray-100"
            >
              {city.cityname}
              <span className="text-sm text-gray-500 ml-2">
                ({city.state})
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CityAutoCompleteField;
