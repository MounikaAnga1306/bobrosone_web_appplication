const express = require("express");
const axios = require("axios");
const helmet = require("helmet");
const path = require("path");
const cors = require("cors");
const oauth = require("./services/oauthService");
require("dotenv").config();

const rateLimit = require("express-rate-limit");
const app = express();

// ======================================================
// FIX: Trust proxy so req.ip gets the real client IP
// from X-Forwarded-For when running behind Nginx/load balancer.
// Without this, req.ip is "::1" or "::ffff:127.0.0.1" in UAT
// which the upstream BBPS API rejects as "Invalid device ip".
// ======================================================
app.set("trust proxy", true);

// ======================================================
// HELPER: Sanitize IP address
// - Strips IPv6-mapped IPv4 prefix  "::ffff:1.2.3.4" → "1.2.3.4"
// - Converts pure IPv6 loopback "::1" → "127.0.0.1"
// - Falls back to "0.0.0.0" if the result is still not a valid IPv4
// ======================================================
const sanitizeIp = (raw) => {
  if (!raw) return "0.0.0.0";

  // Strip IPv6-mapped IPv4 prefix
  let ip = raw.replace(/^::ffff:/i, "");

  // Pure IPv6 loopback
  if (ip === "::1") ip = "127.0.0.1";

  // If it still looks like an IPv6 address (contains ":"), fall back
  if (ip.includes(":")) ip = "0.0.0.0";

  // Basic IPv4 sanity check
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipv4Regex.test(ip)) return "0.0.0.0";

  return ip;
};

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: "Too many requests, please try again later." });
app.use(cors({ origin: true, methods: ["GET", "POST"], credentials: true }));
app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(express.static(path.join(__dirname, "public")));

// ======================================================
// HELPER: Transform Seats
// ======================================================
const transformSeats = (seats) => {
  if (!Array.isArray(seats)) return [];
  return seats.map((seat, index) => {
    const baseFare = Number(seat.baseFare ?? 0);
    const serviceTax = Number(seat.serviceTaxAbsolute ?? 0);
    return {
      id: seat.id || index + 1, name: seat.name || `S${index + 1}`,
      available: seat.available ?? true, ladiesSeat: seat.ladiesSeat ?? false,
      baseFare, totalFare: baseFare + serviceTax,
      zIndex: Number(seat.zIndex ?? 0), row: Number(seat.row ?? Math.floor(index / 4)),
      column: Number(seat.column ?? index % 4), length: Number(seat.length ?? 1), width: Number(seat.width ?? 1),
    };
  });
};

// ======================================================
// HELPER: Parse Cancellation Policy
// ======================================================
const parseCancellationPolicy = (policyString) => {
  if (!policyString || typeof policyString !== "string")
    return { original: policyString || "", rules: [], summary: "No cancellation policy available" };
  const rules = [];
  for (const part of policyString.split(";")) {
    if (part.trim() === "") continue;
    const parts = part.split(":");
    if (parts.length !== 4) continue;
    const from = parseInt(parts[0]), to = parseInt(parts[1]), rate = parseInt(parts[2]), type = parseInt(parts[3]);
    const chargeStr = type === 0 ? `${rate}%` : `₹${rate}`;
    const fromStr = from === -1 ? "start" : `${from} hour${from !== 1 ? "s" : ""}`;
    const toStr = to === -1 ? "start" : `${to} hour${to !== 1 ? "s" : ""}`;
    rules.push({ from, to, rate, type, charge: chargeStr, rateType: type === 0 ? "%" : "₹",
      timeRange: from < to ? `Between ${fromStr} and ${toStr} before departure` : `Before ${fromStr} before departure` });
  }
  let summary = "Cancellation not available for this booking";
  if (rules.length > 0) {
    const first = rules[0], last = rules[rules.length - 1];
    if (first.from === -1) summary = `Free cancellation up to ${first.to} hours before departure`;
    else if (last.to === -1 && last.from > 0) summary = `Cancellation charges apply ${last.charge} if cancelled after ${last.from} hours before departure`;
    else summary = `Cancellation charges: ${rules.map((r) => r.charge).join(" / ")}`;
  }
  return { original: policyString, rules, summary, hasPolicy: rules.length > 0 };
};

