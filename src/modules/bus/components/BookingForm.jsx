import { useState } from "react";
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
  { id: "student", title: "Student", subtitle: "Extra Discount/baggage" },
  { id: "armed", title: "Armed Force", subtitle: "Upto 600 off" },
  { id: "doctors", title: "Doctors & Nurses", subtitle: "Upto 600 off" },
];

export default function BookingForm() {
  const [activeTab, setActiveTab] = useState("bus");
  const [selectedCategory, setSelectedCategory] = useState("regular");
  const [departFrom, setDepartFrom] = useState("Hyderabad");
  const [goingTo, setGoingTo] = useState("Mumbai");
  const [departDate, setDepartDate] = useState("21/02/2026");
  const [isSearching, setIsSearching] = useState(false);

  const handleSwapCities = () => {
    const temp = departFrom;
    setDepartFrom(goingTo);
    setGoingTo(temp);
  };

  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 1500);
  };

  return (
    <motion.div
      className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-10 border border-white/40"
      initial={{ y: 100, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.6 }}
    >
      {/* Tab Navigation */}
      <motion.div
        className="flex items-center justify-start gap-3 mb-8"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-6 py-3 rounded-2xl border-2 transition-all ${
                isActive
                  ? "bg-white border-black shadow-md"
                  : "bg-white/60 border-gray-300 hover:bg-white hover:border-gray-400"
              }`}
              whileHover={{ scale: 1.05, y: -3, backgroundColor: "#ffffff" }}
              whileTap={{ scale: 0.95 }}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.9 + index * 0.05 }}
            >
              <Icon
                className={`w-7 h-7 ${
                  isActive ? "text-black" : "text-gray-700"
                }`}
              />
              <span
                className={`font-bold ${
                  isActive ? "text-black" : "text-gray-700"
                }`}
              >
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </motion.div>

      {/* City Selection and Date */}
      <div className="grid grid-cols-[1fr_auto_1fr_auto_300px] gap-6 items-end mb-8">
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.1 }}
        >
          <label className="block text-sm font-medium text-gray-700 mb-2 mr-52">
            Depart from
          </label>
          <input
            type="text"
            value={departFrom}
            onChange={(e) => setDepartFrom(e.target.value)}
            className="w-full text-3xl font-bold border-b-2 border-gray-800 bg-transparent focus:outline-none focus:border-orange-600 pb-2 transition-colors"
          />
        </motion.div>

        <motion.button
          onClick={handleSwapCities}
          className="mb-3 p-3 bg-white rounded-full shadow-md hover:shadow-xl hover:bg-orange-50 transition-all duration-300"
          whileHover={{ scale: 1.15, rotate: 180 }}
          whileTap={{ scale: 0.9 }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.3 }}
        >
          <ArrowLeftRight className="w-6 h-6 text-gray-700" />
        </motion.button>

        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <label className="block text-sm font-medium text-gray-700 mb-2 mr-56">
            Going to
          </label>
          <input
            type="text"
            value={goingTo}
            onChange={(e) => setGoingTo(e.target.value)}
            className="w-full text-3xl font-bold border-b-2 border-gray-800 bg-transparent focus:outline-none focus:border-orange-600 pb-2 transition-colors"
          />
        </motion.div>

        <div className="mb-3"></div>

        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.4 }}
        >
          <label className="block text-sm font-medium text-gray-700 mb-2 mr-52">
            Depart Date
          </label>
          <input
            type="text"
            value={departDate}
            onChange={(e) => setDepartDate(e.target.value)}
            className="w-full text-2xl font-bold border-b-2 border-gray-800 bg-transparent focus:outline-none focus:border-orange-600 pb-2 transition-colors"
          />
        </motion.div>
      </div>

      {/* Category Selection */}
      <div className="grid grid-cols-6 gap-4 mb-8 ">
        {categories.map((category, index) => (
          <motion.button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`-px-8 py-0 leading-none rounded-2xl border-2 transition-all ${
              selectedCategory === category.id
                ? "border-black bg-white shadow-lg"
                : "border-gray-400 bg-white/70 hover:bg-white hover:border-gray-600"
            }`}
            whileHover={{
              scale: 1.05,
              y: -5,
              backgroundColor: "#ffffff",
              borderColor: "#000000",
            }}
            whileTap={{ scale: 0.95 }}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.5 + index * 0.1 }}
          >
            <div
              className={`font-bold text-sm mb-1 ${
                selectedCategory === category.id
                  ? "text-black"
                  : "text-gray-800"
              }`}
            >
              {category.title}
            </div>
            <div
              className={`text-xs ${
                selectedCategory === category.id
                  ? "text-gray-700"
                  : "text-gray-600"
              }`}
            >
              {category.subtitle}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Floating Search Button */}
      <div className="absolute left-1/2 -bottom-10 -translate-x-1/2 w-full flex justify-center">
        <motion.button
          onClick={handleSearch}
          disabled={isSearching}
          className="px-28 py-5 bg-orange-600 text-white text-2xl font-bold rounded-2xl shadow-xl 
    hover:bg-orange-700 hover:shadow-2xl transition-all"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.9 }}
        >
          <AnimatePresence mode="wait">
            {isSearching ? (
              <motion.div
                key="searching"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-center justify-center gap-3"
              >
                <motion.div
                  className="w-6 h-6 border-3 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <span>Searching...</span>
              </motion.div>
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
