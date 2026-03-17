import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Turnstile } from "@marsidev/react-turnstile";
import axios from "axios";
import { useGoogleLogin } from "@react-oauth/google";
import { Phone, Lock,Eye, EyeOff,X} from "lucide-react";

const API_URL = "https://api.bobros.co.in";

const SignIn = ({ closeModal,openSignup,openForgot }) => {
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
      // 1️⃣ Get user details from Google
      const res = await axios.get(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        }
      );

      const email = res.data.email;
      const name = res.data.name;

      console.log("Google User:", email, name);

    const verify = await axios.get(`${API_URL}/gmailverify`, {
  params: {
    email // send email as query param
  },
});
console.log("Google Verify API Response:", verify.data);


localStorage.setItem("user", JSON.stringify(verify.data));
localStorage.setItem("isLoggedIn", "true");

window.dispatchEvent(new Event("storage"));


      console.log("API Response:", verify.data);

      // 3️⃣ If API success → login user
      //alert("Google Login Successful");
      closeModal();

    } catch (error) {
      if (error.response && error.response.status === 404) {
       
        alert("Google account not registered. Please sign up.");
        navigate("/signup", { state: { email, name } });
        
      } else {
        alert("Server error. Please try again.");
      }
    }
  },
  onError: () => {
    alert("Google Login Failed");
  },
});

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!captchaToken) {
      setError("Please verify captcha");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/signin`, {
        mobile: Number(mobile),
        password: password,
        captchaToken: captchaToken,
      });
      console.log("Signin API Response:", response.data);

      const data = response.data;

localStorage.setItem("user", JSON.stringify(data));
localStorage.setItem("isLoggedIn", "true");

window.dispatchEvent(new Event("storage"));


      navigate("/");

    } catch (error) {
      setError("Invalid mobile or password");
    }
  };

  return (
    <div className=" flex items-center justify-center">

      <div className=" relative bg-white shadow-2xl rounded-2xl p-8 w-[420px]">
         {/* CLOSE BUTTON */}
    <button
      onClick={closeModal}
      className="absolute top-4 right-4 cursor-pointer text-gray-500 hover:text-black"
    >
      <X size={22} />
    </button>


        {/* TITLE */}
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Login in with <span className="text-[#fd561e]">BOBROS</span>
        </h2>

        <p className="text-center text-gray-500 text-sm mb-6">
          Avail Exclusive Member Benefits
        </p>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        <form onSubmit={handleLogin}>

          {/* MOBILE */}
<div className="flex items-center border border-black rounded-lg px-3 py-2 mb-4
focus-within:border-[#FD561E]
focus-within:shadow-[0_0_6px_rgba(253, 86, 30, 0.35)]
transition-all duration-200">            
<Phone className="w-5 h-5 text-black-400 mr-2" />
            <input
              type="tel"
              placeholder="Enter mobile number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
              className="w-full outline-none"
            />
          </div>

          {/* PASSWORD */}
<div className="relative flex items-center border border-black rounded-lg px-3 py-2 mb-2
focus-within:border-[#FD561E]
focus-within:shadow-[0_0_6px_rgba(253, 86, 30, 0.35)]
transition-all duration-200">  
  <Lock className="w-5 h-5 text-black mr-2" />

  <input
    type={showPassword ? "text" : "password"}
    placeholder="Enter password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
    className="w-full outline-none pr-8"
  />

  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 text-black"
  >
    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
  </button>

</div>

          {/* FORGOT PASSWORD */}
          <div className="text-right text-sm mb-4">
            <span
              onClick={openForgot}
              className="text-[#FD561E] cursor-pointer hover:underline"
            >
              Forgot Password?
            </span>
          </div>

         {/* CAPTCHA */}
<div className="mb-4 flex justify-center">
  <Turnstile
    siteKey="0x4AAAAAABvRHvXzt4EuTFLs"
    onSuccess={(token) => setCaptchaToken(token)}
    onExpire={() => {
      setCaptchaToken("");
      setError("Captcha expired. Please verify again.");
    }}
    onError={() => {
      setCaptchaToken("");
      setError("Captcha verification failed");
    }}
  />
</div>

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            className="w-full bg-[#FD561E] text-white py-2 rounded-lg font-semibold hover:bg-[#e64d19] transition cursor-pointer"
          >
            Login
          </button>

        </form>

        {/* OR */}
        <div className="flex items-center my-6">
          <div className="flex-grow border-t"></div>
          <span className="px-3 text-gray-400 text-sm">OR</span>
          <div className="flex-grow border-t"></div>
        </div>

        {/* GOOGLE LOGIN */}
        <button
  onClick={() => googleLogin()}
  className="w-full border flex items-center cursor-pointer justify-center gap-2 py-2 rounded-lg hover:bg-gray-100"
>
  <img
    src="https://www.svgrepo.com/show/475656/google-color.svg"
    alt="Google"
    className="w-5 h-5"
  />
  Sign in with Google
</button>

        {/* SIGNUP LINK */}
        <p className="text-center text-sm mt-6">
          New to BOBROS?{" "}
          <span
            onClick={openSignup}
            className="text-[#FD561E] font-semibold cursor-pointer hover:underline"
          >
            Signup!
          </span>
        </p>

      </div>
      
    </div>
  );
};

export default SignIn;