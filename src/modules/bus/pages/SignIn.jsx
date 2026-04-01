import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Turnstile } from "@marsidev/react-turnstile";
import axios from "axios";
import { useGoogleLogin } from "@react-oauth/google";
import { Phone, Lock, Eye, EyeOff, X } from "lucide-react";

const API_URL = "https://api.bobros.co.in";

const LeftImagePanel = () => (
  <div
    className="hidden md:flex flex-col items-center justify-center rounded-l-2xl overflow-hidden flex-shrink-0"
    style={{
      alignSelf: "stretch",
      width: "400px",
      backgroundColor: "#fff8f5"
    }}
  >
    <img
      src="/assets/travel_image.png"
      alt="Tour & Travel"
      style={{
        width: "100%",
        height: "100%",
        objectFit: "fill",
        display: "block",
      }}
    />
  </div>
);

const SignIn = ({ closeModal, openSignup, openForgot }) => {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const googleLogin = useGoogleLogin({
    scope: "email profile",
    onSuccess: async (tokenResponse) => {
      try {
        const res = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const email = res.data.email;
        const verify = await axios.get(`${API_URL}/gmailverify`, { params: { email } });
        localStorage.setItem("user", JSON.stringify(verify.data));
        localStorage.setItem("isLoggedIn", "true");
        window.dispatchEvent(new Event("storage"));
        closeModal();
      } catch (error) {
        alert("Google account not registered or server error.");
      }
    },
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!captchaToken) { setError("Please verify captcha"); return; }
    try {
      const response = await axios.post(`${API_URL}/signin`, {
        mobile: Number(mobile),
        password: password,
        captchaToken: captchaToken,
      });
      localStorage.setItem("user", JSON.stringify(response.data));
      localStorage.setItem("isLoggedIn", "true");
      window.dispatchEvent(new Event("storage"));
      closeModal();
      navigate("/");
    } catch (error) { setError("Invalid mobile or password"); }
  };

  const InputField = ({ icon: Icon, ...props }) => (
    <div className="flex items-center border border-gray-300 rounded-xl px-4 py-2.5 mb-3 focus-within:border-[#FD561E] focus-within:ring-1 focus-within:ring-[#FD561E] transition-all">
      <Icon className="w-5 h-5 text-gray-500 mr-3" />
      <input {...props} className="w-full outline-none text-sm bg-transparent" />
    </div>
  );

  return (
    <div className="flex items-center justify-center p-4">
      {/* Container fixed to avoid scrolling */}
      <div className="relative bg-white rounded-2xl shadow-2xl flex items-stretch overflow-hidden w-full" style={{ maxWidth: "900px", height: "580px" }}>
        <LeftImagePanel />
        
        <div className="flex-1 p-8 md:p-10 bg-white flex flex-col justify-center overflow-hidden">
          <button onClick={closeModal} className="absolute top-5 right-5 cursor-pointer text-gray-400 hover:text-black z-10"><X size={24} /></button>
          
          <div className="mb-4 text-center">
            <h2 className="text-2xl font-bold text-gray-800">Login in with <span className="text-[#fd561e]">BOBROS</span></h2>
            <p className="text-gray-500 text-sm">Avail Exclusive Member Benefits</p>
          </div>

          {error && <p className="text-red-500 text-xs mb-3 text-center">{error}</p>}
          
          <form onSubmit={handleLogin}>
            <InputField icon={Phone} type="tel" placeholder="Enter mobile number" value={mobile} onChange={(e) => setMobile(e.target.value)} required />
            
            <div className="relative">
              <InputField icon={Lock} type={showPassword ? "text" : "password"} placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-2.5 text-gray-400">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>

            <div className="text-right text-xs -mt-1 mb-4"><span onClick={openForgot} className="text-[#FD561E] font-bold cursor-pointer hover:underline">Forgot Password?</span></div>
            
            <div className="mb-4 flex justify-center transform scale-90 origin-center">
              <Turnstile siteKey="0x4AAAAAABvRHvXzt4EuTFLs" onSuccess={(token) => setCaptchaToken(token)} />
            </div>

            <button type="submit" className="w-full bg-[#FD561E] text-white py-3 rounded-xl font-bold hover:bg-[#e64d19] shadow-lg transition-all">Login</button>
          </form>

          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-gray-100"></div>
            <span className="px-3 text-gray-400 text-xs">OR</span>
            <div className="flex-grow border-t border-gray-100"></div>
          </div>

          <button onClick={() => googleLogin()} className="w-full border border-gray-200 flex items-center justify-center gap-2 py-2.5 rounded-xl hover:bg-gray-50 text-sm font-medium transition-all">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="G" className="w-5 h-5" /> Sign in with Google
          </button>

          <p className="text-center text-sm mt-5">
            New to BOBROS? <span onClick={openSignup} className="text-[#FD561E] font-bold cursor-pointer hover:underline">Signup!</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;