// =========================
// CITIES
// =========================
app.get("/cities", async (req, res) => {
  try {
    const name = req.query.name;
    if (!name || typeof name !== "string" || name.trim().length < 2) return res.status(400).json({ error: "Invalid city name" });
    const url = `${process.env.BASE_URL}/cities?name=${encodeURIComponent(name.trim())}`;
    const headers = oauth.toHeader(oauth.authorize({ url, method: "GET" }));
    res.json((await axios.get(url, { headers })).data.map((c) => ({ sid: c.sid, cityname: c.cityname, state: c.state })));
  } catch (error) { res.status(500).json({ error: "Failed to fetch cities" }); }
});

// =========================
// GMAIL VERIFY
// =========================
app.get("/gmailverify", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ success: false, message: "Email is required" });
    const url = `${process.env.BASE_URL}/gmailVerify?email=${encodeURIComponent(email)}`;
    const headers = oauth.toHeader(oauth.authorize({ url, method: "GET" }));
    res.json((await axios.get(url, { headers })).data);
  } catch (error) {
    if (error.response?.status === 404) return res.status(404).json({ success: false, message: "Google account not registered" });
    res.status(500).json({ success: false, message: "Gmail verification failed" });
  }
});

// =========================
// SEARCH TRIPS
// =========================
app.get("/searchTrips", async (req, res) => {
  try {
    const { source, destination, doj, AC, nonAC, operator, priceSort, timeSort, sleeper, seater } = req.query;
    if (!source || !destination || !doj) return res.status(400).json({ error: "Missing required parameters" });
    let url = `${process.env.BASE_URL}/availabletrips?source=${source}&destination=${destination}&doj=${doj}`;
    if (AC === "true") url += `&AC=true`; if (nonAC === "true") url += `&nonAC=true`;
    if (operator) url += `&operator=${encodeURIComponent(operator)}`; if (priceSort) url += `&priceSort=${priceSort}`;
    if (timeSort) url += `&timeSort=${timeSort}`; if (sleeper === "true") url += `&sleeper=true`; if (seater === "true") url += `&seater=true`;
    const headers = oauth.toHeader(oauth.authorize({ url, method: "GET" }));
    const tr = await axios.get(url, { headers });
    res.json({ ...tr.data, availableTrips: (tr.data.availableTrips || []).map((t) => ({ ...t, cancellationPolicyParsed: parseCancellationPolicy(t.cancellationPolicy) })) });
  } catch (error) { res.status(500).json({ error: "Failed to fetch trips" }); }
});

// =========================
// TRIP DETAILS
// =========================
app.get("/tripdetails", async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "Trip ID is required" });
    const url = `${process.env.BASE_URL}/tripdetails?id=${id}`;
    const headers = oauth.toHeader(oauth.authorize({ url, method: "GET" }));
    const r = await axios.get(url, { headers });
    res.json({ ...r.data, seats: transformSeats(r.data.seats), cancellationPolicyParsed: parseCancellationPolicy(r.data.cancellationPolicy) });
  } catch (error) { res.status(500).json({ error: "Failed to fetch trip details" }); }
});

// =========================
// BLOCK TICKET
// =========================
app.post("/blockTicket", async (req, res) => {
  try {
    const url = `${process.env.BASE_URL}/blockTicket`;
    const headers = oauth.toHeader(oauth.authorize({ url, method: "POST", body: req.body }));
    headers["Content-Type"] = "application/json";
    res.json((await axios.post(url, req.body, { headers })).data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ success: false, message: error.response?.data?.message || error.message || "Failed to block ticket", error: error.response?.data });
  }
});

