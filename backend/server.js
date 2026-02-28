const express = require("express");
const axios = require("axios");
const helmet = require("helmet");
const path = require("path");
const cors = require("cors");
const oauth = require("./services/oauthService");
require("dotenv").config();

const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per IP
  message: "Too many requests, please try again later."
});

const app = express();

app.use(cors({
  origin: true,
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(limiter);
app.use(express.json());
app.use(helmet());

// Serve frontend only if public folder exists
app.use(express.static(path.join(__dirname, "public")));

// =========================
// CITIES ENDPOINT
// =========================
app.get("/cities", async (req, res) => {
  try {
    const name = req.query.name;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return res.status(400).json({ error: "Invalid city name" });
    }

    const sanitizedName = name.trim();
    const url = `${process.env.BASE_URL}/cities?name=${encodeURIComponent(sanitizedName)}`;

    const requestData = {
      url,
      method: "GET",
    };

    const headers = oauth.toHeader(
      oauth.authorize(requestData)
    );

    const response = await axios.get(url, { headers });

    const safeData = response.data.map(city => ({
      sid: city.sid,
      cityname: city.cityname,
      state: city.state
    }));

    res.json(safeData);

  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch cities" });
  }
});
// =========================
// SEARCH TRIPS ENDPOINT
// =========================
app.get("/searchTrips", async (req, res) => {
  try {
    const { source, destination, doj } = req.query;

    if (!source || !destination || !doj) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    // Construct the trips API URL
    const url = `${process.env.BASE_URL}/availabletrips?source=${source}&destination=${destination}&doj=${doj}`;
    console.log("backend URL",url);

    // Use the same oauthService library to sign the request
    const requestData = { url, method: "GET" };
    const headers = oauth.toHeader(oauth.authorize(requestData));

    // Make the request to the API
    const tripsResponse = await axios.get(url, { headers });

    // Return the data directly
    res.json(tripsResponse.data);

  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch trips" });
  }
});


// =========================
// React routing support (only useful in production)
// =========================
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});