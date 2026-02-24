// import React from "react";
// import { FaUserCircle, FaBars } from "react-icons/fa";
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";

// const Navbar = () => {
//   const [open, setOpen] = useState(false);
//   const navigate = useNavigate();

//   const menuItems = [
//     { name: "Bus", icon: "/assets/bus.png", path: "/" },
//     { name: "Flights", icon: "/assets/flight.png", path: "/flights" },
//     { name: "Bills", icon: "/assets/bill.png", path: "/bills" },
//     { name: "IT Service", icon: "/assets/service.png", custom: true, path: "/it-service" },
//     { name: "Cab Service", icon: "/assets/cab.png", custom: true, path: "/cab" },
//     { name: "Holidays", icon: "/assets/holiday.png", path: "/holidays" },
//   ];

//   const handleNavigation = (path) => {
//     navigate(path);
//     setOpen(false); // Close mobile menu on click
//   };

//   return (
//     <nav className="w-full bg-white shadow-md fixed top-0 left-0 z-50">
//       <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
//         {/* LOGO with home navigation */}
//         <div
//           className="flex items-center overflow-visible cursor-pointer"
//           onClick={() => navigate("/")}
//         >
//           <img
//             src="https://bobrosone.com/images/logo_hum.jpg"
//             alt="Bobros Logo"
//             className="h-12 sm:h-14 ml-0 md:ml-[-10px] lg:ml-[-40px]"
//           />
//         </div>

//         {/* DESKTOP MENU */}
//         <div className="hidden md:flex items-center gap-6 lg:gap-10">
//           {menuItems.map((item, index) => (
//             <div
//               key={index}
//               className="flex flex-col items-center cursor-pointer group"
//               onClick={() => handleNavigation(item.path)}
//             >
//               <img
//                 src={item.icon}
//                 alt={item.name}
//                 className={`
//                   ${
//                     item.custom
//                       ? "h-8 sm:h-10 md:h-12 lg:h-14 -mt-2"
//                       : "h-10 sm:h-8 md:h-9 lg:h-7 mb-2"
//                   }
//                   w-auto
//                   group-hover:scale-105
//                   transition
//                 `}
//               />
//               <span
//                 className={`text-sm font-bold text-gray-600 group-hover:text-[#fd561e]
//                   ${
//                     item.name === "IT Service" || item.name === "Cab Service"
//                       ? "-mt-1"
//                       : "mt-1"
//                   }
//                 `}
//               >
//                 {item.name}
//               </span>
//             </div>
//           ))}
//         </div>

//         {/* LOGIN */}
//         <div
//           className="hidden md:flex items-center gap-2 px-4 py-1.5 border border-black rounded-full text-black transition duration-300 cursor-pointer hover:bg-[#fd561e] hover:text-white hover:border-[#fd561e] group"
//           onClick={() => navigate("/login")}
//         >
//           <FaUserCircle size={22} className="group-hover:text-white" />
//           <span className="font-semibold text-sm">Login/SignUp</span>
//         </div>

//         {/* MOBILE MENU BUTTON */}
//         <div
//           className="md:hidden text-2xl cursor-pointer"
//           onClick={() => setOpen(!open)}
//         >
//           <FaBars />
//         </div>
//       </div>

//       {/* MOBILE MENU */}
//       {open && (
//         <div className="md:hidden bg-white shadow-lg border-t">
//           <div className="flex flex-col items-center gap-4 py-4">
//             {menuItems.map((item, index) => (
//               <div
//                 key={index}
//                 className="flex flex-col items-center cursor-pointer"
//                 onClick={() => handleNavigation(item.path)}
//               >
//                 <img
//                   src={item.icon}
//                   alt={item.name}
//                   className={`${item.custom ? "h-9" : "h-6"} w-auto`}
//                 />
//                 <span className="text-sm font-semibold text-gray-700 mt-1">
//                   {item.name}
//                 </span>
//               </div>
//             ))}

//             <div
//               className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 hover:text-[#fd561e] transition cursor-pointer"
//               onClick={() => navigate("/login")}
//             >
//               <FaUserCircle size={20} />
//               <span className="font-semibold text-sm">Login/SignUp</span>
//             </div>
//           </div>
//         </div>
//       )}
//     </nav>
//   );
// };

// export default Navbar;
import { motion } from "framer-motion";
import { Briefcase, User } from "lucide-react";
import logo from "../assets/Bobros_logo.png";

export default function Navbar() {
  return (
    <motion.header
      className="px-8 py-6 flex items-center justify-between absolute top-0 left-0 w-full z-50 bg-transparent"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <img src={logo} alt="Bobrose Logo" className="w-48 object-contain" />
      </motion.div>

      <div className="flex items-center gap-3">
        <motion.button
          className="flex items-center gap-2 px-6 py-3 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all hover:bg-blue-50"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Briefcase className="w-5 h-5" />
          <span className="font-semibold">Business</span>
        </motion.button>

        <motion.button
          className="flex items-center gap-2 px-6 py-3 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all hover:bg-blue-50"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <User className="w-5 h-5" />
          <span className="font-semibold">For Travel Agent</span>
        </motion.button>

        <motion.button
          className="px-6 py-3 bg-orange-600 text-white font-semibold rounded-2xl shadow-md hover:bg-orange-700 hover:shadow-xl transition-all"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          Login/SignUp
        </motion.button>
      </div>
    </motion.header>
  );
}
