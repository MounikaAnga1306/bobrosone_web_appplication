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
// BLOCK TICKET ENDPOINT (CORRECTED)
// =========================
app.post("/blockTicket", async (req, res) => {
  try {
    const url = `${process.env.BASE_URL}/blockTicket`;
    
    // IMPORTANT: Create requestData with body FIRST
    const requestData = {
      url: url,
      method: "POST",
      body: req.body  // This must be included for OAuth signature
    };
    
    // Generate OAuth headers with the request data including body
    const headers = oauth.toHeader(oauth.authorize(requestData));
    headers["Content-Type"] = "application/json";
    
    console.log("Block Ticket Request Body:", JSON.stringify(req.body, null, 2));
    console.log("Block Ticket URL:", url);
    
    // Make the API call
    const response = await axios.post(url, req.body, { headers });
    
    console.log("Block Ticket SUCCESS Response:", response.data);
    
    // Return the response to frontend
    res.json(response.data);
    
  } catch (error) {
    console.error("Block Ticket Error FULL:", {
      data: error.response?.data,
      status: error.response?.status,
      message: error.message
    });
    
    // Send appropriate error response
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        "Failed to block ticket";
    
    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: error.response?.data
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
// MY BOOKINGS ENDPOINT
// =========================
app.post("/myBookings", async (req, res) => {
  try {
    const { uid, mobile } = req.body;

    if (!uid && !mobile) {
      return res.status(400).json({ success: false, message: "uid or mobile required" });
    }

    const url = `${process.env.BASE_URL}/db/select`;

    const response = await axios.post(url, {
      table: "uticket",
      columns: ["*"],
      conditions: {
        or: [
          { uid: String(uid) },
          { uid: String(mobile) }
        ]
      }
    }, {
      headers: { "Content-Type": "application/json" }
    });

    const allRows = response.data?.rows || [];
    
    // ✅ ఇక్కడ add చేయి
    console.log("All Rows:", JSON.stringify(allRows, null, 2));

    const confirmedBookings = allRows.filter(b =>
      b.tin_ticket && b.tin_ticket !== "0"
    );

    // ✅ ఇక్కడ add చేయి
    console.log("Confirmed:", JSON.stringify(confirmedBookings, null, 2));

    res.json({ success: true, bookings: confirmedBookings });

  } catch (error) {
    console.error("My Bookings Error:", error.response?.data || error.message);
    res.status(500).json({ success: false, message: "Failed to fetch bookings" });
  }
});

// =========================
// GUEST BOOKINGS - VERIFY OTP
// =========================
app.post("/guestBookings/verify", async (req, res) => {
  try {
    const { email, mobile } = req.body;

    if (!email || !mobile) {
      return res.status(400).json({ success: false, message: "email and mobile required" });
    }

    const url = `${process.env.BASE_URL}/mybookings/verify`;  // ← env నుండి

    const response = await axios.post(url, { email, mobile }, {
      headers: { "Content-Type": "application/json" }
    });

    console.log("Guest Verify Response:", response.data);
    res.json({ success: true, data: response.data });

  } catch (error) {
    console.error("Guest Verify Error:", error.response?.data || error.message);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
});

// =========================
// GUEST BOOKINGS - FETCH DATA WITH OTP
// =========================
// server.js - guestBookings/data
app.post("/guestBookings/data", async (req, res) => {
  try {
    const { email, mobile, otp } = req.body;

    if (!email || !mobile || !otp) {
      return res.status(400).json({ success: false, message: "email, mobile and otp required" });
    }

    const dataUrl = `${process.env.BASE_URL}/mybookings/data`;
    const dataRes = await axios.post(dataUrl, { email, mobile, otp }, {
      headers: { "Content-Type": "application/json" }
    });

    console.log("Guest Data Response:", dataRes.data);

    const allBookings = dataRes.data?.bookingDetails || dataRes.data?.bookings || dataRes.data?.rows || [];

    const guestBookings = allBookings.filter(b => b.uid === String(mobile));

    return res.json({ success: true, bookings: guestBookings });

  } catch (error) {
    console.error("Guest Data Error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: error.response?.data?.message || "Failed to fetch bookings"
    });
  }
});

// =========================
// BOOK TICKET WITH REWARD POINTS
// =========================
app.post("/bookticket/rp", async (req, res) => {
  try {
    const { blockedTicketId, payeeid, name, email, fare, paymentfor } = req.body;

    if (!blockedTicketId || !payeeid) {
      return res.status(400).json({ 
        success: false, 
        message: "blockedTicketId and payeeid required" 
      });
    }

    const url = `${process.env.BASE_URL}/bookticket/rp`;

    const requestData = { url, method: "POST", body: req.body };
    const headers = oauth.toHeader(oauth.authorize(requestData));
    headers["Content-Type"] = "application/json";

    console.log("Book Ticket RP Body:", req.body);

    const response = await axios.post(url, req.body, { headers });

    console.log("Book Ticket RP Response:", response.data);

    res.json(response.data);

  } catch (error) {
    console.error("Book Ticket RP Error:", error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      message: error.response?.data?.message || "Failed to book ticket with reward points" 
    });
  }
});

// =========================
// CANCEL VERIFY USER
// =========================
app.post("/cancel/verify", async (req, res) => {
  try {
    const { ticket, mobile, email } = req.body;

    if (!ticket || !mobile || !email) {
      return res.status(400).json({
        success: false,
        message: "ticket, mobile, email required"
      });
    }

    const url = `${process.env.BASE_URL}/cancelt/verifyuser`;

    console.log("Cancel Verify Body:", req.body);

   const requestData = {
  url,
  method: "POST",
  body: req.body
};

const headers = oauth.toHeader(oauth.authorize(requestData));
headers["Content-Type"] = "application/json";

const response = await axios.post(url, req.body, { headers });
    console.log("Cancel Verify Response:", response.data);

    res.json(response.data);

  } catch (error) {
    console.error("Cancel Verify Error:", error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: error.response?.data || "Verification failed"
    });
  }
});

// =========================
// CANCEL DATA (OTP VERIFY)
// =========================
app.post("/cancel/data", async (req, res) => {
  try {
    const { mobile, ticketId, otp } = req.body;

    if (!mobile || !ticketId || !otp) {
      return res.status(400).json({
        success: false,
        message: "mobile, ticketId, otp required"
      });
    }

    const url = `${process.env.BASE_URL}/cancelt/cancellationData`;

    console.log("Cancel Data Body:", req.body);

    const requestData = {
  url,
  method: "POST",
  body: req.body
};

const headers = oauth.toHeader(oauth.authorize(requestData));
headers["Content-Type"] = "application/json";

const response = await axios.post(url, req.body, { headers });

    console.log("Cancel Data Response:", response.data);

    res.json(response.data);

  } catch (error) {
    console.error("Cancel Data Error:", error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: error.response?.data || "OTP verification failed"
    });
  }
});

