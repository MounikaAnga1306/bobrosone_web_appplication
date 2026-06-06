import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Menu, X, Briefcase, MapPin, User, ChevronDown } from "lucide-react";
import { Bus, Plane, Building2, Palmtree, Car } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import AuthModal from "../modules/bus/pages/AuthModal";
import SignIn from "../globalfiles/SignIn";
import SignupForm from "../globalfiles/SignupForm";
import ForgotPassword from "../modules/bus/pages/ForgotPassword";
import VerifyOTP from "../modules/bus/pages/VerifyOTP";
import ResetPassword from "../modules/bus/pages/ResetPassword";
import GuestBookings from "../modules/bus/pages/GuestBookings";
import CancellationCard from "../modules/bus/pages/CancellationCard";
import PrintTicketModal from "../modules/bus/pages/PrintTicketModal";
import PrintFlightTicketModal from "../modules/flights/pages/PrintFlightTicketModal";

/* ─────────────────────────────────────────────
   GiftBox SVG — no background, orange box with
   white ribbon, lid lifts on animate prop
───────────────────────────────────────────── */
const GiftBox = ({ animate }) => {
  // particles: [x, y, angle, color, size, delay]
  const particles = [
    { x: 12, y: 9, angle: -60, color: "#FFD700", r: 1.8, delay: 0 },
    { x: 12, y: 9, angle: -90, color: "#FD561E", r: 1.4, delay: 0.05 },
    { x: 12, y: 9, angle: -120, color: "#FFB300", r: 1.6, delay: 0.02 },
    { x: 12, y: 9, angle: -45, color: "#FF8C00", r: 1.2, delay: 0.08 },
    { x: 12, y: 9, angle: -135, color: "#FFD700", r: 1.5, delay: 0.04 },
    { x: 12, y: 9, angle: -75, color: "#FD561E", r: 1.0, delay: 0.06 },
    { x: 12, y: 9, angle: -105, color: "#FFB300", r: 1.3, delay: 0.03 },
  ];

  const dist = 7; // how far particles travel

  return (
    <svg
      width="22" height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", flexShrink: 0, overflow: "visible" }}
    >
      {/* ── PARTICLES — shoot out when animate=true ── */}
      {particles.map((p, i) => {
        const rad = (p.angle * Math.PI) / 180;
        const tx = Math.cos(rad) * dist;
        const ty = Math.sin(rad) * dist;
        return (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={p.r}
            fill={p.color}
            style={{
              transform: animate ? `translate(${tx}px, ${ty}px) scale(0)` : "translate(0,0) scale(1)",
              opacity: animate ? 0 : 1,
              transition: animate
                ? `transform 0.55s cubic-bezier(0.2,0.8,0.4,1) ${p.delay}s, opacity 0.4s ease ${0.15 + p.delay}s`
                : "none",
              transformOrigin: `${p.x}px ${p.y}px`,
            }}
          />
        );
      })}

      {/* ── BOX BODY ── */}
      <rect x="2" y="12" width="20" height="10" rx="1.5" fill="#FD561E" />
      {/* body ribbon vertical */}
      <rect x="10.5" y="12" width="3" height="10" fill="#FFB300" />
      {/* body ribbon horizontal */}
      <rect x="2" y="15.5" width="20" height="2" fill="#FFB300" />

      {/* ── LID — opens (rotates back) on animate ── */}
      <g style={{
        transformOrigin: "12px 12px",
        transform: animate
          ? "translateY(-3px) rotateX(60deg)"
          : "translateY(0px) rotateX(0deg)",
        transition: "transform 0.4s cubic-bezier(0.34,1.2,0.64,1)",
      }}>
        {/* lid body */}
        <rect x="1" y="8" width="22" height="5" rx="1.5" fill="#E8470A" />
        {/* lid ribbon horizontal */}
        <rect x="1" y="9.5" width="22" height="2" fill="#FFB300" />
        {/* lid ribbon vertical */}
        <rect x="10.5" y="8" width="3" height="5" fill="#FFB300" />
        {/* bow left */}
        <path d="M12 8 C10.5 5.5, 6 5, 6.5 8" fill="#FFB300" />
        {/* bow right */}
        <path d="M12 8 C13.5 5.5, 18 5, 17.5 8" fill="#FFB300" />
        {/* bow knot */}
        <ellipse cx="12" cy="8" rx="2" ry="1.4" fill="#E8A000" />
      </g>
    </svg>
  );
};

