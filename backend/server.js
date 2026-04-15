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
      totalFare: baseFare + serviceTax,
      zIndex: Number(seat.zIndex ?? 0),
      row: Number(seat.row ?? Math.floor(index / 4)),
      column: Number(seat.column ?? index % 4),
      length: Number(seat.length ?? 1),
      width: Number(seat.width ?? 1),
    };
  });
};

// ======================================================
// HELPER FUNCTION: Parse Cancellation Policy
// ======================================================
const parseCancellationPolicy = (policyString) => {
  if (!policyString || typeof policyString !== 'string') {
    return {
      original: policyString || "",
      rules: [],
      summary: "No cancellation policy available"
    };
  }

  const rules = [];
  const policyParts = policyString.split(';');
  
  for (const part of policyParts) {
    if (part.trim() === "") continue;
    
    const parts = part.split(':');
    if (parts.length !== 4) continue;
    
    const from = parseInt(parts[0]);
    const to = parseInt(parts[1]);
    const rate = parseInt(parts[2]);
    const type = parseInt(parts[3]);
    
    const rateType = type === 0 ? '%' : '₹';
    const chargeStr = type === 0 ? `${rate}%` : `₹${rate}`;
    
    let timeStr = '';
    const fromStr = from === -1 ? 'start' : `${from} hour${from !== 1 ? 's' : ''}`;
    const toStr = to === -1 ? 'start' : `${to} hour${to !== 1 ? 's' : ''}`;
    
    if (from < to) {
      timeStr = `Between ${fromStr} and ${toStr} before departure`;
    } else {
      timeStr = `Before ${fromStr} before departure`;
    }
    
    rules.push({
      from: from,
      to: to,
      rate: rate,
      type: type,
      charge: chargeStr,
      timeRange: timeStr,
      rateType: rateType
    });
  }
  
  // Generate summary text
  let summary = "";
  if (rules.length > 0) {
    const firstRule = rules[0];
    const lastRule = rules[rules.length - 1];
    
    if (firstRule.from === -1) {
      summary = `Free cancellation up to ${firstRule.to} hours before departure`;
    } else if (lastRule.to === -1 && lastRule.from > 0) {
      summary = `Cancellation charges apply ${lastRule.charge} if cancelled after ${lastRule.from} hours before departure`;
    } else {
      summary = `Cancellation charges: ${rules.map(r => r.charge).join(' / ')}`;
    }
  } else {
    summary = "Cancellation not available for this booking";
  }
  
  return {
    original: policyString,
    rules: rules,
    summary: summary,
    hasPolicy: rules.length > 0
  };
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
// GMAIL VERIFY ENDPOINT
// =========================
app.get("/gmailverify", async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const url = `${process.env.BASE_URL}/gmailVerify?email=${encodeURIComponent(email)}`;

    const requestData = { url, method: "GET" };
    const headers = oauth.toHeader(oauth.authorize(requestData));

    const response = await axios.get(url, { headers });

    res.json(response.data);

  } catch (error) {
    console.error("Gmail Verify Error:", error.response?.data || error.message);
    if (error.response?.status === 404) {
      return res.status(404).json({ success: false, message: "Google account not registered" });
    }
    res.status(500).json({ success: false, message: "Gmail verification failed" });
  }
});

