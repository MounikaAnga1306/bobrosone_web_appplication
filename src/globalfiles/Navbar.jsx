import { motion } from "framer-motion";
import { Briefcase, User, Menu, X } from "lucide-react";
import logo from "../assets/Bobros_image.png";
import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const userRef = useRef(null);

  // 🔥 Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userRef.current && !userRef.current.contains(event.target)) {
        setUserMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <motion.header
        className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 flex items-center justify-between absolute top-0 left-0 w-full z-50 bg-transparent"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* LEFT SECTION */}
        <div className="flex items-center gap-4">
          {/* Hamburger (Mobile Only) */}
          <button className="lg:hidden" onClick={() => setIsOpen(true)}>
            <Menu className="w-7 h-7 text-black" />
          </button>

          {/* Logo */}
          <Link to="/HomePage">
            <img
              src={logo}
              alt="Bobrose Logo"
              className="w-32 sm:w-40 lg:w-48 object-contain cursor-pointer"
            />
          </Link>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-4 relative">
          {/* Desktop Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <motion.button
              className="flex items-center gap-2 px-6 py-3 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all hover:bg-blue-50"
              whileHover={{ scale: 1.05, y: -2 }}
            >
              <Briefcase className="w-5 h-5" />
              <span className="font-semibold">Business</span>
            </motion.button>

            <motion.button
              className="flex items-center gap-2 px-6 py-3 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all hover:bg-blue-50"
              whileHover={{ scale: 1.05, y: -2 }}
            >
              <User className="w-5 h-5" />
              <span className="font-semibold">For Travel Agent</span>
            </motion.button>
          </div>

          {/* USER ICON + DROPDOWN */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => setUserMenu((prev) => !prev)}
              className="p-3 bg-white rounded-full shadow-md hover:shadow-lg transition"
            >
              <User className="w-5 h-5 text-black" />
            </button>

            {userMenu && (
              <div className="absolute right-0 mt-3 w-40 bg-white rounded-xl shadow-xl py-2 z-50">
                <Link
                  to="/login"
                  className="block px-4 py-2 hover:bg-gray-100 transition"
                  onClick={() => setUserMenu(false)}
                >
                  Login
                </Link>

                <Link
                  to="/signup"
                  className="block px-4 py-2 hover:bg-gray-100 transition"
                  onClick={() => setUserMenu(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </motion.header>

      {/* MOBILE DRAWER */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div
            className="flex-1 bg-black/40"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer */}
          <div className="w-72 bg-white h-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Menu</h2>
              <button onClick={() => setIsOpen(false)}>
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="space-y-5 text-gray-800">
              <Link
                to="/HomePage"
                className="block font-medium text-orange-600"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>

              <Link
                to="/business"
                className="block"
                onClick={() => setIsOpen(false)}
              >
                Business
              </Link>

              <Link
                to="/travel-agent"
                className="block"
                onClick={() => setIsOpen(false)}
              >
                For Travel Agent
              </Link>

              <Link
                to="/login"
                className="block"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>

              <Link
                to="/signup"
                className="block"
                onClick={() => setIsOpen(false)}
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