// =========================
// RAZORPAY ORDER
// =========================
app.post("/razorpayment/order", async (req, res) => {
  try {
    const { fare, uid, name, ticketId, email } = req.body;
    if (!fare || !ticketId) return res.status(400).json({ error: "Fare and ticketId are required" });
    const body = { fare, uid: uid || "Not Applicable", name: name || "Guest", ticketId, paymentfor: "BusTicket Rpay", email: email || "Not Applicable" };
    const url = `${process.env.BASE_URL}/razorpayment/order`;
    const headers = oauth.toHeader(oauth.authorize({ url, method: "POST", body }));
    headers["Content-Type"] = "application/json";
    res.json((await axios.post(url, body, { headers })).data);
  } catch (error) { res.status(500).json({ error: "Failed to create Razorpay order" }); }
});

// =========================
// BILLDESK ORDER (Bus)
// =========================
app.post("/billdesk/order", async (req, res) => {
  try {
    const { fare, uid, pname, tickid, redirect_url } = req.body;
    if (!fare || !tickid) return res.status(400).json({ success: false, message: "fare and ticketId required" });

    const returnUrl = redirect_url || "http://localhost:5173/payment-status";

    const body = new URLSearchParams({
      fare:       String(fare),
      uid:        uid   || "Not Applicable",
      pname:      pname || "Guest",
      tickid:     String(tickid),
      return_url: returnUrl,
    });

    const result = await axios.post(
      "https://uat.bobros.co.in/billdesktest.php",
      body.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json",
          "Authorization": `Basic ${Buffer.from(
            `${process.env.BILLDESK_PHP_USER}:${process.env.BILLDESK_PHP_PASS}`
          ).toString("base64")}`,
        },
        timeout: 30000,
      }
    );

    console.log("[BILLDESK BUS ORDER] response:", result.data);
    res.json(result.data);

  } catch (error) {
    console.error("[BILLDESK BUS ORDER] Error:", error.response?.status, error.message);
    res.status(500).json({ success: false, message: "BillDesk order creation failed" });
  }
});

// =========================
// VERIFY PAYMENT
// =========================
app.post("/verifyPayment", async (req, res) => {
  try {
    const url = `${process.env.BASE_URL}/verifyPayment`;
    const headers = oauth.toHeader(oauth.authorize({ url, method: "POST" }));
    headers["Content-Type"] = "application/json";
    res.json((await axios.post(url, req.body, { headers })).data);
  } catch (error) { res.status(500).json({ success: false, message: "Payment verification failed" }); }
});