// =========================
// SEARCH TRIPS ENDPOINT (UPDATED with cancellation policy)
// =========================
app.get("/searchTrips", async (req, res) => {
  try {
    const { source, destination, doj, AC, nonAC, operator, priceSort, timeSort, sleeper, seater } = req.query;

    if (!source || !destination || !doj) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    let url = `${process.env.BASE_URL}/availabletrips?source=${source}&destination=${destination}&doj=${doj}`;
    
    // Add filter parameters if they exist
    if (AC === 'true') url += `&AC=true`;
    if (nonAC === 'true') url += `&nonAC=true`;
    if (operator) url += `&operator=${encodeURIComponent(operator)}`;
    if (priceSort) url += `&priceSort=${priceSort}`;
    if (timeSort) url += `&timeSort=${timeSort}`;
    if (sleeper === 'true') url += `&sleeper=true`;
    if (seater === 'true') url += `&seater=true`;


    const requestData = { url, method: "GET" };
    const headers = oauth.toHeader(oauth.authorize(requestData));
 
    const tripsResponse = await axios.get(url, { headers });
    
    // Parse cancellation policy for each trip
    const tripsWithParsedPolicy = {
      ...tripsResponse.data,
      availableTrips: tripsResponse.data.availableTrips?.map(trip => ({
        ...trip,
        cancellationPolicyParsed: parseCancellationPolicy(trip.cancellationPolicy)
      })) || []
    };

    res.json(tripsWithParsedPolicy);

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


    const requestData = { url, method: "GET" };
    const headers = oauth.toHeader(oauth.authorize(requestData));
    console.log("trip id",id);

    const response = await axios.get(url, { headers });
 
    const tripData = response.data;
    const transformedSeats = transformSeats(tripData.seats);
    
    // Parse cancellation policy for trip details
    const cancellationPolicyParsed = parseCancellationPolicy(tripData.cancellationPolicy);

    res.json({
      ...tripData,
      seats: transformedSeats,
      cancellationPolicyParsed: cancellationPolicyParsed
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
    
    const requestData = {
      url: url,
      method: "POST",
      body: req.body
    };
    
    const headers = oauth.toHeader(oauth.authorize(requestData));
    headers["Content-Type"] = "application/json";
    
    
    const response = await axios.post(url, req.body, { headers });
    
    
    res.json(response.data);
    
  } catch (error) {
    console.error("Block Ticket Error FULL:", {
      data: error.response?.data,
      status: error.response?.status,
      message: error.message
    });
    
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
// RAZORPAY ORDER ENDPOINT
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


    const url = `${process.env.BASE_URL}/razorpayment/order`;
    const requestData = { url, method: "POST", body: razorpayBody };

    const headers = oauth.toHeader(oauth.authorize(requestData));
    headers["Content-Type"] = "application/json";

    const response = await axios.post(url, razorpayBody, { headers });


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


    const response = await axios.post(
      "https://uat.bobros.co.in/billdesktest.php",
      billdeskBody,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );


    res.json(response.data);
 
  } catch (error) {
    console.error("BillDesk Order Error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: "BillDesk order creation failed"
    });
  }
});

// =========================
// VERIFY PAYMENT ENDPOINT
// =========================
app.post("/verifyPayment", async (req, res) => {
  try {
    const url = `${process.env.BASE_URL}/verifyPayment`;
   
    const requestData = { url, method: "POST" };
    const headers = oauth.toHeader(oauth.authorize(requestData));
    headers["Content-Type"] = "application/json";

    const response = await axios.post(url, req.body, { headers });
    res.json(response.data);
 
  } catch (error) {
    console.error("Verify Payment Error:", error.response?.data || error.message);
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

    const requestData = { url, method: "GET" };
    const headers = oauth.toHeader(oauth.authorize(requestData));
 
    const response = await axios.get(url, { headers });
    res.json(response.data);
 
  } catch (error) {
    console.error("Reward API Error:", error.response?.data || error.message);
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

    const confirmedBookings = allRows.filter(b =>
      b.tin_ticket && b.tin_ticket !== "0"
    );


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

    const url = `${process.env.BASE_URL}/mybookings/verify`;

    const response = await axios.post(url, { email, mobile }, {
      headers: { "Content-Type": "application/json" }
    });

    res.json({ success: true, data: response.data });
 
  } catch (error) {
    console.error("Guest Verify Error:", error.response?.data || error.message);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
});
 
// =========================
// GUEST BOOKINGS - FETCH DATA WITH OTP
// =========================
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


    const response = await axios.post(url, req.body, { headers });


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


    const requestData = { url, method: "POST", body: req.body };
    const headers = oauth.toHeader(oauth.authorize(requestData));
    headers["Content-Type"] = "application/json";

    const response = await axios.post(url, req.body, { headers });

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


    const requestData = { url, method: "POST", body: req.body };
    const headers = oauth.toHeader(oauth.authorize(requestData));
    headers["Content-Type"] = "application/json";

    const response = await axios.post(url, req.body, { headers });

    res.json(response.data);
 
  } catch (error) {
    console.error("Cancel Data Error:", error.response?.data?.error ||  error.response?.data ||  error.message);
    res.status(500).json({
      success: false,
      message: error.response?.data?.error ||   error.response?.data?.message || "OTP verification failed"
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


    const requestData = { url, method: "POST", body: req.body };
    const headers = oauth.toHeader(oauth.authorize(requestData));
    headers["Content-Type"] = "application/json";

    const response = await axios.post(url, req.body, { headers });

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
 
    const response = await axios.post(
      "https://api.bobros.co.in/offer/apply-offer/",
      req.body,
      { headers: { "Content-Type": "application/json" } }
    );
 
    res.json(response.data);
 
  } catch (error) {
    console.error("Offer Apply Error:", error.response?.data || error.message);
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

    const requestData = { url, method: "GET" };
    const headers = oauth.toHeader(oauth.authorize(requestData));
 
    const response = await axios.get(url, { headers });
    res.json(response.data);
 
  } catch (error) {
    console.error("Print Ticket Error:", error.response?.data || error.message);
    res.status(500).json({ success: false, message: "Failed to fetch ticket details" });
  }
});

// =========================
// GET CANCELLATION POLICY ENDPOINT (NEW)
// =========================
app.get("/cancellation-policy/:tripId", async (req, res) => {
  try {
    const { tripId } = req.params;
    
    if (!tripId) {
      return res.status(400).json({ 
        success: false, 
        message: "Trip ID is required" 
      });
    }

    const url = `${process.env.BASE_URL}/tripdetails?id=${tripId}`;
    const requestData = { url, method: "GET" };
    const headers = oauth.toHeader(oauth.authorize(requestData));

    const response = await axios.get(url, { headers });
    const policyString = response.data.cancellationPolicy;
    
    const parsedPolicy = parseCancellationPolicy(policyString);
    
    res.json({
      success: true,
      policy: parsedPolicy
    });

  } catch (error) {
    console.error("Cancellation Policy Error:", error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch cancellation policy" 
    });
  }
});

