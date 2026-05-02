import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Plane,
  Bus,
  Train,
  Car,
  Building2,
  IndianRupee,
  Palmtree,
  MapPin,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Camera,
  ArrowRightLeft,
  Sun,
  CloudRain,
  Snowflake,
} from "lucide-react";

const destinations = [
  {
    id: "munnar",
    name: "Munnar",
    location: "Kerala, India",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1920&q=80",
    about:
      "Munnar is a picturesque hill station in Kerala, famous for its sprawling tea plantations, misty mountains, and pleasant climate. Located at an altitude of 1,600 meters above sea level, Munnar offers breathtaking views and serves as a perfect escape from the hustle and bustle of city life.",
    thingsToDo: [
      {
        title: "Tea Plantation Visit",
        image: "https://thumbs.dreamstime.com/b/tea-plantation-munnar-kerala-india-munnar-kerala-india-dec-bright-vivid-landscape-green-tea-plantations-munnar-111798938.jpg",
        description: "Explore lush tea estates and learn about tea processing",
      },
      {
        title: "Eravikulam National Park",
        image: "https://tse3.mm.bing.net/th/id/OIP.MBzIeOzf7L9_2UThjbqN-AHaEK?rs=1&pid=ImgDetMain&o=7&rm=3",
        description: "Spot the rare Nilgiri Tahr and enjoy stunning landscapes",
      },
      {
        title: "Mattupetty Dam",
        image: "https://uat.bobros.co.in/images/munaar3.jpg",
        description: "Enjoy boating and scenic views of hills and forests",
      },
    ],
    seasons: [
      {
        icon: "winter",
        label: "Winter",
        period: "September to March",
        desc: "Ideal for sightseeing, trekking, and exploring tea plantations.",
      },
      {
        icon: "monsoon",
        label: "Monsoon",
        period: "June to August",
        desc: "Heavy rains enhance the beauty of hills with lush greenery and sparkling waterfalls.",
      },
      {
        icon: "summer",
        label: "Summer",
        period: "April to June",
        desc: "A great time to escape the heat — Munnar offers a pleasant cool climate.",
      },
    ],
    howToReach: {
      flight: "The nearest airport is Cochin International Airport (around 110 km away).",
      train: "The nearest railway stations are Aluva (110 km) and Ernakulam (130 km).",
      bus: "Munnar is well-connected by roads to major cities like Kochi, Coimbatore, and Madurai.",
    },
  },
  {
    id: "coorg",
    name: "Coorg",
    location: "Karnataka, India",
    image: "https://uat.bobros.co.in/images/coorg.jpg",
    about:
      'Known as the "Scotland of India", Coorg is a stunning hill station renowned for its coffee plantations, lush greenery, and cascading waterfalls.',
    thingsToDo: [
      {
        title: "Coffee Plantation Tours",
        image: "https://uat.bobros.co.in/images/coorg1.webp",
        description: "Walk through aromatic coffee estates and taste fresh brews",
      },
      {
        title: "Abbey Falls",
        image: "https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?w=600&q=80",
        description: "Witness the spectacular waterfall amidst coffee plantations",
      },
      {
        title: "Dubare Elephant Camp",
        image: "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=600&q=80",
        description: "Interact with elephants and enjoy river rafting",
      },
    ],
    seasons: [
      {
        icon: "winter",
        label: "Winter",
        period: "October to February",
        desc: "Perfect for trekking, sightseeing, and outdoor activities in pleasant weather.",
      },
      {
        icon: "monsoon",
        label: "Monsoon",
        period: "June to September",
        desc: "Heavy rains create a lush, green landscape, but some outdoor activities may be limited.",
      },
      {
        icon: "summer",
        label: "Summer",
        period: "March to May",
        desc: "Warm, but ideal for enjoying the coffee plantations and natural beauty.",
      },
    ],
    howToReach: {
      flight: "The nearest airport is Mangalore International Airport (160 km away).",
      train: "The nearest railway station is Mysore (95 km), which is well connected by trains.",
      bus: "Coorg is accessible by road from cities like Bangalore, Mysore, and Mangalore.",
    },
  },
  {
    id: "varkala",
    name: "Varkala",
    location: "Kerala, India",
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1920&q=80",
    about:
      "Varkala is a stunning coastal paradise featuring dramatic red cliffs, pristine beaches, and natural mineral springs.",
    thingsToDo: [
      {
        title: "Varkala Beach",
        image: "https://uat.bobros.co.in/images/varkala1.webp",
        description: "Relax on pristine sands and enjoy cliffside cafes",
      },
      {
        title: "Janardhana Swamy Temple",
        image: "https://images.unsplash.com/photo-1548013146-72479768bada?w=600&q=80",
        description: "Visit the 2000-year-old ancient Hindu temple",
      },
      {
        title: "Ayurvedic Spa",
        image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80",
        description: "Rejuvenate with traditional Kerala Ayurvedic treatments",
      },
    ],
    seasons: [
      {
        icon: "winter",
        label: "Winter",
        period: "October to March",
        desc: "Best time for beach activities and sightseeing with cool, pleasant weather.",
      },
      {
        icon: "monsoon",
        label: "Monsoon",
        period: "June to September",
        desc: "Monsoon brings lush greenery, but heavy rains may restrict beach activities.",
      },
      {
        icon: "summer",
        label: "Summer",
        period: "April to June",
        desc: "Hot but manageable — ideal for relaxing by the beach.",
      },
    ],
    howToReach: {
      flight: "The nearest airport is Thiruvananthapuram International Airport (50 km).",
      train: "Varkala has its own railway station (Varkala Sivagiri), well connected to major cities in Kerala.",
      bus: "Varkala is well connected by road from cities like Thiruvananthapuram and Kochi.",
    },
  },
  {
    id: "alappuzha",
    name: "Alappuzha",
    location: "Kerala, India",
    image: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=1920&q=80",
    about:
      'Alappuzha, famously known as the "Venice of the East", is celebrated for its serene backwaters, traditional houseboat cruises, and tranquil canals.',
    thingsToDo: [
      {
        title: "Houseboat Cruise",
        image: "https://images.unsplash.com/photo-1580837119756-563d608dd119?w=600&q=80",
        description: "Stay overnight in traditional Kerala houseboats",
      },
      {
        title: "Backwater Village Tours",
        image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&q=80",
        description: "Explore local villages and experience rural Kerala life",
      },
      {
        title: "Alleppey Beach",
        image: "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=600&q=80",
        description: "Enjoy sunsets and local seafood at beach shacks",
      },
    ],
    seasons: [
      {
        icon: "winter",
        label: "Winter",
        period: "November to February",
        desc: "Ideal for backwater cruises and sightseeing with pleasant weather.",
      },
      {
        icon: "monsoon",
        label: "Monsoon",
        period: "June to September",
        desc: "High rainfall enhances the beauty of the backwaters but can disrupt some activities.",
      },
      {
        icon: "summer",
        label: "Summer",
        period: "March to May",
        desc: "Warm, but a good time for beach activities and houseboat cruises.",
      },
    ],
    howToReach: {
      flight: "The nearest airport is Cochin International Airport (85 km).",
      train: "Alappuzha has its own railway station, well connected to major cities.",
      bus: "Alappuzha is easily accessible by road from cities like Kochi and Kottayam.",
    },
  },
  {
    id: "wayanad",
    name: "Wayanad",
    location: "Kerala, India",
    image: "https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=1920&q=80",
    about:
      "Wayanad is a pristine hill station known for its wildlife sanctuaries, ancient caves, spice plantations, and misty mountains.",
    thingsToDo: [
      {
        title: "Wildlife Safari",
        image: "https://uat.bobros.co.in/images/waynad2.jpg",
        description: "Spot elephants, tigers, and exotic birds at Wayanad Wildlife Sanctuary",
      },
      {
        title: "Edakkal Caves",
        image: "https://uat.bobros.co.in/images/waynad1.jpg",
        description: "Explore ancient caves with prehistoric rock art",
      },
      {
        title: "Soochipara Waterfall",
        image: "https://uat.bobros.co.in/images/waynad3.jpg",
        description: "Trek through forests to reach this spectacular waterfall",
      },
    ],
    seasons: [
      {
        icon: "winter",
        label: "Winter",
        period: "November to February",
        desc: "Best time for sightseeing, trekking, and outdoor activities.",
      },
      {
        icon: "monsoon",
        label: "Monsoon",
        period: "June to September",
        desc: "Heavy rains enhance the greenery, but some activities may be restricted.",
      },
      {
        icon: "summer",
        label: "Summer",
        period: "March to May",
        desc: "Warm, but good for wildlife sightings and exploring waterfalls.",
      },
    ],
    howToReach: {
      flight: "The nearest airport is Calicut International Airport (65 km).",
      train: "The nearest railway stations are Kozhikode (65 km) and Nilambur (80 km).",
      bus: "Wayanad is well connected by road from cities like Kozhikode, Mysore, and Bangalore.",
    },
  },
  {
    id: "hyderabad",
    name: "Hyderabad",
    location: "Telangana, India",
    image: "/assets/Hyderabad.jpg",
    about:
      "Hyderabad, the 'City of Pearls', is a vibrant blend of rich history and modernity. Known for its iconic Charminar, the majestic Golconda Fort, and world-famous Hyderabadi Biryani, the city offers a fascinating journey through the opulent Nizam era alongside contemporary IT hubs and bustling bazaars.",
    thingsToDo: [
      {
        title: "Charminar & Laad Bazaar",
        image: "/assets/charminar.jpg",
        description: "Marvel at the 16th-century monument and shop for bangles, pearls, and traditional attire",
      },
      {
        title: "Golconda Fort",
        image: "/assets/Golconda.jpg",
        description: "Explore the acoustic marvels and grand ruins of this legendary diamond fort",
      },
      {
        title: "Ramoji Film City",
        image: "/assets/ramoji.jpg",
        description: "Visit the world's largest integrated film studio complex with live shows and sets",
      },
    ],
    seasons: [
      {
        icon: "winter",
        label: "Winter",
        period: "October to February",
        desc: "The best time to visit — cool, pleasant weather perfect for sightseeing and exploring the city.",
      },
      {
        icon: "monsoon",
        label: "Monsoon",
        period: "June to September",
        desc: "Refreshing rains cool the city down, great for indoor attractions and food trails.",
      },
      {
        icon: "summer",
        label: "Summer",
        period: "March to May",
        desc: "Hot and dry — early morning or evening visits to heritage sites are recommended.",
      },
    ],
    howToReach: {
      flight: "Rajiv Gandhi International Airport (HYD) is well-connected to all major domestic and international cities.",
      train: "Hyderabad Deccan (Nampally) and Secunderabad are major railway stations with trains from across India.",
      bus: "Extensive TGSRTC bus network connects Hyderabad to all neighboring states and cities.",
    },
  },
  {
    id: "tirupati",
    name: "Tirupati",
    location: "Andhra Pradesh, India",
    image: "/assets/tirupatihillview.png",
    about:
      "Tirupati, the 'Spiritual Capital of Andhra Pradesh', is home to the revered Venkateswara Temple atop Tirumala Hills. One of the most visited pilgrimage sites in the world, it attracts millions of devotees annually. Beyond spirituality, Tirupati is surrounded by scenic waterfalls, ancient temples, and lush forests.",
    thingsToDo: [
      {
        title: "Tirumala Venkateswara Temple",
        image: "/assets/tirupati image.png",
        description: "Seek blessings at the world-famous hill shrine of Lord Venkateswara",
      },
      {
        title: "Talakona Waterfalls",
        image: "/assets/talakonda.jpg",
        description: "Trek through dense forests to witness the highest waterfall in Andhra Pradesh",
      },
      {
        title: "Sri Venkateswara Zoological Park",
        image: "/assets/park.webp",
        description: "Explore one of Asia's largest zoos, home to diverse flora and fauna",
      },
    ],
    seasons: [
      {
        icon: "winter",
        label: "Winter",
        period: "September to February",
        desc: "The ideal time for darshan and local sightseeing with cool and pleasant weather.",
      },
      {
        icon: "monsoon",
        label: "Monsoon",
        period: "June to August",
        desc: "Lush green surroundings with waterfalls at their best — a serene and refreshing experience.",
      },
      {
        icon: "summer",
        label: "Summer",
        period: "March to May",
        desc: "Hot weather, but early morning darshan and indoor temples make it manageable.",
      },
    ],
    howToReach: {
      flight: "Tirupati International Airport (TIR) has direct flights from major Indian cities.",
      train: "Tirupati Main Railway Station is well-connected to all parts of India.",
      bus: "Frequent APSRTC and private buses run from Chennai, Bangalore, Hyderabad, and nearby cities.",
    },
  },
];