// =========================
// BBPS BILL ORDER
// =========================
app.post("/bbps/billdesk/order", async (req, res) => {
  try {
    const { fare, uid, pname, email, tickid, billerid, validationId, paymentMethod, upiId, authenticators, billerName, isBbps } = req.body;
    const returnUrl = "https://uat.bobros.co.in/bill-payment-status";

    const payload = {
      fare: parseFloat(fare).toFixed(2),
      user_data: { name: pname || "Guest", mobile: uid || "", email: email || "", uid: uid || "", is_logged_in: !!uid },
      validation_data: { validation_id: validationId || tickid },
      payment_data: { method: paymentMethod || "UPI", upi_id: upiId || "" },
      biller_data: { biller_name: billerName || "", biller_id: billerid || "", is_bbps: isBbps !== undefined ? isBbps : true },
      authenticators: authenticators || [],
      device: { ip: sanitizeIp(req.ip), mac: "AB:CD:EF:GH", imei: "NA", os: "Node Backend", app: "B-Connect" },
      return_url: returnUrl,
    };

    console.log("[BBPS ORDER] return_url:", returnUrl);
    console.log("[BBPS ORDER] device.ip:", payload.device.ip);

    // ✅ Basic Auth add చేశాం — bus BillDesk లాగే
    const response = await axios.post(
      "https://uat.bobros.co.in/billdesk_bbpstest.php",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${Buffer.from(
            `${process.env.BILLDESK_PHP_USER}:${process.env.BILLDESK_PHP_PASS}`
          ).toString("base64")}`,
        },
        timeout: 30000,
      }
    );

    console.log("[BBPS ORDER] response:", response.data);

    if (response.data.success && response.data.checkoutUrl) {
      return res.json({ success: true, checkoutUrl: response.data.checkoutUrl });
    }
    return res.status(400).json({ success: false, message: "BillDesk order creation failed" });

  } catch (error) {
    console.error("[BBPS ORDER] Error:", error.response?.status, error.message);
    return res.status(500).json({ success: false, message: "Failed to create BillDesk order", error: error.message });
  }
});

app.get("/bill/billers", async (req, res) => {
  const { category } = req.query;
  const url = `${process.env.BASE_URL}/payments/billers?category=${encodeURIComponent(category)}`;
  const headers = oauth.toHeader(oauth.authorize({ url, method: "GET" }));
  res.json((await axios.get(url, { headers })).data);
});

// =========================
// BILLER LOGO PROXY
// Proxies external logo URLs so CORS/mixed-content
// issues don't block image loads in the browser.
// Works identically in local and UAT/prod.
// =========================
app.get("/bill/biller-logo", async (req, res) => {

  const { url } = req.query;

  if (!url) return res.status(400).send("url query param required");

  try {

    const response = await axios.get(url, {

      responseType: "arraybuffer",

      timeout: 8000,

      headers: { Accept: "image/*" },

    });

    const contentType =

      response.headers["content-type"] || "image/png";

    res.set("Content-Type", contentType);

    res.set("Cache-Control", "public, max-age=86400");

    res.send(Buffer.from(response.data));

  } catch {

    res.status(404).send("Logo not found");

  }

});

// =========================
// BBPS MAKE PAYMENT
// =========================
app.post("/bbps/makepayment", async (req, res) => {
  console.log("\n========== [MAKE_PAYMENT HIT] ==========");
  console.log("Request body:", JSON.stringify(req.body, null, 2));

  try {
    const {
      billerid, customerid, orderid, pa_ref_no,
      payment_amount, currency, cou_conv_fee, bou_conv_fee,
      debit_amount, customer, device, validationid, vpa, authenticators,
    } = req.body;

    if (!orderid || !payment_amount) {
      return res.status(400).json({ success: false, message: "orderid and payment_amount are required" });
    }

    const makePaymentPayload = {
      billerid:       billerid       || "",
      customerid:     customerid     || "",
      orderid:        orderid,
      pa_ref_no:      pa_ref_no      || orderid,
      authenticators: authenticators || [],
      payment_amount: parseFloat(payment_amount).toFixed(2),
      currency:       currency       || "INR",
      cou_conv_fee:   cou_conv_fee   || "0.00",
      bou_conv_fee:   bou_conv_fee   || "0.00",
      debit_amount:   debit_amount   || parseFloat(payment_amount).toFixed(2),
      customer:       customer       || { firstname: "Guest", lastname: "NA", mobile: customerid || "", email: "" },
      // FIX: sanitize IP here too — same issue can occur in make-payment flow
      device:         device         || { init_channel: "Internet", ip: sanitizeIp(req.ip), mac: "AB:CD:EF:GH" },
    };

    if (validationid) makePaymentPayload.validationid = validationid;
    if (vpa)          makePaymentPayload.vpa           = vpa;

    const MAKE_PAYMENT_URL = `${process.env.BASE_URL}/temp-payments/make-payment`;
    console.log("[MAKE_PAYMENT] URL:", MAKE_PAYMENT_URL);
    console.log("[MAKE_PAYMENT] device.ip:", makePaymentPayload.device.ip, "| raw req.ip:", req.ip);

    const headers = oauth.toHeader(oauth.authorize({ url: MAKE_PAYMENT_URL, method: "POST", body: makePaymentPayload }));
    headers["Content-Type"] = "application/json";

    const mpResponse = await axios.post(MAKE_PAYMENT_URL, makePaymentPayload, { headers, timeout: 30000 });

    console.log("[MAKE_PAYMENT] HTTP status:", mpResponse.status);
    console.log("[MAKE_PAYMENT] FULL response:", JSON.stringify(mpResponse.data, null, 2));

    return res.json({ success: true, data: mpResponse.data });

  } catch (error) {
    console.error("[MAKE_PAYMENT] Error:", error.message);
    if (error.response) {
      console.error("[MAKE_PAYMENT] API status:", error.response.status);
      console.error("[MAKE_PAYMENT] API response:", JSON.stringify(error.response.data, null, 2));
    }
    return res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || error.message || "MakePayment failed",
      error: error.response?.data,
    });
  }
});

// =========================
// REWARD POINTS
// =========================
app.get("/rewardPoints", async (req, res) => {
  try {
    const { uid, fare } = req.query;
    if (!uid || !fare) return res.status(400).json({ success: false, message: "uid and fare required" });
    const url = `${process.env.BASE_URL}/rewardPoints?uid=${uid}&fare=${fare}`;
    const headers = oauth.toHeader(oauth.authorize({ url, method: "GET" }));
    res.json((await axios.get(url, { headers })).data);
  } catch (error) { res.status(500).json({ success: false, message: "Failed to fetch reward points" }); }
});

// =========================
// MY BOOKINGS
// =========================
app.post("/myBookings", async (req, res) => {
  try {
    const { uid, mobile } = req.body;
    if (!uid && !mobile) return res.status(400).json({ success: false, message: "uid or mobile required" });
    const url = `${process.env.BASE_URL}/db/select`;
    const response = await axios.post(url, { table: "uticket", columns: ["*"], conditions: { or: [{ uid: String(uid) }, { uid: String(mobile) }] } }, { headers: { "Content-Type": "application/json" } });
    res.json({ success: true, bookings: (response.data?.rows || []).filter((b) => b.tin_ticket && b.tin_ticket !== "0") });
  } catch (error) { res.status(500).json({ success: false, message: "Failed to fetch bookings" }); }
});

// =========================
// GUEST BOOKINGS - VERIFY OTP
// =========================
app.post("/guestBookings/verify", async (req, res) => {
  try {
    const { email, mobile } = req.body;
    if (!email || !mobile) return res.status(400).json({ success: false, message: "email and mobile required" });
    res.json({ success: true, data: (await axios.post(`${process.env.BASE_URL}/mybookings/verify`, { email, mobile }, { headers: { "Content-Type": "application/json" } })).data });
  } catch (error) { res.status(500).json({ success: false, message: "Failed to send OTP" }); }
});

// =========================
// GUEST BOOKINGS - FETCH DATA
// =========================
app.post("/guestBookings/data", async (req, res) => {
  try {
    const { email, mobile, otp } = req.body;
    if (!email || !mobile || !otp) return res.status(400).json({ success: false, message: "email, mobile and otp required" });
    const dataRes = await axios.post(`${process.env.BASE_URL}/mybookings/data`, { email, mobile, otp }, { headers: { "Content-Type": "application/json" } });
    const all = dataRes.data?.bookingDetails || dataRes.data?.bookings || dataRes.data?.rows || [];
    return res.json({ success: true, bookings: all.filter((b) => b.uid === String(mobile)) });
  } catch (error) { res.status(500).json({ success: false, message: error.response?.data?.message || "Failed to fetch bookings" }); }
});

// =========================
// BOOK TICKET WITH REWARD POINTS
// =========================
app.post("/bookticket/rp", async (req, res) => {
  try {
    const { blockedTicketId, payeeid } = req.body;
    if (!blockedTicketId || !payeeid) return res.status(400).json({ success: false, message: "blockedTicketId and payeeid required" });
    const url = `${process.env.BASE_URL}/bookticket/rp`;
    const headers = oauth.toHeader(oauth.authorize({ url, method: "POST", body: req.body }));
    headers["Content-Type"] = "application/json";
    res.json((await axios.post(url, req.body, { headers })).data);
  } catch (error) { res.status(500).json({ success: false, message: error.response?.data?.message || "Failed to book ticket with reward points" }); }
});

// =========================
// CANCEL VERIFY USER
// =========================
app.post("/cancel/verify", async (req, res) => {
  try {
    const { ticket, mobile, email } = req.body;
    if (!ticket || !mobile || !email) return res.status(400).json({ success: false, message: "ticket, mobile, email required" });
    const url = `${process.env.BASE_URL}/cancelt/verifyuser`;
    const headers = oauth.toHeader(oauth.authorize({ url, method: "POST", body: req.body }));
    headers["Content-Type"] = "application/json";
    res.json((await axios.post(url, req.body, { headers })).data);
  } catch (error) { res.status(500).json({ success: false, message: error.response?.data || "Verification failed" }); }
});

// =========================
// CANCEL DATA (OTP VERIFY)
// =========================
app.post("/cancel/data", async (req, res) => {
  try {
    const { mobile, ticketId, otp } = req.body;
    if (!mobile || !ticketId || !otp) return res.status(400).json({ success: false, message: "mobile, ticketId, otp required" });
    const url = `${process.env.BASE_URL}/cancelt/cancellationData`;
    const headers = oauth.toHeader(oauth.authorize({ url, method: "POST", body: req.body }));
    headers["Content-Type"] = "application/json";
    res.json((await axios.post(url, req.body, { headers })).data);
  } catch (error) { res.status(500).json({ success: false, message: error.response?.data?.error || error.response?.data?.message || "OTP verification failed" }); }
});

// =========================
// CANCEL TICKET
// =========================
app.post("/cancel/ticket", async (req, res) => {
  try {
    const { tin, seatsToCancel } = req.body;
    if (!tin || !seatsToCancel?.length) return res.status(400).json({ success: false, message: "tin and seatsToCancel required" });
    const url = `${process.env.BASE_URL}/cancelt/cancelTicket`;
    const headers = oauth.toHeader(oauth.authorize({ url, method: "POST", body: req.body }));
    headers["Content-Type"] = "application/json";
    res.json((await axios.post(url, req.body, { headers })).data);
  } catch (error) { res.status(500).json({ success: false, message: error.response?.data || "Cancellation failed" }); }
});

// =========================
// MY ACCOUNT
// =========================
app.post("/myAccount", async (req, res) => {
  try {
    const { uid } = req.body;
    if (!uid) return res.status(400).json({ success: false, message: "uid required" });
    const url = `${process.env.BASE_URL}/db/select`;
    const response = await axios.post(url, { table: "t_account", columns: ["*"], conditions: { id: String(uid) } }, { headers: { "Content-Type": "application/json" } });
    res.json({ success: true, transactions: response.data?.rows || [] });
  } catch (error) { res.status(500).json({ success: false, message: "Failed to fetch account data" }); }
});

// =========================
// OFFER APPLY
// =========================
app.post("/offer/apply", async (req, res) => {
  try {
    res.json((await axios.post("https://api.bobros.co.in/offer/apply-offer/", req.body, { headers: { "Content-Type": "application/json" } })).data);
  } catch (error) { res.status(error.response?.status || 500).json(error.response?.data || { success: false, message: "Offer apply failed" }); }
});

// =========================
// PRINT TICKET
// =========================
app.get("/printTicket", async (req, res) => {
  try {
    const { tin } = req.query;
    if (!tin) return res.status(400).json({ success: false, message: "tin is required" });
    const url = `${process.env.BASE_URL}/email/print-ticket?tin=${tin}`;
    const headers = oauth.toHeader(oauth.authorize({ url, method: "GET" }));
    res.json((await axios.get(url, { headers })).data);
  } catch (error) { res.status(500).json({ success: false, message: "Failed to fetch ticket details" }); }
});

// =========================
// CANCELLATION POLICY
// =========================
app.get("/cancellation-policy/:tripId", async (req, res) => {
  try {
    const { tripId } = req.params;
    if (!tripId) return res.status(400).json({ success: false, message: "Trip ID is required" });
    const url = `${process.env.BASE_URL}/tripdetails?id=${tripId}`;
    const headers = oauth.toHeader(oauth.authorize({ url, method: "GET" }));
    res.json({ success: true, policy: parseCancellationPolicy((await axios.get(url, { headers })).data.cancellationPolicy) });
  } catch (error) { res.status(500).json({ success: false, message: "Failed to fetch cancellation policy" }); }
});

// =========================
// BILL VALIDATE PAYMENT
// FIX: Use sanitizeIp(req.ip) instead of raw req.ip
// =========================
app.post("/bill/validate-payment", async (req, res) => {
  try {
    const { billerid, customerDetails, authenticatorValues, additionalValidation } = req.body;
    if (!billerid || !customerDetails?.mobile) return res.status(400).json({ success: false, message: "billerid and customer mobile required" });
    const authenticatorsFromUI = authenticatorValues
      ? Object.entries(authenticatorValues)
          .filter(([key]) => !key.startsWith("original_param_name_"))
          .filter(([, val]) => val !== "")
          .map(([key, val]) => ({ parameter_name: authenticatorValues[`original_param_name_${key}`] || key, value: val }))
      : [];
    const finalPayload = {
      customerid: customerDetails.mobile, billerid, authenticatorsFromUI,
      customer: { firstname: customerDetails.name || "", lastname: "NA", mobile: customerDetails.mobile, email: customerDetails.email || "" },
      // FIX: was req.ip which returns "::1" / "::ffff:x.x.x.x" behind proxy
      device: { init_channel: "Internet", ip: sanitizeIp(req.ip), mac: "AB:CD:EF:GH" },
    };
    console.log("[VALIDATE-PAYMENT] device.ip:", finalPayload.device.ip, "| raw req.ip:", req.ip);
    if (additionalValidation && Object.keys(additionalValidation).length > 0)
      finalPayload.additional_validation_details = additionalValidation;
    const url = `${process.env.BASE_URL}/temp-payments/validate-payment`;
    const headers = oauth.toHeader(oauth.authorize({ url, method: "POST", body: finalPayload }));
    headers["Content-Type"] = "application/json";
    res.json({ success: true, data: (await axios.post(url, finalPayload, { headers })).data });
  } catch (error) {
    const errData = error.response?.data;
    const msg = errData?.error?.message
             || errData?.detail?.message
             || errData?.message
             || error.message
             || "Unable to validate your bill at the moment. Please try again later.";
    res.status(error.response?.status || 500).json({
      success: false,
      message: msg,
      error: errData,
    });
  }
});

// =========================
// RETRIEVE RECHARGE PLANS
// =========================
app.post("/bill/retrieve-recharge-plan", async (req, res) => {
  try {
    const { billerid, subscriber_id } = req.body;
    if (!billerid || !subscriber_id) return res.status(400).json({ success: false, message: "billerid and subscriber_id are required" });
    const planPayload = { mobile: subscriber_id.trim(), plan_type: "121", billerid: billerid.trim() };
    const url = `${process.env.BASE_URL}/payments/retrieve-recharge-plan`;
    const headers = oauth.toHeader(oauth.authorize({ url, method: "POST", body: planPayload }));
    headers["Content-Type"] = "application/json";
    res.json({ success: true, data: (await axios.post(url, planPayload, { headers })).data });
  } catch (error) {
    res.status(error.response?.status || 500).json({ success: false, message: error.response?.data?.message || error.message || "Failed to fetch recharge plans", error: error.response?.data });
  }
});

// =========================
// React Routing
// =========================
app.use(express.static(path.join(__dirname, "public", "dist")));
app.get("*", (req, res) => { res.sendFile(path.join(__dirname, "public", "dist", "index.html")); });

// =========================
// START SERVER
// =========================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => { console.log(`Server running on port ${PORT}`); });