// ── Session timeout config ──
const SESSION_IDLE_LIMIT = 30 * 60 * 1000; // 30 nimishalu — idi marchu (e.g. 10*60*1000 = 10 min)

// login valid ah? expire ayithe clear chesi false istundi
const hasValidLogin = () => {
  if (localStorage.getItem("isLoggedIn") !== "true") return false;
  const last = Number(localStorage.getItem("lastActivity") || 0);
  if (!last || Date.now() - last > SESSION_IDLE_LIMIT) {
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("lastActivity");
    return false;
  }
  return true;
};

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [openAuthModal, setOpenAuthModal] = useState(false);
  const [authPage, setAuthPage] = useState("signin");
  const [signupData, setSignupData] = useState(null);
  const [resetData, setResetData] = useState(null);
  const [showGuestBookings, setShowGuestBookings] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [showPrintTicket, setShowPrintTicket] = useState(false);
  const [printTin, setPrintTin] = useState("");
  const [showFlightPrintTicket, setShowFlightPrintTicket] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);
  const [user, setUser] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(false);
  const closeTimeout = useRef(null);

  const [rewardBalance, setRewardBalance] = useState(null);

  // Gift box auto-animation
  const [giftOpen, setGiftOpen] = useState(false);
  const giftTimerRef = useRef(null);
  const giftIntervalRef = useRef(null);

  useEffect(() => {
    const run = () => {
      setGiftOpen(true);
      giftTimerRef.current = setTimeout(() => setGiftOpen(false), 800);
    };
    // first play after 2s, then every 4s
    giftTimerRef.current = setTimeout(() => {
      run();
      giftIntervalRef.current = setInterval(run, 4000);
    }, 2000);
    return () => {
      clearTimeout(giftTimerRef.current);
      clearInterval(giftIntervalRef.current);
    };
  }, []);

  const fetchRewardBalance = async (userId) => {
    if (!userId) return;
    try {
      const res = await axios.post("https://api.bobros.co.in/db/select", {
        table: "ulogin",
        columns: ["ubal"],
        conditions: { uid: String(userId) },
      });
      if (res.data?.rows?.length > 0) {
        const bal = String(parseFloat(res.data.rows[0].ubal ?? 0));
        setRewardBalance(bal);
      } else {
        setRewardBalance("0");
      }
    } catch (err) {
      console.error("Failed to fetch ubal from ulogin:", err);
    }
  };

  useEffect(() => {
    setOpenDropdown(false);
    setMobileDropdownOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleGuestBookings = () => setShowGuestBookings(true);
    const handleCancellation = () => {
      clearTimeout(closeTimeout.current);
      setShowCancel(true);
      window.dispatchEvent(new CustomEvent("navbarModalChange", { detail: { open: true } }));
    };
    const handlePrintTicket = () => {
      setPrintTin("");
      setShowPrintTicket(true);
      window.dispatchEvent(new CustomEvent("navbarModalChange", { detail: { open: true } }));
    };
    const handleFlightPrintTicket = () => {
      setShowFlightPrintTicket(true);
      window.dispatchEvent(new CustomEvent("navbarModalChange", { detail: { open: true } }));
    };
    window.addEventListener("openGuestBookings", handleGuestBookings);
    window.addEventListener("openCancellation", handleCancellation);
    window.addEventListener("openPrintTicket", handlePrintTicket);
    window.addEventListener("openFlightPrintTicket", handleFlightPrintTicket);
    return () => {
      window.removeEventListener("openGuestBookings", handleGuestBookings);
      window.removeEventListener("openCancellation", handleCancellation);
      window.removeEventListener("openPrintTicket", handlePrintTicket);
      window.removeEventListener("openFlightPrintTicket", handleFlightPrintTicket);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(false);
      }
      if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target)) {
        setMobileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // activity meeda session refresh + idle ayithe auto logout
useEffect(() => {
  const bump = () => {
    if (localStorage.getItem("isLoggedIn") === "true") {
      localStorage.setItem("lastActivity", String(Date.now()));
    }
  };
  const events = ["click", "keydown", "scroll", "touchstart"];
  events.forEach((ev) => window.addEventListener(ev, bump));

  const interval = setInterval(() => {
    if (localStorage.getItem("isLoggedIn") === "true" && !hasValidLogin()) {
      setIsLoggedIn(false);
      setUser(null);
      setRewardBalance(null);
      window.dispatchEvent(new Event("storage"));
    }
  }, 60 * 1000); // prati nimishaniki check

  return () => {
    events.forEach((ev) => window.removeEventListener(ev, bump));
    clearInterval(interval);
  };
}, []);

 useEffect(() => {
  
 const loggedIn = hasValidLogin();
if (loggedIn) return;

  const alreadyShown = sessionStorage.getItem("popupShown");
  if (alreadyShown) return;

  sessionStorage.setItem("popupShown", "true");

  setTimeout(() => {
    setOpenAuthModal(true);
  }, 1200);

}, []);

  useEffect(() => {
    const checkLogin = () => {
  const loggedIn = hasValidLogin();
  const userData = loggedIn ? JSON.parse(localStorage.getItem("user")) : null;
  setIsLoggedIn(loggedIn);
  setUser(userData?.user || userData || null);
};
    checkLogin();
    window.addEventListener("storage", checkLogin);
    return () => window.removeEventListener("storage", checkLogin);
  }, []);

  useEffect(() => {
    if (isLoggedIn && user) {
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      const uid = stored?.user?.uid || stored?.uid || user?.uid || "";
      fetchRewardBalance(uid);
    } else {
      setRewardBalance(null);
    }
  }, [isLoggedIn, user]);

  useEffect(() => {
    const handler = (e) => {
      setAuthPage(e.detail === "signup" ? "signup" : "signin");
      setOpenAuthModal(true);
    };
    window.addEventListener("openAuthModal", handler);
    return () => window.removeEventListener("openAuthModal", handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    setUser(null);
    setRewardBalance(null);
    setOpenDropdown(false);
    setMobileDropdownOpen(false);
    setMobileOpen(false);
    window.dispatchEvent(new Event("storage"));
    navigate("/");
  };

  const handleOpenCancel = () => {
    setOpenDropdown(false);
    setMobileDropdownOpen(false);
    clearTimeout(closeTimeout.current);
    setShowCancel(true);
    window.dispatchEvent(new CustomEvent("navbarModalChange", { detail: { open: true } }));
  };

  const dynamicPages = ["/", "/HomePage", "/flights", "/BillHomePage", "/hotels", "/cabs", "/Holiday"];
  const isDynamicPage = dynamicPages.includes(location.pathname);
  const isSolid = !isDynamicPage || scrolled;
  const isNoFixedPage =
    location.pathname === "/results" ||
    location.pathname.startsWith("/hotels/");

  const isBillPayment = location.pathname.toLowerCase().startsWith("/bill");

  useEffect(() => {
    if (!isDynamicPage) return;
    const handleScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.5);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isDynamicPage]);

  const tabs = [
    { id: "bus", label: "Bus", icon: Bus, path: "/HomePage" },
    { id: "billpayment", label: "Bill Payments", icon: Bus, path: "/BillHomePage" },
    { id: "flights", label: "Flights", icon: Plane, path: "/flights" },
    { id: "hotels", label: "Hotels", icon: Building2, path: "/hotels" },
    { id: "holidays", label: "Holidays", icon: Palmtree, path: "/Holiday" },
    { id: "cabs", label: "Cabs", icon: Car, path: "/cabs" },
  ];

  const getActiveTab = () => {
    const path = location.pathname;
    if (
      path === "/BillHomePage" ||
      path.startsWith("/billers") ||
      path.startsWith("/bill-details") ||
      path.startsWith("/bill-payment-status") ||
      path.startsWith("/bill-transactions") ||
      path.startsWith("/bill-complaints") ||
      (path.startsWith("/my-account") && location.search.includes("source=bill"))
    ) return "billpayment";
    if (
      path === "/" ||
      path === "/HomePage" ||
      path.startsWith("/results") ||
      path.startsWith("/booking-success") ||
      path.startsWith("/payment-status")
    ) return "bus";
    if (path.startsWith("/flights")) return "flights";
    if (path.startsWith("/hotels")) return "hotels";
    if (path.startsWith("/Holiday")) return "holidays";
    if (path.startsWith("/cabs")) return "cabs";
    return "";
  };

  const activeTab = getActiveTab();
  const userInitial = user?.uname?.charAt(0)?.toUpperCase() || "U";

  return (
    <>
      {/* Keyframes for dropdown slide-in */}
      <style>{`
        @keyframes ddFadeIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
      `}</style>

      <nav
        className={`${isNoFixedPage ? "relative" : "fixed top-0 left-0 right-0"} z-50 transition-all duration-300 ${
          isSolid ? "bg-white shadow-md" : "bg-transparent"
        }`}
      >
        <div className="max-w-8xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 sm:h-20">

          {/* LOGO */}
          <div onClick={() => navigate("/")} className="flex items-center cursor-pointer">
            <img
              src="/assets/Bobros_logo.png"
              alt="Bobros Logo"
              className={`h-auto transition-all duration-500 ease-in-out hover:scale-105
                w-[100px] sm:w-[140px] md:w-[180px] lg:w-[220px] xl:w-[250px]
                -ml-2 sm:-ml-1 md:-ml-0
                ${isSolid ? 'filter-none' : 'brightness-0 invert'}`}
            />
          </div>

          {/* CENTER TABS */}
          {(isSolid || !isDynamicPage) && (
            <div className="hidden lg:flex items-center gap-3 xl:gap-5 flex-1 justify-center">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      navigate(tab.path);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`flex items-center gap-2 px-3 xl:px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-all duration-300 border cursor-pointer ${
                      active
                        ? "bg-gradient-to-r from-[#FD561E] to-[#ff7b4a] text-white border-transparent shadow-lg"
                        : "border-gray-200 text-gray-600 hover:border-[#FD561E] hover:text-[#FD561E]"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* RIGHT SIDE */}
          <div className="hidden lg:flex items-center gap-3 xl:gap-4 flex-shrink-0">
            <button className={`flex items-center gap-2 px-3 xl:px-4 py-2 rounded-full border transition-all duration-300 cursor-pointer text-sm ${
              isSolid ? "border-gray-300 text-gray-700 hover:bg-gray-100" : "border-white/40 text-white hover:bg-white/10"
            }`}>
              <Briefcase className="w-4 h-4" />
              Business
            </button>

            <button className={`flex items-center gap-2 px-3 xl:px-4 py-2 whitespace-nowrap rounded-full border transition-all duration-300 cursor-pointer text-sm ${
              isSolid ? "border-gray-300 text-gray-700 hover:bg-gray-100" : "border-white/40 text-white hover:bg-white/10"
            }`}>
              <MapPin className="w-4 h-4" />
              For Travel Agent
            </button>

            {/* LOGIN AREA */}
            <div
              className="relative"
              ref={dropdownRef}
              onMouseEnter={() => {
                if (!isLoggedIn) {
                  clearTimeout(closeTimeout.current);
                  setOpenDropdown(true);
                }
              }}
              onMouseLeave={() => {
                if (!isLoggedIn) {
                  closeTimeout.current = setTimeout(() => setOpenDropdown(false), 300);
                }
              }}
            >
              {isLoggedIn ? (
                /* ── LOGGED IN: reward chip + avatar ── */
                <div className="flex items-center gap-2">

                  {/* REWARD CHIP — orange+gold combo */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "5px 10px",
                    background: "#FFFAF5",
                    border: "1.5px solid #FFB300",
                    borderRadius: 20,
                  }}>
                    <GiftBox animate={giftOpen} />
                    <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      <span style={{ fontSize: 8, fontWeight: 700, color: "#999", letterSpacing: "0.6px", textTransform: "uppercase", lineHeight: 1 }}>
                        Reward Points
                      </span>
                      <span style={{ display: "flex", alignItems: "baseline", gap: 1, lineHeight: 1 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#FD561E" }}>₹</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#FD561E" }}>{rewardBalance ?? "—"}</span>
                        <span style={{ fontSize: 8, color: "#bbb", fontWeight: 500, marginLeft: 1 }}>pts</span>
                      </span>
                    </div>
                  </div>

                  {/* AVATAR — only this toggles dropdown */}
                  <div
                    onClick={() => setOpenDropdown(!openDropdown)}
                    style={{
                      width: 36, height: 36,
                      borderRadius: "50%",
                      background: "#FD561E",
                      color: "white",
                      fontSize: 15, fontWeight: 600,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, cursor: "pointer",
                      transition: "transform 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                  >
                    {userInitial}
                  </div>

                  {/* LOGGED IN DROPDOWN */}
                  {openDropdown && (
                    <div
                      className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-lg border border-gray-100 text-gray-700 overflow-hidden z-50"
                      style={{ top: "100%", animation: "ddFadeIn 0.18s ease forwards" }}
                    >
                      {/* Reward points header */}
                      <div className="px-4 py-3 border-b border-gray-100" style={{ background: "#FFF3EE" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontSize: 13, color: "#666" }}>Reward Points</span>
                          <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#FD561E", fontWeight: 700, fontSize: 14 }}>
                            ₹ {rewardBalance ?? "—"}
                          </span>
                        </div>
                      </div>

                      {isBillPayment ? (
                        <>
                          <button onClick={() => { setOpenDropdown(false); navigate("/my-account?source=bill"); }} className="w-full text-left px-4 py-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer hover:text-blue-500">My Account</button>
                          <button onClick={() => { setOpenDropdown(false); navigate("/bill-transactions"); }} className="w-full text-left px-4 py-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer hover:text-blue-500">Transactions</button>
                          <button onClick={() => { setOpenDropdown(false); navigate("/bill-complaints"); }} className="w-full text-left px-4 py-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer hover:text-blue-500">Complaints</button>
                          <button onClick={handleLogout} className="w-full text-left px-4 py-3 hover:bg-gray-50 text-red-500 cursor-pointer">Logout</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setOpenDropdown(false); navigate("/my-bookings?type=bus"); }} className="w-full text-left px-4 py-3 border-b border-gray-200 hover:bg-gray-50 hover:text-blue-500 cursor-pointer">My Booking</button>
                          <button onClick={() => { setOpenDropdown(false); navigate("/my-account"); }} className="w-full text-left px-4 py-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer hover:text-blue-500">My Account</button>
                          <button onClick={handleOpenCancel} className="w-full text-left px-4 py-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer hover:text-blue-500">Cancellation</button>
                          <button onClick={() => {
                            setOpenDropdown(false);
                            window.dispatchEvent(new CustomEvent("navbarModalChange", { detail: { open: true } }));
                            if (location.pathname.startsWith("/flights")) { setShowFlightPrintTicket(true); }
                            else { setPrintTin(""); setShowPrintTicket(true); }
                          }} className="w-full text-left px-4 py-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer hover:text-blue-500">Print Ticket</button>
                          <button onClick={() => { setOpenDropdown(false); navigate("/my-profile"); }} className="w-full text-left px-4 py-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer hover:text-blue-500">My Profile</button>
                          <button onClick={handleLogout} className="w-full text-left px-4 py-3 hover:bg-gray-50 text-red-500 cursor-pointer">Logout</button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* ── GUEST: login button + dropdown on hover ── */
                <>
                  <button
                    onClick={() => { setAuthPage("signin"); setOpenAuthModal(true); }}
                    className={`flex items-center gap-2 px-3 xl:px-4 py-2 rounded-full border transition-all duration-300 cursor-pointer text-sm ${
                      isSolid ? "border-gray-300 text-gray-700 hover:bg-gray-100" : "border-white/40 text-white hover:bg-white/10"
                    }`}
                  >
                    <User className="w-5 h-5" />
                    Login/Signup
                  </button>

                  {/* GUEST DROPDOWN */}
                  {openDropdown && (
                    <div
                      className="absolute right-0 top-12 w-64 bg-white rounded-xl shadow-lg border border-gray-100 text-gray-700 overflow-hidden z-50"
                      style={{ animation: "ddFadeIn 0.18s ease forwards" }}
                    >
                      {isBillPayment ? (
                        <>
                          <div className="px-4 py-3 bg-gray-50">
                            <p className="font-semibold text-gray-800">Hey Traveller</p>
                            <p className="text-sm text-gray-500">Manage your bill payments & transactions</p>
                          </div>
                          <button onClick={() => { setOpenDropdown(false); setAuthPage("signin"); setOpenAuthModal(true); }} className="mx-4 my-3 w-[calc(100%-32px)] cursor-pointer bg-[#fd561e] text-white font-semibold py-2.5 rounded-lg">Login / Sign Up</button>
                          <button onClick={() => { setOpenDropdown(false); navigate("/bill-transactions"); }} className="w-full text-left px-4 py-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer hover:text-blue-500">Transactions</button>
                          <button onClick={() => { setOpenDropdown(false); navigate("/bill-complaints"); }} className="w-full text-left px-4 py-3 hover:bg-gray-50 cursor-pointer hover:text-blue-500">Complaints</button>
                        </>
                      ) : (
                        <>
                          <div className="px-4 py-3 bg-gray-50">
                            <p className="font-semibold text-gray-800">Hey Traveller</p>
                            <p className="text-sm text-gray-500">Get exclusive deals & Manage your trips</p>
                          </div>
                          <button onClick={() => { setOpenDropdown(false); setAuthPage("signin"); setOpenAuthModal(true); }} className="mx-4 my-3 w-[calc(100%-32px)] cursor-pointer bg-[#fd561e] text-white font-semibold py-2.5 rounded-lg">Login / Sign Up</button>
                          <button onClick={() => { setOpenDropdown(false); setShowGuestBookings(true); }} className="w-full text-left px-4 py-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer hover:text-blue-500">My Bookings</button>
                          <button onClick={() => {
                            setOpenDropdown(false);
                            if (location.pathname.startsWith("/flights")) { setShowFlightPrintTicket(true); }
                            else { setPrintTin(""); setShowPrintTicket(true); }
                            window.dispatchEvent(new CustomEvent("navbarModalChange", { detail: { open: true } }));
                          }} className="w-full text-left px-4 py-3 border-b border-gray-200 hover:bg-gray-50 hover:text-blue-500 cursor-pointer">Print Ticket</button>
                          <button onClick={handleOpenCancel} className="w-full text-left px-4 py-3 hover:bg-gray-50 cursor-pointer hover:text-blue-500">Cancellation</button>
                        </>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Mobile right: Bharat Connect + Hamburger */}
          <div className="flex items-center gap-2 lg:hidden">
            {isBillPayment && (
              <img
                src="/assets/Bharat_connect_logo.png"
                alt="Bharat Connect"
                className="md:hidden h-7 w-auto object-contain"
              />
            )}
            <button
              className={`p-2 rounded-lg transition-all duration-300 ${
                isSolid ? "text-gray-800 hover:bg-gray-100" : "text-white hover:bg-white/10"
              }`}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Side Drawer */}
        {mobileOpen && (
          <>
            <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
            <div className="fixed top-0 right-0 h-full w-[280px] sm:w-[320px] bg-white shadow-2xl z-50 lg:hidden overflow-y-auto">
              <div className="pt-16 pb-4">
                <button onClick={() => setMobileOpen(false)} className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-gray-100"><X size={18} /></button>

                {/* Tabs in Mobile */}
                <div className="flex flex-col gap-2 px-4">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => { navigate(tab.path); setMobileOpen(false); }}
                        className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all w-full ${
                          active
                            ? "bg-gradient-to-r from-[#FD561E] to-[#ff7b4a] text-white border-transparent"
                            : "border-gray-200 text-gray-700 hover:border-[#FD561E] hover:text-[#FD561E]"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="border-t border-gray-200 my-3 mx-4"></div>

                <div className="px-4">
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm mb-2">
                    <Briefcase className="w-4 h-4" />
                    Business
                  </button>
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm mb-4">
                    <MapPin className="w-4 h-4" />
                    For Travel Agent
                  </button>
                </div>

                <div className="border-t border-gray-200 my-3 mx-4"></div>

                {/* Mobile reward chip */}
                {isLoggedIn && (
                  <div className="px-4 mb-3">
                    <div style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "5px 12px",
                      background: "#FFFAF5",
                      border: "1.5px solid #FFB300",
                      borderRadius: 20,
                    }}>
                      <GiftBox animate={giftOpen} />
                      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        <span style={{ fontSize: 8, fontWeight: 700, color: "#999", letterSpacing: "0.6px", textTransform: "uppercase", lineHeight: 1 }}>Reward Points</span>
                        <span style={{ display: "flex", alignItems: "baseline", gap: 1, lineHeight: 1 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: "#FD561E" }}>₹</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#FD561E" }}>{rewardBalance ?? "—"}</span>
                          <span style={{ fontSize: 8, color: "#bbb", fontWeight: 500, marginLeft: 1 }}>pts</span>
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mobile User Section */}
                <div ref={mobileDropdownRef} className="px-4">
                  <button
                    onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      {isLoggedIn ? (
                        <div style={{
                          width: 32, height: 32, borderRadius: "50%",
                          background: "#FD561E", color: "white",
                          fontSize: 15, fontWeight: 600,
                          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        }}>
                          {userInitial}
                        </div>
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                      {isLoggedIn ? (
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#FD561E" }}>
                          {user?.uname || "My Account"}
                        </span>
                      ) : (
                        <span className="text-sm font-medium">Login/Signup</span>
                      )}
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* Mobile Dropdown */}
                  {mobileDropdownOpen && (
                    <div className="mt-2 bg-white rounded-lg border border-gray-200 overflow-hidden">
                      {isLoggedIn && (
                        <div className="px-4 py-2.5 border-b border-gray-200 flex items-center justify-between" style={{ background: "#FFF3EE" }}>
                          <span className="text-sm font-medium text-gray-700">Reward Points</span>
                          <span style={{ color: "#FD561E", fontWeight: 700, fontSize: 14 }}>
                            ₹ {rewardBalance ?? "—"}
                          </span>
                        </div>
                      )}

                      {isBillPayment ? (
                        !isLoggedIn ? (
                          <>
                            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
                              <p className="font-medium text-gray-800 text-sm">Hey Traveller</p>
                              <p className="text-xs text-gray-500">Manage your bill payments & transactions</p>
                            </div>
                            <button onClick={() => { setMobileOpen(false); setMobileDropdownOpen(false); setAuthPage("signin"); setOpenAuthModal(true); }} className="w-full text-left px-4 py-2.5 bg-[#fd561e] text-white font-medium text-sm">Login / Sign Up</button>
                            <button onClick={() => { setMobileOpen(false); setMobileDropdownOpen(false); navigate("/bill-transactions"); }} className="w-full text-left px-4 py-2.5 border-b border-gray-200 hover:bg-gray-50 text-sm">Transactions</button>
                            <button onClick={() => { setMobileOpen(false); setMobileDropdownOpen(false); navigate("/bill-complaints"); }} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm">Complaints</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => { setMobileOpen(false); setMobileDropdownOpen(false); navigate("/my-account?source=bill"); }} className="w-full text-left px-4 py-2.5 border-b border-gray-200 hover:bg-gray-50 text-sm">My Account</button>
                            <button onClick={() => { setMobileOpen(false); setMobileDropdownOpen(false); navigate("/bill-transactions"); }} className="w-full text-left px-4 py-2.5 border-b border-gray-200 hover:bg-gray-50 text-sm">Transactions</button>
                            <button onClick={() => { setMobileOpen(false); setMobileDropdownOpen(false); navigate("/bill-complaints"); }} className="w-full text-left px-4 py-2.5 border-b border-gray-200 hover:bg-gray-50 text-sm">Complaints</button>
                            <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-red-500 text-sm">Logout</button>
                          </>
                        )
                      ) : (
                        !isLoggedIn ? (
                          <>
                            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
                              <p className="font-medium text-gray-800 text-sm">Hey Traveller</p>
                              <p className="text-xs text-gray-500">Get exclusive deals & Manage your trips</p>
                            </div>
                            <button onClick={() => { setMobileOpen(false); setMobileDropdownOpen(false); setAuthPage("signin"); setOpenAuthModal(true); }} className="w-full text-left px-4 py-2.5 bg-[#fd561e] text-white font-medium text-sm">Login / Sign Up</button>
                            <button onClick={() => { setMobileOpen(false); setMobileDropdownOpen(false); setShowGuestBookings(true); }} className="w-full text-left px-4 py-2.5 border-b border-gray-200 hover:bg-gray-50 text-sm">My Bookings</button>
                            <button onClick={() => {
                              setMobileOpen(false); setMobileDropdownOpen(false);
                              window.dispatchEvent(new CustomEvent("navbarModalChange", { detail: { open: true } }));
                              if (location.pathname.startsWith("/flights")) { setShowFlightPrintTicket(true); }
                              else { setPrintTin(""); setShowPrintTicket(true); }
                            }} className="w-full text-left px-4 py-2.5 border-b border-gray-200 hover:bg-gray-50 text-sm">Print Ticket</button>
                            <button onClick={() => { setMobileOpen(false); setMobileDropdownOpen(false); handleOpenCancel(); }} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm">Cancellation</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => { setMobileOpen(false); setMobileDropdownOpen(false); navigate("/my-bookings?type=bus"); }} className="w-full text-left px-4 py-2.5 border-b border-gray-200 hover:bg-gray-50 text-sm">My Booking</button>
                            <button onClick={() => { setMobileOpen(false); setMobileDropdownOpen(false); navigate("/my-account"); }} className="w-full text-left px-4 py-2.5 border-b border-gray-200 hover:bg-gray-50 text-sm">My Account</button>
                            <button onClick={() => { setMobileOpen(false); setMobileDropdownOpen(false); handleOpenCancel(); }} className="w-full text-left px-4 py-2.5 border-b border-gray-200 hover:bg-gray-50 text-sm">Cancellation</button>
                            <button onClick={() => {
                              setMobileOpen(false); setMobileDropdownOpen(false);
                              window.dispatchEvent(new CustomEvent("navbarModalChange", { detail: { open: true } }));
                              if (location.pathname.startsWith("/flights")) { setShowFlightPrintTicket(true); }
                              else { setPrintTin(""); setShowPrintTicket(true); }
                            }} className="w-full text-left px-4 py-2.5 border-b border-gray-200 hover:bg-gray-50 text-sm">Print Ticket</button>
                            <button onClick={() => { setMobileOpen(false); setMobileDropdownOpen(false); navigate("/my-profile"); }} className="w-full text-left px-4 py-2.5 border-b border-gray-200 hover:bg-gray-50 text-sm">My Profile</button>
                            <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-red-500 text-sm">Logout</button>
                          </>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Auth Modal */}
        <AuthModal isOpen={openAuthModal} onClose={() => setOpenAuthModal(false)}>
          {authPage === "signin" && <SignIn closeModal={() => setOpenAuthModal(false)} openSignup={() => setAuthPage("signup")} openForgot={() => setAuthPage("forgot")} />}
          {authPage === "signup" && <SignupForm closeModal={() => setOpenAuthModal(false)} openSignin={() => setAuthPage("signin")} openVerifyOtp={(data) => { setSignupData(data); setAuthPage("verifyotp"); }} />}
          {authPage === "verifyotp" && <VerifyOTP signupData={signupData} closeModal={() => setOpenAuthModal(false)} />}
          {authPage === "forgot" && <ForgotPassword closeModal={() => setOpenAuthModal(false)} openSignin={() => setAuthPage("signin")} openResetPassword={(data) => { setResetData(data); setAuthPage("reset"); }} />}
          {authPage === "reset" && <ResetPassword resetData={resetData} closeModal={() => setOpenAuthModal(false)} openSignin={() => setAuthPage("signin")} />}
        </AuthModal>

        {/* Guest Bookings Modal */}
        {showGuestBookings && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-[90%] sm:w-[420px] mx-4 relative max-h-[90vh] overflow-y-auto">
              <button onClick={() => setShowGuestBookings(false)} className="absolute top-4 right-4 cursor-pointer text-gray-400 hover:text-gray-700">✕</button>
              <GuestBookings onClose={() => setShowGuestBookings(false)} />
            </div>
          </div>
        )}
      </nav>

      {showCancel && (
        <CancellationCard onClose={() => {
          setShowCancel(false);
          window.dispatchEvent(new CustomEvent("navbarModalChange", { detail: { open: false } }));
        }} />
      )}
      {showPrintTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-[90%] sm:w-[420px] mx-4 relative">
            <button onClick={() => {
              setShowPrintTicket(false);
              window.dispatchEvent(new CustomEvent("navbarModalChange", { detail: { open: false } }));
            }} className="absolute top-4 right-4 text-gray-400 cursor-pointer hover:text-gray-700">✕</button>
            <PrintTicketModal onClose={() => setShowPrintTicket(false)} prefillTin={printTin} />
          </div>
        </div>
      )}
      {showFlightPrintTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-[90%] sm:w-[440px] mx-4 relative">
            <button onClick={() => {
              setShowFlightPrintTicket(false);
              window.dispatchEvent(new CustomEvent("navbarModalChange", { detail: { open: false } }));
            }}>✕</button>
            <PrintFlightTicketModal onClose={() => setShowFlightPrintTicket(false)} />
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;