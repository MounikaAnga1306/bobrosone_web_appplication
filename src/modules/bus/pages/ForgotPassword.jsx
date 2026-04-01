import React, { useState } from "react";

import axios from "axios";
import { Mail, Phone, X } from "lucide-react";
import Swal from "sweetalert2";

const ForgotPassword = ({ closeModal, openSignin, openResetPassword }) => {
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");

  const handleSendOtp = async (e) => {
    e.preventDefault();
    
    try {
      await axios.post("https://api.bobros.co.in/forgotpassword/changerequest", {
        email: email,
        mobile: mobile
      });

      Swal.fire({
        icon: "success",
        title: "OTP Sent",
        text: "OTP has been sent to your registered mobile number.",
        confirmButtonColor: "#FD561E"
      });

      openResetPassword({ email, mobile });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Oops!!",
        text: "Unable to send the OTP. Please make sure your mobile Number and Email are correct.",
        confirmButtonColor: "#FD561E"
      });
    }
  };

  const InputField = ({ icon: Icon, ...props }) => (
    <div className="flex items-center border border-gray-400 rounded-lg px-3 py-2 mb-4
    focus-within:border-[#FD561E]
    focus-within:shadow-[0_0_6px_rgba(253, 86, 30, 0.35)]
    transition-all duration-200">

      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-black mr-2 flex-shrink-0" />

      <input
        {...props}
        className="w-full outline-none text-sm sm:text-base"
      />
    </div>
  );

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-6 sm:px-6 md:px-8">
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-[420px] mx-auto p-5 sm:p-6 md:p-8">
        <button
          onClick={closeModal}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-500 hover:text-black cursor-pointer z-10"
        >
          <X size={20} className="sm:w-[22px] sm:h-[22px]" />
        </button>

        <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-800">
          Forgot Password
        </h2>

        <p className="text-center text-[#fd561e] text-base sm:text-lg mt-2">
          Retrieve your login Credentials
        </p>
        
        <p className="text-center text-gray-500 text-xs sm:text-sm mt-2 mb-4 sm:mb-6">
          Please enter your registered Email and Mobile number
        </p>

        {error && (
          <p className="text-red-500 text-xs sm:text-sm mb-4 text-center">{error}</p>
        )}

        <form onSubmit={handleSendOtp}>
          {/* EMAIL */}
          <InputField
            icon={Mail}
            type="email"
            placeholder="Enter Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* MOBILE */}
          <InputField
            icon={Phone}
            type="tel"
            placeholder="Enter Mobile Number"
            value={mobile}
            maxLength={10}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              setMobile(value);
            }}
            required
          />

          {/* SEND OTP */}
          <button
            type="submit"
            className="w-full bg-[#FD561E] text-white py-2.5 sm:py-2 rounded-lg cursor-pointer font-semibold hover:bg-[#e64d19] transition text-sm sm:text-base"
          >
            Send OTP
          </button>
        </form>

        {/* Back to login */}
        <p className="text-center text-xs sm:text-sm mt-5 sm:mt-6">
          Remember your password?{" "}
          <span
            onClick={openSignin}
            className="text-[#FD561E] font-semibold cursor-pointer hover:underline"
          >
            Sign in
          </span>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;