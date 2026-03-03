import { useState, useEffect, useRef } from "react";
import {
  ArrowLeftRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useLocation, useSearchParams, useNavigate } from "react-router-dom";
import { fetchCities } from "../services/apiService"; // API

const SearchBar = () => {
  const location = useLocation();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [fromCity, setFromCity] = useState(null);
  const [toCity, setToCity] = useState(null);

  const [fromResults, setFromResults] = useState([]);
  const [toResults, setToResults] = useState([]);

  const [showFromResults, setShowFromResults] = useState(false);
  const [showToResults, setShowToResults] = useState(false);

  const [fromError, setFromError] = useState("");
  const [toError, setToError] = useState("");

  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(today);
  const [currentDate, setCurrentDate] = useState(today);

  const calendarRef = useRef(null);
  const fromRef = useRef(null);
  const toRef = useRef(null);

  useEffect(() => {
    const state = location.state || {};

    if (state.sourceName) setFrom(state.sourceName);
    if (state.destinationName) setTo(state.destinationName);

    let date = null;

    if (state.date) {
      date = new Date(state.date);
    } else {
      const dojParam = params.get("doj");
      if (dojParam) date = new Date(dojParam);
    }

    if (date && !isNaN(date.getTime())) {
      setSelectedDate(date);
      setCurrentDate(date);
    }
  }, [location.state, params]);

  // SEARCH CITIES API
  const handleCitySearch = async (value, type) => {
    if (value.length < 2) return;

    try {
      const data = await fetchCities(value);

      if (type === "from") {
        setFromResults(data || []);
        setShowFromResults(true);
      } else {
        setToResults(data || []);
        setShowToResults(true);
      }
    } catch (err) {
      console.error("City search error", err);
    }
  };

  const handleSwap = () => {
    setFrom(to);
    setTo(from);

    const tempCity = fromCity;
    setFromCity(toCity);
    setToCity(tempCity);
  };

  const handleDateSelect = (day) => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day,
    );

    if (date >= today) {
      setSelectedDate(date);
      setShowCalendar(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("en-GB");
  };

  const handleSearch = () => {
    setFromError("");
    setToError("");

    if (!fromCity) {
      setFromError("Please select the departure city");
      return;
    }

    if (!toCity) {
      setToError("Please select the destination city");
      return;
    }

    if (fromCity.sid === toCity.sid) {
      setToError("Departure and Destination cannot be the same");
      return;
    }

    const formattedDate = selectedDate.toISOString().split("T")[0];

    navigate(
      `/results?source=${fromCity.sid}&destination=${toCity.sid}&doj=${formattedDate}`,
      {
        replace: true,
        state: {
          sourceName: fromCity.cityname,
          destinationName: toCity.cityname,
          date: formattedDate,
        },
      },
    );
  };

  // CALENDAR
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  ).getDate();

  const firstDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  ).getDay();

  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const year = currentDate.getFullYear();

  const isPastDate = (day) => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day,
    );
    return date < today;
  };

  // CLOSE CALENDAR
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setShowCalendar(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full bg-[#f36b32] py-6 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* FROM */}
          <div className="md:col-span-3 relative">
            <p className="text-white text-xs font-semibold mb-1">FROM</p>

            <input
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                setFromCity(null);
                handleCitySearch(e.target.value, "from");
              }}
              className="w-full h-12 px-4 rounded-md bg-white font-semibold text-gray-800 outline-none shadow-sm"
            />

            {fromError && (
              <p className="text-red-200 text-xs mt-1">{fromError}</p>
            )}

            {showFromResults && fromResults.length > 0 && (
              <div className="absolute top-14 left-0 w-full bg-white shadow-lg rounded-md z-50 max-h-60 overflow-y-auto">
                {fromResults.map((city) => (
                  <div
                    key={city.sid}
                    onClick={() => {
                      setFrom(city.cityname);
                      setFromCity(city);
                      setShowFromResults(false);
                    }}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  >
                    {city.cityname}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SWAP */}
          <div className="md:col-span-1 flex justify-center">
            <button
              onClick={handleSwap}
              className="bg-white w-10 h-10 rounded-full flex items-center justify-center shadow hover:scale-110 transition"
            >
              <ArrowLeftRight className="w-4 h-4 text-[#f36b32]" />
            </button>
          </div>

          {/* TO */}
          <div className="md:col-span-3 relative">
            <p className="text-white text-xs font-semibold mb-1">TO</p>

            <input
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                setToCity(null);
                handleCitySearch(e.target.value, "to");
              }}
              className="w-full h-12 px-4 rounded-md bg-white font-semibold text-gray-800 outline-none shadow-sm"
            />

            {toError && <p className="text-red-200 text-xs mt-1">{toError}</p>}

            {showToResults && toResults.length > 0 && (
              <div className="absolute top-14 left-0 w-full bg-white shadow-lg rounded-md z-50 max-h-60 overflow-y-auto">
                {toResults.map((city) => (
                  <div
                    key={city.sid}
                    onClick={() => {
                      setTo(city.cityname);
                      setToCity(city);
                      setShowToResults(false);
                    }}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  >
                    {city.cityname}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* DATE */}
          <div className="md:col-span-2 relative">
            <p className="text-white text-xs font-semibold mb-1">
              DEPARTURE DATE
            </p>

            <div
              onClick={() => setShowCalendar(!showCalendar)}
              className="flex items-center gap-3 px-4 h-12 rounded-md bg-white cursor-pointer shadow-sm"
            >
              <Calendar className="w-5 h-5 text-gray-400" />
              <span className="font-semibold text-gray-800">
                {formatDate(selectedDate)}
              </span>
            </div>

            {showCalendar && (
              <div
                ref={calendarRef}
                className="absolute top-14 left-0 bg-white rounded-2xl shadow-xl p-4 z-50 w-[300px]"
              >
                <div className="flex justify-between items-center mb-2">
                  <button
                    onClick={() =>
                      setCurrentDate(
                        new Date(year, currentDate.getMonth() - 1, 1),
                      )
                    }
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>

                  <span className="font-semibold">
                    {monthName} {year}
                  </span>

                  <button
                    onClick={() =>
                      setCurrentDate(
                        new Date(year, currentDate.getMonth() + 1, 1),
                      )
                    }
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                <div className="grid grid-cols-7 text-center text-sm text-gray-500 mb-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (d) => (
                      <div key={d}>{d}</div>
                    ),
                  )}
                </div>

                <div className="grid grid-cols-7 gap-1 text-center">
                  {[...Array(firstDay)].map((_, i) => (
                    <div key={i}></div>
                  ))}

                  {[...Array(daysInMonth)].map((_, idx) => {
                    const day = idx + 1;
                    const selected =
                      selectedDate.getDate() === day &&
                      selectedDate.getMonth() === currentDate.getMonth();

                    const disabled = isPastDate(day);

                    return (
                      <button
                        key={day}
                        onClick={() => !disabled && handleDateSelect(day)}
                        disabled={disabled}
                        className={`p-2 rounded-lg text-sm transition
                        ${selected ? "bg-[#FD561E] text-white" : ""}
                        ${
                          disabled
                            ? "text-gray-300 cursor-not-allowed"
                            : "hover:bg-orange-100"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* SEARCH */}
          <div className="md:col-span-3 flex items-end">
            <button
              onClick={handleSearch}
              className="w-full h-12 bg-white text-black font-bold rounded-md shadow 
  cursor-pointer 
  transition-all duration-300
  
  hover:text-[#fd561e]"
            >
              UPDATE SEARCH
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