const quickServices = [
  { icon: Palmtree, label: "Holidays", path: "/Holiday" },
  { icon: Bus, label: "Bus", path: "/" },
  { icon: IndianRupee, label: "Bill Payments", path: "/BillHomePage" },
  { icon: Plane, label: "Flights", path: "/flights" },
  { icon: Building2, label: "Hotels", path: "/hotels" },
  { icon: Car, label: "Cabs", path: "/cabs" },
];

const specialFares = [
  { id: "regular", label: "Regular", desc: "Regular fares" },
  { id: "first", label: "First SignUp", desc: "100 reward points" },
  { id: "reward", label: "Ride & Get Rewarded!", desc: "Earn 4% Every Trip" },
  { id: "promo", label: "Apply. Save. Smile!", desc: "Use Promocode upto 10%" },
];

const SeasonIcon = ({ type, className }) => {
  if (type === "winter") return <Snowflake className={className} />;
  if (type === "monsoon") return <CloudRain className={className} />;
  return <Sun className={className} />;
};

const seasonColors = {
  winter: { bg: "bg-blue-50", border: "border-blue-200", icon: "text-blue-500", badge: "bg-blue-100 text-blue-700" },
  monsoon: { bg: "bg-teal-50", border: "border-teal-200", icon: "text-teal-500", badge: "bg-teal-100 text-teal-700" },
  summer: { bg: "bg-amber-50", border: "border-amber-200", icon: "text-amber-500", badge: "bg-amber-100 text-amber-700" },
};

