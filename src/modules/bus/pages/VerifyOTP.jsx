import React, { useState } from "react";
import {useNavigate } from "react-router-dom";
import axios from "axios";
import { X } from "lucide-react";

const VerifyOTP = ({ signupData, closeModal, openSignin }) => {

  const state = signupData;
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  if (!state) {
  navigate("/signup");
  return null;
}

 const handleVerify = async () => {
  try {

    const response = await axios.post("https://api.bobros.co.in/signup/register", {
      user: state.user,
      email: state.email,
      mobile: Number(state.mobile),
      password: state.password,
      otp: Number(otp)
    });

    // ⭐ Store user after successful signup
    localStorage.setItem("user", JSON.stringify(response.data));
    localStorage.setItem("isLoggedIn", "true");

    // ⭐ update navbar instantly
    window.dispatchEvent(new Event("storage"));

    alert("Successfully Registered");

      closeModal();
  } catch (err) {
    alert("Registration failed");
  }
};

  return (

    <div className="min-h-screen flex items-center justify-center ">

      <div className=" relative bg-white p-8 rounded-2xl shadow-xl w-[420px] text-center">
        <button
  onClick={closeModal}
  className="absolute top-4 right-4 text-gray-500 hover:text-black"
>
  <X size={22} />
</button>

        <h2 className="text-2xl font-bold mb-3">
          Confirm your identity to signup with BOBROS
        </h2>

        <p className="text-gray-500 text-sm mb-6">
          We have sent OTP on registered mobile <br />
          Please enter the one time password received <br/> on your mobile
        </p>

        {/* MOBILE */}
        <input
          type="text"
          value={state.mobile}
          readOnly
          className="w-full border border-gray-400 rounded-lg px-3 py-2 mb-4 bg-gray-100
          focus:border-[#FD561E]
          focus-within:shadow-[0_0_6px_rgba(253,86,30,0.35)]
          outline-none
          transition-all duration-200"
        />

        {/* OTP */}
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e)=>setOtp(e.target.value)}
          className="w-full border border-gray-400 rounded-lg px-3 py-2 mb-6
          focus:border-[#FD561E]
          focus:shadow-[0_0_6px_rgba(253,86,30,0.35)]
          outline-none
          transition-all duration-200"
        />

        <button
          onClick={handleVerify}
          className="w-full bg-[#FD561E] text-white py-2 rounded-lg font-semibold hover:bg-[#e64d19]"
        >
          Submit
        </button>

      </div>

    </div>

  );
};

export default VerifyOTP;