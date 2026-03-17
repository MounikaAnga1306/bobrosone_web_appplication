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
  method: "POST",
 body: req.body
};

    const headers = oauth.toHeader(oauth.authorize(requestData));
    headers["Content-Type"] = "application/json";
     console.log("Block Ticket Body:", req.body);
    const response = await axios.post(url, req.body, { headers });
     console.log("Block Ticket SUCCESS Response:", response.data);

    res.json(response.data);

  } catch (error) {

  console.error("Block Ticket Error FULL:", {
    data: error.response?.data,
    status: error.response?.status,
    headers: error.response?.headers,
    message: error.message
  });
  console.error("Block Ticket Backend Error Detail:", 
      JSON.stringify(error.response?.data, null, 2)
  );

  res.status(500).json({
    success: false,
    message: error.response?.data || error.message
  });
}
});



// =========================
// RAZORPAY ORDER ENDPOINT (with OAuth)
// =========================
app.post("/razorpayment/order", async (req, res) => {
  try {
    const { fare, uid, name, ticketId, email } = req.body;

    if (!fare || !ticketId) {
      return res.status(400).json({ error: "Fare and ticketId are required" });
    }

    const razorpayBody = {
      fare,
      uid: uid || "Not Applicable",
      name: name || "Guest",
      ticketId,
      paymentfor: "BusTicket Rpay",
      email: email || "Not Applicable",
    };

    console.log("Razorpay Order Request Body:", razorpayBody);

    const url = `${process.env.BASE_URL}/razorpayment/order`; // Your OAuth-protected API
    const requestData = { url, method: "POST",body: razorpayBody };

    // ✅ Generate OAuth headers
    const headers = oauth.toHeader(oauth.authorize(requestData));
    headers["Content-Type"] = "application/json";

    // Call the OAuth-protected Razorpay order API
    const response = await axios.post(url, razorpayBody, { headers });

    console.log("Razorpay Order Response:", response.data);

    res.json(response.data);

  } catch (error) {
    console.error("Razorpay Order API Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to create Razorpay order" });
  }
});
// =========================
// BILLDESK ORDER ENDPOINT
// =========================
app.post("/billdesk/order", async (req, res) => {
  try {

    const { fare, uid, pname, tickid } = req.body;

    if (!fare || !tickid) {
      return res.status(400).json({
        success: false,
        message: "fare and ticketId required"
      });
    }

    const billdeskBody = new URLSearchParams({
      fare: fare,
      uid: uid || "Not Applicable",
      pname: pname || "Guest",
      tickid: tickid
    });

    console.log("BillDesk Order Request:", billdeskBody.toString());

    const response = await axios.post(
      "https://uat.bobros.co.in/billdesktest.php",
      billdeskBody,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );

    console.log("BillDesk API Response:", response.data);

    res.json(response.data);

  } catch (error) {

    console.error(
      "BillDesk Order Error:",
      error.response?.data || error.message
    );

    res.status(500).json({
      success: false,
      message: "BillDesk order creation failed"
    });
  }
});
app.post("/verifyPayment", async (req, res) => {
  try {

    const url = `${process.env.BASE_URL}/verifyPayment`;

    console.log("Verify Payment Request:", req.body);
   
    const requestData = {
      url,
      method: "POST"
    };

    // ✅ Generate OAuth headers
    const headers = oauth.toHeader(oauth.authorize(requestData));
    headers["Content-Type"] = "application/json";

    const response = await axios.post(
      url,
      req.body,
      { headers}
        
      
    );

    console.log("Verify Payment Response:", response.data);

    res.json(response.data);

  } catch (error) {

    console.error(
      "Verify Payment Error:",
      error.response?.data || error.message
    );

    res.status(500).json({
      success: false,
      message: "Payment verification failed"
    });

  }
});



// =========================
// REWARD POINTS API
// =========================
app.get("/rewardPoints", async (req, res) => {
  try {

    const { uid, fare } = req.query;

    if (!uid || !fare) {
      return res.status(400).json({
        success: false,
        message: "uid and fare required"
      });
    }

    const url = `${process.env.BASE_URL}/rewardPoints?uid=${uid}&fare=${fare}`;

    console.log("Reward Points API:", url);

    const requestData = {
      url,
      method: "GET"
    };

    const headers = oauth.toHeader(oauth.authorize(requestData));

    const response = await axios.get(url, { headers });

    res.json(response.data);

  } catch (error) {

    console.error(
      "Reward API Error:",
      error.response?.data || error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch reward points"
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