// =========================
// BILL PAYMENT VALIDATE ENDPOINT
// =========================
app.post("/bill/validate-payment", async (req, res) => {
  try {
    const { billerid, customerDetails, authenticatorValues, additionalValidation } = req.body;

    if (!billerid || !customerDetails?.mobile) {
      return res.status(400).json({
        success: false,
        message: "billerid and customer mobile required"
      });
    }

  const authenticatorsFromUI = authenticatorValues
  ? Object.entries(authenticatorValues)
      .filter(([key]) => !key.startsWith('original_param_name_'))
      .filter(([key, val]) => val !== '')
      .map(([key, val]) => {
        const originalKey = authenticatorValues[`original_param_name_${key}`] || key;
        return {
          parameter_name: originalKey,
          value: val
        };
      })
  : [];
    const finalPayload = {
      customerid: customerDetails.mobile,
      billerid: billerid,
      authenticatorsFromUI: authenticatorsFromUI,
      customer: {
        firstname: customerDetails.name || "",
        lastname: "NA",
        mobile: customerDetails.mobile,
        email: customerDetails.email || ""
      },
      device: {
        init_channel: "Internet",
        ip: req.ip || req.connection.remoteAddress || "0.0.0.0",
        mac: "AB:CD:EF:GH"
      }
    };

    if (additionalValidation && Object.keys(additionalValidation).length > 0) {
      finalPayload.additional_validation_details = additionalValidation;
    }

    const url = `${process.env.BASE_URL}/temp-payments/validate-payment`;

    const requestData = { url, method: "POST", body: finalPayload };
    const headers = oauth.toHeader(oauth.authorize(requestData));
    headers["Content-Type"] = "application/json";

    console.log("Bill Validate Payload:", JSON.stringify(finalPayload, null, 2));

    const response = await axios.post(url, finalPayload, { headers });

    console.log("Bill Validate Response:", JSON.stringify(response.data, null, 2));

    res.json({ success: true, data: response.data });

  } catch (error) {
    console.error("Bill Validate Error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || error.message || "Validation failed",
      error: error.response?.data
    });
  }
});

// =========================
// PRINT FLIGHT TICKET ENDPOINT
// =========================
// app.post("/printFlightTicket", async (req, res) => {
//   try {
//     const { providerLocatorCode, ticketNumber } = req.body;

//     console.log("[printFlightTicket] req.body received:", JSON.stringify(req.body, null, 2));

//     if (!providerLocatorCode || !ticketNumber) {
//       console.warn("[printFlightTicket] Missing fields — providerLocatorCode:", providerLocatorCode, "| ticketNumber:", ticketNumber);
//       return res.status(400).json({
//         success: false,
//         message: "providerLocatorCode and ticketNumber are required"
//       });
//     }

//     const url = `https://api.bobros.org/flights/retrieve-document/print-ticket`;

//     // ✅ payload must match exactly what we send to axios
//     const payload = { providerLocatorCode, ticketNumber };

//     // ✅ OAuth signature built from the SAME payload we send
//     const requestData = { url, method: "POST", body: payload };
//     const headers = oauth.toHeader(oauth.authorize(requestData));
//     headers["Content-Type"] = "application/json";

//     console.log("[printFlightTicket] Upstream URL:", url);
//     console.log("[printFlightTicket] Payload to upstream:", JSON.stringify(payload, null, 2));
//     console.log("[printFlightTicket] OAuth headers:", JSON.stringify(headers, null, 2));

//     const response = await axios.post(url, payload, { headers });

//     console.log("[printFlightTicket] Upstream status:", response.status);
//     console.log("[printFlightTicket] Upstream response:", JSON.stringify(response.data, null, 2));

//     res.json({ success: true, data: response.data });

//   } catch (error) {
//     console.error("[printFlightTicket] ERROR status:", error.response?.status);
//     console.error("[printFlightTicket] ERROR data:", JSON.stringify(error.response?.data, null, 2));
//     console.error("[printFlightTicket] ERROR headers:", JSON.stringify(error.response?.headers, null, 2));
//     console.error("[printFlightTicket] ERROR message:", error.message);

//     res.status(error.response?.status || 500).json({
//       success: false,
//       message: error.response?.data?.message || "Failed to fetch flight ticket",
//       debug: {
//         status: error.response?.status,
//         upstreamUrl: `https://api.bobros.org/flights/retrieve-document/print-ticket`,
//         upstreamPayload: { providerLocatorCode: req.body?.providerLocatorCode, ticketNumber: req.body?.ticketNumber },
//         upstreamError: error.response?.data,
//         upstreamHeaders: error.response?.headers
//       }
//     });
//   }
// });

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
 