export default function HolidayHomepage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("holidays");
  const [activeFare, setActiveFare] = useState("regular");

  // ── SMOOTH CROSSFADE CAROUSEL ──────────────────────────────────────────────
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(null);
  const [fading, setFading] = useState(false);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  const goToSlide = (targetIndex) => {
    if (fading || targetIndex === currentIndex) return;
    clearInterval(intervalRef.current);
    clearTimeout(timeoutRef.current);

    setPrevIndex(currentIndex);
    setFading(true);

    timeoutRef.current = setTimeout(() => {
      setCurrentIndex(targetIndex);
      setPrevIndex(null);
      setFading(false);
      startAuto();
    }, 700);
  };

  const changeSlide = (dir) => {
    const next =
      dir === "next"
        ? (currentIndex + 1) % destinations.length
        : (currentIndex - 1 + destinations.length) % destinations.length;
    goToSlide(next);
  };

  const startAuto = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % destinations.length;
        setPrevIndex(prev);
        setFading(true);
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          setCurrentIndex(next);
          setPrevIndex(null);
          setFading(false);
        }, 700);
        return prev; // keep prev until timeout resolves
      });
    }, 9000);
  };

  useEffect(() => {
    startAuto();
    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(timeoutRef.current);
    };
  }, []);

  const currentDestination = destinations[currentIndex];

  // ── Calendar ──────────────────────────────────────────────────────────────
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentDate, setCurrentDate] = useState(new Date());
  const calendarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target))
        setShowCalendar(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const year = currentDate.getFullYear();

  const handleDateSelect = (day) => {
    setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
    setShowCalendar(false);
  };
  const formatDate = (date) => (date ? date.toLocaleDateString("en-GB") : "");
  const isPastDate = (d) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), d);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // ── City search ───────────────────────────────────────────────────────────
  const [fromQuery, setFromQuery] = useState("");
  const [fromResults, setFromResults] = useState([]);
  const [showFromResults, setShowFromResults] = useState(false);
  const [fromSelected, setFromSelected] = useState(false);
  const [fromCity, setFromCity] = useState(null);
  const [fromError, setFromError] = useState("");

  const [toQuery, setToQuery] = useState("");
  const [toResults, setToResults] = useState([]);
  const [showToResults, setShowToResults] = useState(false);
  const [toSelected, setToSelected] = useState(false);
  const [toCity, setToCity] = useState(null);
  const [toError, setToError] = useState("");
  const [sameCityError, setSameCityError] = useState("");

  const fromRef = useRef(null);
  const toRef = useRef(null);
  const fromDebounce = useRef(null);
  const toDebounce = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (fromRef.current && !fromRef.current.contains(e.target)) {
        setShowFromResults(false);
        if (!fromSelected) setFromQuery("");
      }
      if (toRef.current && !toRef.current.contains(e.target)) {
        setShowToResults(false);
        if (!toSelected) setToQuery("");
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [fromSelected, toSelected]);

  const searchCities = async (value) => {
    if (!value || value.length < 2) { setFromResults([]); return; }
    clearTimeout(fromDebounce.current);
    fromDebounce.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://api.example.com/cities?name=${value}`);
        const data = await res.json();
        setFromResults(data || []);
        setShowFromResults(true);
      } catch { /* ignore */ }
    }, 400);
  };

  const searchToCities = async (value) => {
    if (!value || value.length < 2) { setToResults([]); return; }
    clearTimeout(toDebounce.current);
    toDebounce.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://api.example.com/cities?name=${value}`);
        const data = await res.json();
        setToResults(data || []);
        setShowToResults(true);
      } catch { /* ignore */ }
    }, 400);
  };

  const handleSwap = () => {
    const nf = toCity, nt = fromCity, nfq = toQuery, ntq = fromQuery;
    setFromCity(nf); setToCity(nt); setFromQuery(nfq); setToQuery(ntq);
    setFromSelected(!!nf); setToSelected(!!nt);
    setFromError(""); setToError(""); setSameCityError("");
  };

  const handleSearch = () => {
    setFromError(""); setToError(""); setSameCityError("");
    let valid = true;
    if (!fromCity?.id) { setFromError("Please select departure city"); valid = false; }
    if (!toCity?.id) { setToError("Please select destination city"); valid = false; }
    if (fromCity && toCity && fromCity.id === toCity.id) {
      setSameCityError("Departure and Destination cannot be the same"); valid = false;
    }
    if (!valid) return;
    alert(`Searching: ${fromCity?.name} → ${toCity?.name} on ${selectedDate.toISOString().split("T")[0]}`);
  };

  // ── Calendar components ───────────────────────────────────────────────────
  const CalendarGrid = ({ isMobile }) => (
    <div
      ref={calendarRef}
      onMouseDown={isMobile ? (e) => e.stopPropagation() : undefined}
      className={`absolute bg-white rounded-2xl shadow-2xl p-3 sm:p-4 z-50 ${
        isMobile ? "top-full left-0 right-0 mt-1" : "top-16 right-0 w-[280px] sm:w-[320px]"
      }`}
    >
      <div className="flex justify-between items-center mb-3">
        <button onClick={(e) => { e.stopPropagation(); setCurrentDate(new Date(year, currentDate.getMonth() - 1, 1)); }} className="p-1 hover:bg-gray-100 rounded">
          <ChevronLeft size={18} />
        </button>
        <h2 className="font-semibold text-sm">{monthName} {year}</h2>
        <button onClick={(e) => { e.stopPropagation(); setCurrentDate(new Date(year, currentDate.getMonth() + 1, 1)); }} className="p-1 hover:bg-gray-100 rounded">
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="grid grid-cols-7 text-center text-xs text-gray-500 mb-2">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {[...Array(firstDay)].map((_, i) => <div key={i} />)}
        {[...Array(daysInMonth)].map((_, idx) => {
          const day = idx + 1;
          const past = isPastDate(day);
          const isSel = selectedDate?.getDate() === day && selectedDate?.getMonth() === currentDate.getMonth();
          return (
            <button key={day} onClick={(e) => { e.stopPropagation(); !past && handleDateSelect(day); }} disabled={past}
              className={`p-1 rounded-lg transition text-xs ${isSel ? "bg-[#fd561e] text-white" : past ? "text-gray-300 cursor-not-allowed" : "hover:bg-orange-100"}`}>
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white font-sans">

      {/* ════════════════════════════════════════════════════════
          HERO — pure opacity crossfade, zero zoom/scale/pan
      ════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[550px] md:min-h-[450px] lg:min-h-[590px] flex items-center justify-center py-8 md:py-0 overflow-hidden">

        {/* Background layers — only opacity animates, no transform */}
        <div className="absolute inset-0 w-full h-full">
          {destinations.map((dest, idx) => (
            <div
              key={dest.id}
              className="absolute inset-0 w-full h-full"
              style={{
                backgroundImage: `url(${dest.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                opacity: idx === currentIndex ? 1 : 0,
                transition: "opacity 0.7s ease-in-out",
                willChange: "opacity",
              }}
            />
          ))}
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/35" />

        {/* Arrows */}
        <button
          onClick={() => changeSlide("prev")}
          className="absolute left-4 md:left-8 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-sm p-2 rounded-full text-white transition-all duration-300"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={() => changeSlide("next")}
          className="absolute right-4 md:right-8 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-sm p-2 rounded-full text-white transition-all duration-300"
        >
          <ChevronRight size={24} />
        </button>

        {/* Dots */}
        <div className="absolute bottom-[-52px] md:bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
          {destinations.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`h-1 rounded-full transition-all duration-300 ${idx === currentIndex ? "w-8 bg-[#fd561e]" : "w-4 bg-white/60"}`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-4 sm:mb-6 md:mb-8 text-white">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold mt-6 md:-mt-6"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Wanderlust Holidays
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-xs sm:text-sm md:text-lg opacity-90 mt-1 sm:mt-2"
            >
              Discover Your Next Adventure
            </motion.p>
          </div>

          {/* Search card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="relative bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl p-3 sm:p-4 md:p-6 lg:p-8 border border-white/20 pb-12"
          >
            {/* Service tabs — lg only */}
            <div className="hidden lg:flex gap-3 mb-6 md:mb-8">
              {quickServices.map((service, idx) => {
                const Icon = service.icon;
                const isActive = activeTab === service.label.toLowerCase();
                return (
                  <button key={idx}
                    onClick={() => { setActiveTab(service.label.toLowerCase()); navigate(service.path); }}
                    className={`flex items-center gap-2 px-3 lg:px-4 xl:px-5 py-1.5 lg:py-2 xl:py-2.5 cursor-pointer rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 border ${
                      isActive
                        ? "bg-gradient-to-r from-[#fd561e] to-[#ff7b4a] text-white border-transparent shadow-lg scale-105"
                        : "border-gray-200 text-gray-600 hover:border-[#fd561e] hover:text-[#fd561e] bg-white/80"
                    }`}>
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    {service.label}
                  </button>
                );
              })}
            </div>

            {/* MOBILE FORM */}
            <div className="md:hidden space-y-0">
              <div className="relative border border-gray-200 rounded-xl overflow-visible">
                <div ref={fromRef} className="relative px-3 pt-3 pb-2 pr-10">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Depart From</p>
                  <div className={`flex items-center gap-2 pb-1 ${fromError ? "border-b border-red-400" : ""}`}>
                    <MapPin className={`w-3.5 h-3.5 flex-shrink-0 ${fromError ? "text-red-400" : "text-gray-400"}`} />
                    <input type="text" placeholder="From" className="w-full text-sm font-semibold outline-none bg-transparent py-0.5"
                      value={fromQuery}
                      onChange={(e) => { const val = e.target.value; setFromQuery(val); setFromSelected(false); setFromCity(null); setFromError(""); setSameCityError(""); searchCities(val); }} />
                  </div>
                  {fromError && <p className="text-red-500 text-[10px] mt-0.5 flex items-center gap-1"><span>⚠</span>{fromError}</p>}
                  {showFromResults && fromResults.length > 0 && (
                    <div className="absolute left-0 top-full w-full bg-white shadow-lg rounded-xl max-h-48 overflow-y-auto z-50 mt-1">
                      {fromResults.map((city) => (
                        <div key={city.id} onClick={() => { setFromQuery(city.name); setFromCity(city); setFromSelected(true); setShowFromResults(false); setFromError(""); if (toCity?.id === city.id) setSameCityError("Departure and Destination cannot be the same"); else setSameCityError(""); }}
                          className="px-3 py-2 hover:bg-orange-50 cursor-pointer text-xs border-b last:border-0">
                          {city.name}, {city.state}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="relative mt-2 border border-gray-200 rounded-xl overflow-visible">
                <div className="mx-3 border-t border-dashed border-gray-200" />
                <div ref={toRef} className="relative px-3 pt-2 pb-3 pr-10">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Going To</p>
                  <div className={`flex items-center gap-2 pb-1 ${toError || sameCityError ? "border-b border-red-400" : ""}`}>
                    <MapPin className={`w-3.5 h-3.5 flex-shrink-0 ${toError || sameCityError ? "text-red-400" : "text-gray-400"}`} />
                    <input type="text" placeholder="To" className="w-full text-sm font-semibold outline-none bg-transparent py-0.5"
                      value={toQuery}
                      onChange={(e) => { const val = e.target.value; setToQuery(val); setToSelected(false); setToCity(null); setToError(""); setSameCityError(""); searchToCities(val); }} />
                  </div>
                  {(toError || sameCityError) && <p className="text-red-500 text-[10px] mt-0.5 flex items-center gap-1"><span>⚠</span>{sameCityError || toError}</p>}
                  {showToResults && toResults.length > 0 && (
                    <div className="absolute left-0 top-full w-full bg-white shadow-lg rounded-xl max-h-48 overflow-y-auto z-50 mt-1">
                      {toResults.map((city) => (
                        <div key={city.id} onClick={() => { setToQuery(city.name); setToCity(city); setToSelected(true); setShowToResults(false); setToError(""); if (fromCity?.id === city.id) setSameCityError("Departure and Destination cannot be the same"); else setSameCityError(""); }}
                          className="px-3 py-2 hover:bg-orange-50 cursor-pointer text-xs border-b last:border-0">
                          {city.name}, {city.state}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="absolute right-8 -top-2 -translate-y-1/2 translate-x-1/2 z-10">
                  <button onClick={handleSwap} className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center shadow-sm hover:bg-orange-50 hover:border-[#fd561e] transition-all duration-200">
                    <ArrowRightLeft className="w-3.5 h-3.5 text-gray-500 rotate-90" />
                  </button>
                </div>
              </div>
              <div className="relative mt-3 border border-gray-200 rounded-xl px-3 py-3">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Departure Date</p>
                <div onClick={() => setShowCalendar(!showCalendar)} className="flex items-center gap-2 cursor-pointer">
                  <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <span className="text-sm font-semibold text-gray-800">{formatDate(selectedDate)}</span>
                </div>
                {showCalendar && <CalendarGrid isMobile />}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wide text-gray-700">Special Fares</span>
                <div className="flex flex-wrap gap-1.5">
                  {specialFares.map((fare) => {
                    const active = activeFare === fare.id;
                    return (
                      <button key={fare.id} onClick={() => setActiveFare(fare.id)}
                        className={`px-2 py-1 rounded-lg border text-left transition-all duration-300 ${active ? "border-[#fd561e] bg-orange-50 shadow-sm" : "border-gray-200 text-gray-600 hover:border-[#fd561e] bg-white/80"}`}>
                        <span className="text-[10px] font-semibold block">{fare.label}</span>
                        <span className="text-[8px] text-gray-500">{fare.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* DESKTOP FORM */}
            <div className="hidden md:block relative">
              <div className="grid grid-cols-12 gap-2">
                <div ref={fromRef} className="col-span-5 md:col-span-4 lg:col-span-4 group relative">
                  <p className="text-[11px] sm:text-xs text-gray-500 uppercase tracking-wide mb-1 transition-colors duration-300 group-hover:text-[#fd561e]">Depart From</p>
                  <div className={`flex items-center gap-2 pb-1.5 border-b transition-colors duration-300 ${fromError ? "border-red-400" : "border-gray-200 group-hover:border-[#fd561e]"}`}>
                    <MapPin className={`w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 transition-colors duration-300 ${fromError ? "text-red-400" : "text-gray-400 group-hover:text-[#fd561e]"}`} />
                    <input type="text" placeholder="From" className="w-full text-sm sm:text-base md:text-lg font-semibold outline-none bg-transparent py-1"
                      value={fromQuery}
                      onChange={(e) => { const val = e.target.value; setFromQuery(val); setFromSelected(false); setFromCity(null); setFromError(""); setSameCityError(""); searchCities(val); }} />
                  </div>
                  <div className="h-4 mt-0.5">{fromError && <p className="text-red-500 text-[10px] flex items-center gap-1"><span>⚠</span>{fromError}</p>}</div>
                  {showFromResults && fromResults.length > 0 && (
                    <div className="absolute left-0 top-full w-full bg-white shadow-lg rounded-xl max-h-48 overflow-y-auto z-50 mt-1">
                      {fromResults.map((city) => (
                        <div key={city.id} onClick={() => { setFromQuery(city.name); setFromCity(city); setFromSelected(true); setShowFromResults(false); setFromError(""); if (toCity?.id === city.id) setSameCityError("Departure and Destination cannot be the same"); else setSameCityError(""); }}
                          className="px-3 py-1.5 hover:bg-orange-50 cursor-pointer text-xs">
                          {city.name}, {city.state}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex justify-center items-center col-span-1 px-0">
                  <button onClick={handleSwap} className="p-1.5 sm:p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-500 hover:rotate-180 cursor-pointer">
                    <ArrowRightLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
                  </button>
                </div>
                <div ref={toRef} className="col-span-5 md:col-span-4 lg:col-span-4 group relative">
                  <p className="text-[11px] sm:text-xs text-gray-500 uppercase tracking-wide mb-1 transition-colors duration-300 group-hover:text-[#fd561e]">Going To</p>
                  <div className={`flex items-center gap-2 pb-1.5 border-b transition-colors duration-300 ${toError || sameCityError ? "border-red-400" : "border-gray-200 group-hover:border-[#fd561e]"}`}>
                    <MapPin className={`w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 transition-colors duration-300 ${toError || sameCityError ? "text-red-400" : "text-gray-400 group-hover:text-[#fd561e]"}`} />
                    <input type="text" placeholder="To" className="w-full text-sm sm:text-base md:text-lg font-semibold outline-none bg-transparent py-1"
                      value={toQuery}
                      onChange={(e) => { const val = e.target.value; setToQuery(val); setToSelected(false); setToCity(null); setToError(""); setSameCityError(""); searchToCities(val); }} />
                  </div>
                  <div className="h-4 mt-0.5">{(toError || sameCityError) && <p className="text-red-500 text-[10px] flex items-center gap-1"><span>⚠</span>{sameCityError || toError}</p>}</div>
                  {showToResults && toResults.length > 0 && (
                    <div className="absolute left-0 top-full w-full bg-white shadow-lg rounded-xl max-h-48 overflow-y-auto z-50 mt-1">
                      {toResults.map((city) => (
                        <div key={city.id} onClick={() => { setToQuery(city.name); setToCity(city); setToSelected(true); setShowToResults(false); setToError(""); if (fromCity?.id === city.id) setSameCityError("Departure and Destination cannot be the same"); else setSameCityError(""); }}
                          className="px-3 py-1.5 hover:bg-orange-50 cursor-pointer text-xs">
                          {city.name}, {city.state}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="col-span-12 md:col-span-3 lg:col-span-3 relative group">
                  <p className="text-[11px] sm:text-xs text-gray-500 uppercase tracking-wide mb-1 transition-colors duration-300 group-hover:text-[#fd561e]">Departure Date</p>
                  <div onClick={() => setShowCalendar(!showCalendar)} className="flex items-center gap-2 pb-1.5 border-b border-gray-200 transition-colors duration-300 group-hover:border-[#fd561e] cursor-pointer">
                    <Calendar className="text-gray-400 w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors duration-300 group-hover:text-[#fd561e] flex-shrink-0" />
                    <input type="text" value={formatDate(selectedDate)} placeholder="Select Date" readOnly className="w-full text-sm sm:text-base md:text-lg font-semibold outline-none cursor-pointer bg-transparent py-1" />
                  </div>
                  <div className="h-4 mt-0.5" />
                  {showCalendar && <CalendarGrid />}
                </div>
              </div>
              <div className="mt-5 sm:mt-6 flex flex-wrap items-center gap-1.5 sm:gap-2 md:gap-3">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wide text-gray-700">Special Fares</span>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {specialFares.map((fare) => {
                    const active = activeFare === fare.id;
                    return (
                      <button key={fare.id} onClick={() => setActiveFare(fare.id)}
                        className={`px-2 sm:px-3 py-1 rounded-lg border text-left transition-all duration-300 ${active ? "border-[#fd561e] bg-orange-50 shadow-sm" : "border-gray-200 text-gray-600 hover:border-[#fd561e] bg-white/80"}`}>
                        <span className="text-[10px] sm:text-xs font-semibold block">{fare.label}</span>
                        <span className="text-[8px] sm:text-[10px] text-gray-500">{fare.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Search button */}
            <div className="absolute left-1/2 -bottom-5 sm:-bottom-6 md:-bottom-7 transform -translate-x-1/2">
              <button onClick={handleSearch}
                className="bg-gradient-to-r from-[#fd561e] to-[#ff7b4a] text-white cursor-pointer px-6 sm:px-8 md:px-14 py-1.5 sm:py-2 md:py-3 rounded-full text-xs sm:text-sm md:text-base font-semibold shadow-xl hover:scale-110 transition-all duration-300 whitespace-nowrap">
                Search
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          DESTINATION INFO — animates when currentIndex changes
      ════════════════════════════════════════════════════════ */}
      <AnimatePresence mode="wait">
        <motion.section
          key={currentIndex}
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.55, ease: "easeInOut" }}
          className="py-8 md:py-16 px-4 bg-gradient-to-b from-white to-orange-50"
        >
          <div className="max-w-7xl mx-auto">

            {/* Destination heading */}
            <div className="mb-10 md:mb-14">
              <h2 className="text-3xl md:text-5xl font-bold text-stone-800 mb-1 md:mb-2 flex items-center gap-2 md:gap-3"
                style={{ fontFamily: "'Playfair Display', serif" }}>
                <MapPin className="w-6 h-6 md:w-10 md:h-10 text-[#fd561e]" />
                {currentDestination.name}
              </h2>
              <p className="text-stone-500 text-sm md:text-lg mb-3 md:mb-4 flex items-center gap-1 md:gap-2">
                <MapPin className="w-3 h-3 md:w-4 md:h-4" /> {currentDestination.location}
              </p>
              <p className="text-stone-700 text-sm md:text-lg leading-relaxed">{currentDestination.about}</p>
            </div>

            {/* Things to Do */}
            <div className="mb-10 md:mb-14">
              <h2 className="text-3xl md:text-5xl font-bold text-stone-800 mb-6 md:mb-8 flex items-center gap-2 md:gap-3"
                style={{ fontFamily: "'Playfair Display', serif" }}>
                <Camera className="w-6 h-6 md:w-10 md:h-10 text-[#fd561e]" /> Things to Do
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                {currentDestination.thingsToDo.map((activity, idx) => (
                  <motion.div key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08, duration: 0.45 }}
                    className="group bg-white rounded-xl md:rounded-2xl overflow-hidden border-2 border-orange-100 shadow-md hover:border-[#fd561e] hover:shadow-xl transition-all duration-300 cursor-pointer">
                    <div className="relative h-48 md:h-56 overflow-hidden">
                      <img src={activity.image} alt={activity.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                    <div className="p-4 md:p-6">
                      <h3 className="text-xl md:text-2xl font-bold text-stone-800 mb-2 md:mb-3"
                        style={{ fontFamily: "'Playfair Display', serif" }}>{activity.title}</h3>
                      <p className="text-stone-600 text-sm md:text-base">{activity.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Seasons + How to Reach */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">

              {/* Best Time — Seasons */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className="bg-white rounded-xl md:rounded-2xl p-6 md:p-8 border-2 border-orange-100 shadow-xl"
              >
                <h2 className="text-2xl md:text-4xl font-bold text-stone-800 mb-5 md:mb-7 flex items-center gap-2 md:gap-3"
                  style={{ fontFamily: "'Playfair Display', serif" }}>
                  <Calendar className="w-6 h-6 md:w-9 md:h-9 text-[#fd561e]" /> Best Time to Visit
                </h2>
                <div className="space-y-3">
                  {currentDestination.seasons.map((season) => {
                    const colors = seasonColors[season.icon];
                    return (
                      <div key={season.label}
                        className={`flex items-start gap-4 p-4 rounded-xl border ${colors.bg} ${colors.border}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-white shadow-sm`}>
                          <SeasonIcon type={season.icon} className={`w-5 h-5 ${colors.icon}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-bold text-stone-800 text-sm">{season.label}</span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${colors.badge}`}>
                              {season.period}
                            </span>
                          </div>
                          <p className="text-stone-600 text-xs md:text-sm leading-relaxed">{season.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* How to Reach */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className="bg-white rounded-xl md:rounded-2xl p-6 md:p-8 border-2 border-orange-100 shadow-xl"
              >
                <h2 className="text-2xl md:text-4xl font-bold text-stone-800 mb-5 md:mb-7 flex items-center gap-2 md:gap-3"
                  style={{ fontFamily: "'Playfair Display', serif" }}>
                  <MapPin className="w-6 h-6 md:w-9 md:h-9 text-[#fd561e]" /> How to Reach
                </h2>
                <div className="space-y-4">
                  {[
                    { Icon: Plane, label: "By Air",   value: currentDestination.howToReach.flight },
                    { Icon: Train, label: "By Train", value: currentDestination.howToReach.train },
                    { Icon: Bus,   label: "By Road",  value: currentDestination.howToReach.bus },
                  ].map(({ Icon, label, value }) => (
                    <div key={label} className="flex items-start gap-3 md:gap-4">
                      <div className="bg-[#fd561e] p-2 md:p-3 rounded-lg flex-shrink-0">
                        <Icon className="w-4 h-4 md:w-6 md:h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-stone-800 font-semibold text-sm md:text-base mb-0.5 md:mb-1">{label}</h4>
                        <p className="text-stone-600 text-xs md:text-sm leading-relaxed">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

            </div>
          </div>
        </motion.section>
      </AnimatePresence>
    </div>
  );
}