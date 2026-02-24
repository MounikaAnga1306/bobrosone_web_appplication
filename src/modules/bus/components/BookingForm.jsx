import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bus, Plane, Hotel, Palmtree, Car, ArrowLeftRight } from "lucide-react";

const tabs = [
  { id: "bus", label: "Bus", icon: Bus },
  { id: "flights", label: "Flights", icon: Plane },
  { id: "hotels", label: "Hotels", icon: Hotel },
  { id: "holidays", label: "Holidays", icon: Palmtree },
  { id: "cabs", label: "Cabs", icon: Car },
];

const categories = [
  { id: "regular", title: "Regular", subtitle: "Regular fares" },
  { id: "signup", title: "First SignUp", subtitle: "100 reward points" },
  { id: "earn", title: "Ride & Get Rewarded!", subtitle: "Earn 4% Every Trip" },
  {
    id: "doctors",
    title: "Apply. Save. Smile!",
    subtitle: "Use Promocode upto 10%",
  },
];

export default function BookingForm() {
  const navigate = useNavigate();
  const dateRef = useRef(null);

  const [activeTab, setActiveTab] = useState("bus");
  const [selectedCategory, setSelectedCategory] = useState("regular");
  const [departFrom, setDepartFrom] = useState("Hyderabad");
  const [goingTo, setGoingTo] = useState("Mumbai");
  const [departDate, setDepartDate] = useState("2026-02-21");
  const [isSearching, setIsSearching] = useState(false);
  const [rotateSwap, setRotateSwap] = useState(false); // NEW

  const handleSwapCities = () => {
    setRotateSwap((prev) => !prev);

    const temp = departFrom;
    setDepartFrom(goingTo);
    setGoingTo(temp);
  };

  const handleSearch = () => {
    setIsSearching(true);

    setTimeout(() => {
      if (activeTab === "flights") {
        navigate("/flights/results");
      } else if (activeTab === "bus") {
        navigate("/Home");
      }
      setIsSearching(false);
    }, 800);
  };

  return (
    <motion.div
      className="relative bg-white backdrop-blur-md 
      rounded-3xl shadow-2xl 
      p-6 sm:p-8 lg:p-10 
      border border-white/40 
      w-full"
      initial={{ y: 100, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.6 }}
    >
      {/* -------------------- TABS -------------------- */}
      <motion.div
        className="flex items-center justify-start gap-3 mb-8 
        overflow-x-auto scrollbar-hide"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <motion.button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === "flights") navigate("/flights/search");
                if (tab.id === "bus") navigate("/HomePage");
              }}
              className={`flex items-center gap-2 sm:gap-3 
              px-4 sm:px-6 py-2 sm:py-3 
              rounded-2xl border-2 transition-all whitespace-nowrap
              ${
                isActive
                  ? "bg-white border-black shadow-md"
                  : "bg-white/60 border-gray-300 hover:bg-white hover:border-gray-400"
              }`}
            >
              <Icon
                className={`w-5 sm:w-6 lg:w-7 h-5 sm:h-6 lg:h-7 ${
                  isActive ? "text-black" : "text-gray-700"
                }`}
              />
              <span
                className={`font-bold text-sm sm:text-base ${
                  isActive ? "text-black" : "text-gray-700"
                }`}
              >
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </motion.div>

      {/* -------------------- FORM GRID -------------------- */}
      <div
        className="relative
        grid 
        grid-cols-1 
        sm:grid-cols-2 
        md:grid-cols-[1fr_auto_1fr] 
        lg:grid-cols-[1fr_auto_1fr_auto_300px] 
        gap-6 
        items-end 
        mb-8"
      >
        {/* Depart From */}
        <motion.div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Depart from
          </label>
          <input
            type="text"
            value={departFrom}
            onChange={(e) => setDepartFrom(e.target.value)}
            className="w-full text-xl sm:text-2xl lg:text-3xl font-bold 
            border-b-2 border-gray-800 bg-transparent 
            focus:outline-none focus:border-orange-600 pb-2"
          />
        </motion.div>

        {/* ======= UPDATED SWAP BUTTON ======= */}
        <motion.button
          onClick={handleSwapCities}
          animate={{ rotate: rotateSwap ? 180 : 0 }}
          transition={{ duration: 0.4 }}
          className="
            z-10
            w-10 h-10 sm:w-12 sm:h-12
            bg-white
            border
            rounded-full
            shadow-md
            flex items-center justify-center
            hover:shadow-xl hover:bg-orange-50
            transition-all duration-300
          "
        >
          <ArrowLeftRight className="w-4 sm:w-5 h-4 sm:h-5 text-gray-700" />
        </motion.button>

        {/* Going To */}
        <motion.div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Going to
          </label>
          <input
            type="text"
            value={goingTo}
            onChange={(e) => setGoingTo(e.target.value)}
            className="w-full text-xl sm:text-2xl lg:text-3xl font-bold 
            border-b-2 border-gray-800 bg-transparent 
            focus:outline-none focus:border-orange-600 pb-2"
          />
        </motion.div>

        <div className="hidden lg:block"></div>

        {/* Date */}
        <motion.div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Depart Date
          </label>
          <input
            ref={dateRef}
            type="date"
            value={departDate}
            onChange={(e) => setDepartDate(e.target.value)}
            onClick={() => dateRef.current?.showPicker()}
            className="w-full text-lg sm:text-xl lg:text-2xl font-bold 
            border-b-2 border-gray-800 bg-transparent 
            focus:outline-none focus:border-orange-600 pb-2 appearance-none"
          />
        </motion.div>
      </div>

      {/* -------------------- SPECIAL FARES -------------------- */}
      <div className="flex flex-col lg:flex-row items-start gap-6 mb-8">
        <div className="lg:w-40">
          <h3 className="text-sm font-bold text-black leading-tight mt-4 ml-6">
            SPECIAL <br /> FARES
          </h3>
        </div>

        <div className="flex flex-wrap gap-4">
          {categories.map((category) => (
            <motion.button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 sm:px-6 py-3 rounded-2xl border transition-all ${
                selectedCategory === category.id
                  ? "border-blue-500 bg-blue-50 shadow-md"
                  : "border-gray-300 bg-white hover:border-gray-500"
              }`}
            >
              <div className="font-semibold text-xs sm:text-sm">
                {category.title}
              </div>
              <div className="text-xs text-gray-500">{category.subtitle}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* -------------------- SEARCH BUTTON -------------------- */}
      <div className="absolute left-1/2 -bottom-8 -translate-x-1/2 w-full flex justify-center px-4">
        <motion.button
          onClick={handleSearch}
          disabled={isSearching}
          className="
      w-full sm:w-auto 
      px-10 sm:px-20 lg:px-28 
      py-4 sm:py-5 
      bg-orange-600 text-white 
      text-lg sm:text-xl lg:text-2xl 
      font-bold rounded-2xl shadow-2xl 
      hover:bg-orange-700
    "
        >
          <AnimatePresence mode="wait">
            {isSearching ? (
              <motion.span key="searching">Searching...</motion.span>
            ) : (
              <motion.span
                key="search"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                Next
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.div>
  );
}
