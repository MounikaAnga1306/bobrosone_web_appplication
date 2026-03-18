import React, { useState } from "react";
import axios from "axios";
import { Phone, Lock, X, Eye, EyeOff } from "lucide-react";
import Swal from "sweetalert2";

const ResetPassword = ({ resetData, closeModal, openSignin }) => {

  const state = resetData;

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (otp.length !== 4) {
      Swal.fire({
        icon: "warning",
        title: "Invalid OTP",
        text: "OTP must be 4 digits.",
        confirmButtonColor: "#FD561E"
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: "warning",
        title: "Oops!!",
        text: "New Password and Confirm Password do not match.",
        confirmButtonColor: "#FD561E"
      });
      return;
    }

    try {

      await axios.post(
        "https://api.bobros.co.in/forgotpassword/changepassword",
        {
          mobile: state.mobile,
          otp: otp,
          newPassword: newPassword,
          confirmPassword: confirmPassword
        }
      );

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Your password has been reset successfully.",
        confirmButtonColor: "#FD561E"
      }).then(() => {
        openSignin();
      });

    } catch (err) {

      console.log("RESET PASSWORD ERROR:", err.response?.data);

      let message =
        err.response?.data?.msg ||
        err.response?.data?.message ||
        "Something went wrong. Please try again.";

      const lowerMsg = message.toLowerCase();

      if (lowerMsg.includes("expired")) {
        message = "Your OTP has expired. Please request a new OTP.";
      } 
      else if (lowerMsg.includes("invalid") || lowerMsg.includes("incorrect")) {
        message = "The OTP you entered is incorrect. Please try again.";
      } 
      else if (lowerMsg.includes("last three passwords")) {
        message = "You cannot reuse your last 3 passwords. Please choose a different password.";
      }

      Swal.fire({
        icon: "error",
        title: "Reset Password Failed",
        text: message,
        confirmButtonColor: "#FD561E"
      });

    }
  };

  const InputField = ({ icon: Icon, ...props }) => (
    <div
      className="flex items-center border border-gray-400 rounded-lg px-3 py-2 mb-4
      focus-within:border-[#FD561E]
      focus-within:shadow-[0_0_6px_rgba(253, 86, 30, 0.35)]
      transition-all duration-200"
    >
      <Icon className="w-5 h-5 text-black mr-2" />

      <input {...props} className="w-full outline-none" />
    </div>
  );

  return (
    <div className="flex items-center justify-center">
      <div className="relative bg-white p-8 rounded-2xl shadow-xl w-[420px]">

        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
        >
          <X size={22} />
        </button>

        <h2 className="text-2xl font-bold text-center text-gray-800">
          Reset Password
        </h2>

        <p className="text-center text-[#fd561e] text-lg mt-2">
          Secure your BOBROS Account
        </p>

        <p className="text-center text-gray-500 text-sm mt-2 mb-6">
          Enter the OTP sent to your mobile and create a new password
        </p>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        <form onSubmit={handleResetPassword}>

          {/* MOBILE NUMBER */}
          <InputField
            icon={Phone}
            type="text"
            value={state.mobile}
            readOnly
          />

          {/* OTP */}
          <InputField
            icon={Lock}
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "").slice(0, 4);
              setOtp(value);
            }}
            required
          />

          {/* NEW PASSWORD */}
          <div className="relative">
            <InputField
              icon={Lock}
              type={showNewPassword ? "text" : "password"}
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-3 text-black"
            >
              {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="relative">
            <InputField
              icon={Lock}
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3 text-black"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-[#FD561E] text-white cursor-pointer py-2 rounded-lg font-semibold hover:bg-[#e64d19] transition"
          >
            Reset Password
          </button>

        </form>

      </div>
    </div>
  );
};

export default ResetPassword;