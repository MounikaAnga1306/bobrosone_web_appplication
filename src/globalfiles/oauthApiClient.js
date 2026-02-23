import axios from "axios";
import OAuth from "oauth-1.0a";
import CryptoJS from "crypto-js";

const CONSUMER_KEY = import.meta.env.VITE_CONSUMER_KEY;
const CONSUMER_SECRET = import.meta.env.VITE_CONSUMER_SECRET;

// OAuth Setup
const oauth = new OAuth({
  consumer: {
    key: CONSUMER_KEY,
    secret: CONSUMER_SECRET,
  },
  signature_method: "HMAC-SHA1",
  hash_function(base_string, key) {
    return CryptoJS.HmacSHA1(base_string, key).toString(CryptoJS.enc.Base64);
  },
});

// Axios instance (no baseURL because multiple base urls)
const oauthApi = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

// Apply OAuth only for requests using oauthApi
oauthApi.interceptors.request.use((config) => {
  const requestData = {
    url: config.url, // full url must be passed
    method: config.method.toUpperCase(),
  };

  // ✅ authorize only using consumer keys (no token)
  const authHeader = oauth.toHeader(oauth.authorize(requestData));

  config.headers = {
    ...config.headers,
    ...authHeader,
  };

  return config;
});

export default oauthApi;
