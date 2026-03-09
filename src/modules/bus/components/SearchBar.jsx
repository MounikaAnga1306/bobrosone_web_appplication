import { useState, useEffect, useRef } from "react";
import {
  ArrowLeftRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useLocation, useSearchParams, useNavigate } from "react-router-dom";
import { fetchCities } from "../services/apiService";

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

  /* PREFILL WHEN COMING FROM HOME PAGE */
  useEffect(() => {
    const state = location.state || {};

    const sourceId = params.get("source");
    const destinationId = params.get("destination");

    if (state.sourceName) {
      setFrom(state.sourceName);
      setFromCity({
        sid: sourceId,
        cityname: state.sourceName,
      });
    }

    if (state.destinationName) {
      setTo(state.destinationName);
      setToCity({
        sid: destinationId,
        cityname: state.destinationName,
      });
    }

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

  /* CITY SEARCH */
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

  /* SWAP (ONLY SWAPS VALUES) */
  const handleSwap = () => {
    setFrom(to);
    setTo(from);

    setFromCity(toCity);
    setToCity(fromCity);
  };

  /* UPDATE SEARCH BUTTON */
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
      const msg = "Departure and Destination cannot be the same";
      setFromError(msg);
      setToError(msg);
      return;
    }

   const formattedDate =
  selectedDate.getFullYear() +
  "-" +
  String(selectedDate.getMonth() + 1).padStart(2, "0") +
  "-" +
  String(selectedDate.getDate()).padStart(2, "0");

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

  /* DATE SELECT */
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
    return date.toLocaleDateString("en-GB");
  };

  /* CALENDAR CALCULATION */
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

  /* CLICK OUTSIDE CLOSE */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setShowCalendar(false);
      }

      if (fromRef.current && !fromRef.current.contains(e.target)) {
        setShowFromResults(false);
      }

      if (toRef.current && !toRef.current.contains(e.target)) {
        setShowToResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full bg-[#f36b32] py-6 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
<div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_1fr_auto] gap-3 items-end">          {/* FROM */}
          <div className=" relative" ref={fromRef}>
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
              <p className="absolute text-white text-xs top-[70px]">
                {fromError}
              </p>
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
          <div className="  flex justify-center mb-1 ">
            <button
              onClick={handleSwap}
              disabled={!fromCity || !toCity}
              className="bg-white w-10 h-10 rounded-full flex items-center justify-center shadow hover:scale-110 transition disabled:opacity-40"
            >
              <ArrowLeftRight className="w-4 h-4 text-[#f36b32]" />
            </button>
          </div>

          {/* TO */}
          <div className="   relative" ref={toRef}>
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

            {toError && (
              <p className="absolute text-white text-xs top-[70px]">
                {toError}
              </p>
            )}

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
          <div className="relative" ref={calendarRef}>
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
            {/* CALENDAR DROPDOWN */}
  {showCalendar && (
    <div className="absolute top-16 left-0 bg-white rounded-md shadow-xl p-4 z-50 w-72">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-3">
        <button
          onClick={() =>
            setCurrentDate(
              new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
            )
          }
        >
          <ChevronLeft size={18} />
        </button>

        <span className="font-semibold">
          {monthName} {year}
        </span>

        <button
          onClick={() =>
            setCurrentDate(
              new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
            )
          }
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* DAYS GRID */}
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((day) => (
          <div key={day} className="font-semibold text-gray-500">
            {day}
          </div>
        ))}

        {/* Empty spaces */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={"empty" + i}></div>
        ))}

        {/* Days */}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const isPast = isPastDate(day);
          const isSelected =
            selectedDate.getDate() === day &&
            selectedDate.getMonth() === currentDate.getMonth() &&
            selectedDate.getFullYear() === currentDate.getFullYear();

          return (
            <div
              key={day}
              onClick={() => !isPast && handleDateSelect(day)}
              className={`p-2 rounded cursor-pointer
                ${isPast ? "text-gray-300 cursor-not-allowed" : ""}
                ${isSelected ? "bg-[#f36b32] text-white" : "hover:bg-gray-100"}
              `}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  )}
          </div>

          {/* SEARCH */}
          <div >
            <button
              onClick={handleSearch}
              className="w-[150px] h-12 bg-white text-black font-bold rounded-md shadow cursor-pointer transition-all duration-300 hover:text-[#fd561e]"
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