// =========================
// CANCEL TICKET
// =========================
app.post("/cancel/ticket", async (req, res) => {
  try {
    const { tin, seatsToCancel } = req.body;

    if (!tin || !seatsToCancel?.length) {
      return res.status(400).json({
        success: false,
        message: "tin and seatsToCancel required"
      });
    }

    const url = `${process.env.BASE_URL}/cancelt/cancelTicket`;

    console.log("Cancel Ticket Body:", req.body);

   const requestData = {
  url,
  method: "POST",
  body: req.body
};

const headers = oauth.toHeader(oauth.authorize(requestData));
headers["Content-Type"] = "application/json";

const response = await axios.post(url, req.body, { headers });

    console.log("Cancel Ticket Response:", response.data);

    res.json(response.data);

  } catch (error) {
    console.error("Cancel Ticket Error:", error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: error.response?.data || "Cancellation failed"
    });
  }
});

// =========================
// MY ACCOUNT ENDPOINT
// =========================
app.post("/myAccount", async (req, res) => {
  try {
    const { uid } = req.body;
    if (!uid) return res.status(400).json({ success: false, message: "uid required" });

    const url = `${process.env.BASE_URL}/db/select`;
    const response = await axios.post(url, {
      table: "t_account",
      columns: ["*"],
      conditions: { id: String(uid) }
    }, { headers: { "Content-Type": "application/json" } });

    const rows = response.data?.rows || [];
    res.json({ success: true, transactions: rows });
  } catch (error) {
    console.error("My Account Error:", error.response?.data || error.message);
    res.status(500).json({ success: false, message: "Failed to fetch account data" });
  }
});

// =========================
// OFFER APPLY ENDPOINT
// =========================
app.post("/offer/apply", async (req, res) => {
  try {
    console.log("Offer Apply Body:", req.body);
 
    const response = await axios.post(
      "https://api.bobros.co.in/offer/apply-offer/",
      req.body,
      { headers: { "Content-Type": "application/json" } }
    );
 
    console.log("Offer Apply Response:", response.data);
    res.json(response.data);
 
  } catch (error) {
    console.error("Offer Apply Error:", error.response?.data || error.message);
 
    // Return backend error message to frontend (important!)
    res.status(error.response?.status || 500).json(
      error.response?.data || { success: false, message: "Offer apply failed" }
    );
  }
});

// =========================
// PRINT TICKET ENDPOINT
// =========================
app.get("/printTicket", async (req, res) => {
  try {
    const { tin } = req.query;

    if (!tin) {
      return res.status(400).json({ success: false, message: "tin is required" });
    }

    const url = `${process.env.BASE_URL}/email/print-ticket?tin=${tin}`;
    console.log("Print Ticket API:", url);

    const requestData = { url, method: "GET" };
    const headers = oauth.toHeader(oauth.authorize(requestData));

    const response = await axios.get(url, { headers });

    console.log("Print Ticket Response:", response.data);

    res.json(response.data);

  } catch (error) {
    console.error("Print Ticket Error:", error.response?.data || error.message);
    res.status(500).json({ success: false, message: "Failed to fetch ticket details" });
  }
});




// =========================
// React Routing Support
// =========================
app.use(express.static(path.join(__dirname, "public", "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dist", "index.html"));
});

// =========================
// START SERVER
// =========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});