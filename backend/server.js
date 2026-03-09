const express = require("express");
const axios = require("axios");
const helmet = require("helmet");
const path = require("path");
const cors = require("cors");
const oauth = require("./services/oauthService");
require("dotenv").config();

const rateLimit = require("express-rate-limit");

const app = express();

// =========================
// SECURITY & MIDDLEWARE
// =========================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later.",
});

app.use(cors({
  origin: true,
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(limiter);
app.use(express.json());
app.use(helmet());

// Serve frontend in production
app.use(express.static(path.join(__dirname, "public")));


// ======================================================
// HELPER FUNCTION: Transform Seats For Frontend Layout
// ======================================================
const transformSeats = (seats) => {
  if (!Array.isArray(seats)) return [];

  return seats.map((seat, index) => {

    const baseFare = Number(seat.baseFare ?? 0);
    const serviceTax = Number(seat.serviceTaxAbsolute ?? 0);

    return {
      id: seat.id || index + 1,
      name: seat.name || `S${index + 1}`,
      available: seat.available ?? true,
      ladiesSeat: seat.ladiesSeat ?? false,

      baseFare: baseFare,

      // ⭐ totalFare
      totalFare: baseFare + serviceTax,

      // Layout fields
      zIndex: Number(seat.zIndex ?? 0),
      row: Number(seat.row ?? Math.floor(index / 4)),
      column: Number(seat.column ?? index % 4),
      length: Number(seat.length ?? 1),
      width: Number(seat.width ?? 1),
    };

  });
};


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

    const requestData = { url, method: "GET" };
    const headers = oauth.toHeader(oauth.authorize(requestData));

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

    const url = `${process.env.BASE_URL}/availabletrips?source=${source}&destination=${destination}&doj=${doj}`;
    console.log("Trips API:", url);

    const requestData = { url, method: "GET" };
    const headers = oauth.toHeader(oauth.authorize(requestData));

    const tripsResponse = await axios.get(url, { headers });

    res.json(tripsResponse.data);

  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch trips" });
  }
});


// =========================
// TRIP DETAILS ENDPOINT (UPDATED FOR SEAT LAYOUT)
// =========================
app.get("/tripdetails", async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: "Trip ID is required" });
    }

    const url = `${process.env.BASE_URL}/tripdetails?id=${id}`;

    console.log("Trip details API:", url);
    console.log("Trip ID:", id);

    const requestData = { url, method: "GET" };
    const headers = oauth.toHeader(oauth.authorize(requestData));

    const response = await axios.get(url, { headers });

    const tripData = response.data;

    // ✅ LOG ACTUAL RESPONSE
    //console.log("Trip Details Response:", tripData);

    const transformedSeats = transformSeats(tripData.seats);

    res.json({
      ...tripData,
      seats: transformedSeats,
    });

  } catch (error) {
    console.error("Trip details error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch trip details" });
  }
});
// =========================
// BLOCK TICKET ENDPOINT
// =========================
app.post("/blockTicket", async (req, res) => {
  try {

    const url = `${process.env.BASE_URL}/blockTicket`;

    const requestData = {
  url,
  method: "POST"
};

    const headers = oauth.toHeader(oauth.authorize(requestData));
    headers["Content-Type"] = "application/json";
     console.log("Block Ticket Body:", req.body);
    const response = await axios.post(url, req.body, { headers });

    res.json(response.data);

  } catch (error) {
    console.error("Block Ticket Error:", error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: "Failed to block ticket"
    });
  }
});


// =========================
// React Routing Support
// =========================
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});


// =========================
// START SERVER
// =========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});