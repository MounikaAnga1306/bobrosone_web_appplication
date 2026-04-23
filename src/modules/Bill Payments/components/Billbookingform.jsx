import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Bus, Plane, Building2, Palmtree, Car, IndianRupee,
} from "lucide-react";

const tabs = [
  { id: "billpayments", label: "Bill Payments", icon: IndianRupee },
  { id: "bus", label: "Bus", icon: Bus },
  { id: "flights", label: "Flights", icon: Plane },
  { id: "hotels", label: "Hotels", icon: Building2 },
  { id: "holidays", label: "Holidays", icon: Palmtree },
  { id: "cabs", label: "Cabs", icon: Car },
];

const tabRoutes = {
  billpayments: "/BillHomePage",
  bus: "/",
  flights: "/flights",
  hotels: "/hotels",
  holidays: "/Holiday",
  cabs: "/cabs",
};

const API = "https://api.bobros.co.in/db/select";

const safeParseJson = (raw) => {
  if (!raw || raw === "nan") return null;
  try {
    if (typeof raw === "object") return raw;
    let s = raw.replace(/'/g, '"');
    return JSON.parse(s);
  } catch {
    return null;
  }
};

// ─────────────────────────────────────────────────────────────
// ROBUST AUTHENTICATOR PARSER
// Standard JSON.parse fails on billers like Childline because
// the "regex" field contains double-escaped chars (\\s, \\., \\#)
// that become invalid JSON after storage/retrieval.
// This parser uses brace-counting to split objects, then extracts
// each field individually with targeted regex — so a broken
// "regex" field never kills the whole parse.
// ─────────────────────────────────────────────────────────────
const parseAuthenticatorsSafe = (raw) => {
  if (!raw || raw === "nan") return [];

  // Already a clean array (e.g. from a previous parse cycle)
  if (Array.isArray(raw)) {
    return raw.filter((a) => a && typeof a === "object" && a.parameter_name);
  }

  if (typeof raw !== "string") return [];

  // ── Strategy 1: standard JSON.parse (fastest, works for simple billers) ──
  try {
    const cleaned = raw.replace(/'/g, '"');
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed) && parsed.every((a) => a?.parameter_name)) {
      return parsed.filter((a) => a && a.parameter_name);
    }
  } catch {
    // fall through to Strategy 2
  }

  // ── Strategy 2: brace-counting object splitter ──
  // Splits the raw string into individual {...} blocks then extracts
  // each known field with a targeted regex, skipping any that can't parse.
  const results = [];
  let depth = 0;
  let start = -1;

  for (let i = 0; i < raw.length; i++) {
    if (raw[i] === "{") {
      if (depth === 0) start = i;
      depth++;
    } else if (raw[i] === "}") {
      depth--;
      if (depth === 0 && start !== -1) {
        const objStr = raw.slice(start, i + 1);

        // parameter_name is mandatory — skip if missing
        const pnMatch = objStr.match(/"parameter_name"\s*:\s*"([^"]+)"/);
        if (!pnMatch) { start = -1; continue; }

        const obj = { parameter_name: pnMatch[1] };

        // optional
        const optMatch = objStr.match(/"optional"\s*:\s*"([^"]+)"/);
        if (optMatch) obj.optional = optMatch[1];

        // error_message
        const errMatch = objStr.match(/"error_message"\s*:\s*"([^"]*)"/);
        if (errMatch) obj.error_message = errMatch[1];

        // seq
        const seqMatch = objStr.match(/"seq"\s*:\s*"([^"]+)"/);
        if (seqMatch) obj.seq = seqMatch[1];

        // data_type
        const dtMatch = objStr.match(/"data_type"\s*:\s*"([^"]+)"/);
        if (dtMatch) obj.data_type = dtMatch[1];

        // encryption_required
        const encMatch = objStr.match(/"encryption_required"\s*:\s*"([^"]+)"/);
        if (encMatch) obj.encryption_required = encMatch[1];

        // user_input
        const uiMatch = objStr.match(/"user_input"\s*:\s*"([^"]+)"/);
        if (uiMatch) obj.user_input = uiMatch[1];

        // regex — extract safely (don't die if it has weird escapes)
        const rxMatch = objStr.match(/"regex"\s*:\s*"((?:[^"\\]|\\.)*)"/);
        if (rxMatch) obj.regex = rxMatch[1];

        // list_of_values — extract the inner array string and try to parse it
        const lovMatch = objStr.match(/"list_of_values"\s*:\s*(\[[^\]]*\])/);
        if (lovMatch) {
          try {
            obj.list_of_values = JSON.parse(lovMatch[1]);
          } catch {
            try {
              obj.list_of_values = JSON.parse(lovMatch[1].replace(/'/g, '"'));
            } catch {
              // couldn't parse list_of_values — leave undefined
            }
          }
        }

        results.push(obj);
        start = -1;
      }
    }
  }

  return results;
};

const BillBookingForm = () => {
  const [activeTab, setActiveTab] = useState("billpayments");
  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [categoryName, setCategoryName] = useState("All");
  const [catDropOpen, setCatDropOpen] = useState(false);
  const [catSearch, setCatSearch] = useState("");
  const [billers, setBillers] = useState([]);
  const [billerLoading, setBillerLoading] = useState(false);
  const [biller, setBiller] = useState("");
  const [billerName, setBillerName] = useState("");
  const [billerError, setBillerError] = useState("");
  const [billerDropOpen, setBillerDropOpen] = useState(false);
  const [billerSearch, setBillerSearch] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  const catRef = useRef(null);
  const billerRef = useRef(null);
  const catSearchRef = useRef(null);
  const billerSearchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if (catRef.current && !catRef.current.contains(e.target)) {
        setCatDropOpen(false);
        setCatSearch("");
      }
      if (billerRef.current && !billerRef.current.contains(e.target)) {
        setBillerDropOpen(false);
        setBillerSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    (async () => {
      setCatLoading(true);
      try {
        const res = await axios.post(API, { table: "biller_all", columns: ["biller_category"] });
        const unique = [...new Set((res.data?.rows || []).map((r) => r.biller_category))].sort();
        setCategories(unique);
      } catch (err) {
        console.error("Fetch categories error:", err);
      } finally {
        setCatLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setBiller("");
      setBillerName("");
      setBillerError("");
      setBillers([]);
      setBillerLoading(true);
      try {
        const body =
          category === "All"
            ? { table: "biller_all", columns: ["biller_name", "billerid"] }
            : {
                table: "biller_all",
                columns: ["biller_name", "billerid"],
                conditions: { biller_category: category },
              };
        const res = await axios.post(API, body);
        setBillers(res.data?.rows || []);
      } catch (err) {
        console.error("Fetch billers error:", err);
      } finally {
        setBillerLoading(false);
      }
    })();
  }, [category]);

  const filteredCategories = categories.filter((c) =>
    c.toLowerCase().includes(catSearch.toLowerCase())
  );

  const filteredBillers = billers.filter((b) =>
    b.biller_name.toLowerCase().includes(billerSearch.toLowerCase())
  );

  const handleCategorySelect = (val, label) => {
    setCategory(val);
    setCategoryName(label);
    setBiller("");
    setBillerName("");
    setBillerError("");
    setCatDropOpen(false);
    setCatSearch("");
  };

  const handleBillerSelect = (b) => {
    setBiller(b.billerid);
    setBillerName(b.biller_name);
    setBillerError("");
    setBillerDropOpen(false);
    setBillerSearch("");
  };

  const handleSearch = async () => {
    if (!biller) {
      setBillerError("Please select a biller");
      return;
    }

    setSearchLoading(true);

    try {
      const res = await axios.post(API, {
        table: "biller_all",
        columns: ["*"],
        conditions: { billerid: biller },
      });

      if (!res.data?.rows?.[0]) {
        alert("Biller details not found!");
        return;
      }

      const d = res.data.rows[0];

      // ── Parse authenticators with the robust parser ──
      // Handles all billers including ones with complex regex fields
      // (Childline, HDFC Life, NPS, Indane Gas, etc.)
      const authenticators = parseAuthenticatorsSafe(d.authenticators);

      console.log(
        `[BillBookingForm] Parsed ${authenticators.length} authenticators for ${d.biller_name}:`,
        authenticators.map((a) => a.parameter_name)
      );

      const allowedPaymentMethods = safeParseJson(d.allowed_payment_methods) || [];
      const paymentChannels = safeParseJson(d.payment_channels) || [];
      const customerConvFee = safeParseJson(d.customer_conv_fee);
      const additionalValDetails = safeParseJson(d.additional_validation_details);
      const additionalPayDetails = safeParseJson(d.additional_payment_details);
      const authGroup = safeParseJson(d.biller_authenticator_group);

      let billerConsent = "";
      try {
        const cr = await axios.post(API, {
          table: "biller_consent",
          columns: ["biller_consent"],
          conditions: { biller_category: d.biller_category },
        });
        billerConsent = cr.data?.rows?.[0]?.biller_consent || "";
      } catch {
        console.error("Error fetching consent");
      }

      // ── Read logged-in user from localStorage ──
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
      let loggedInUser = null;
      if (isLoggedIn) {
        try {
          const userStr = localStorage.getItem("user");
          if (userStr) {
            const parsed = JSON.parse(userStr);
            // Handle nested response: { data: { user, email, mobile } }
            loggedInUser = parsed?.data || parsed;
          }
        } catch (e) {
          console.error("Error parsing user data:", e);
        }
      }

      const billData = {
        billerid: d.billerid,
        biller: d.biller_name,
        category: d.biller_category,
        category1: d.biller_category,
        biller_logo: d.biller_logo,
        online_validation: d.online_validation,
        bill_presentment: d.bill_presentment,
        partial_pay: d.partial_pay,
        partial_pay_amount: d.partial_pay_amount,
        pay_after_duedate: d.pay_after_duedate,
        paymentamount_validation: d.paymentamount_validation,
        plan_available: d.plan_available,
        biller_type: d.biller_type,
        biller_mode: d.biller_mode,
        allowed_payment_methods: allowedPaymentMethods,
        payment_channels: paymentChannels,
        customer_conv_fee: customerConvFee,
        // ✅ authenticators is now a clean array — always
        authenticators: authenticators,
        biller_authenticator_group: authGroup,
        additional_validation_details: additionalValDetails,
        additional_payment_details: additionalPayDetails,
        billerConsent: billerConsent,
        biller_remarks:
          d.biller_remarks && d.biller_remarks !== "nan" ? d.biller_remarks : "",
        bbps_billerid: d.bbps_billerid,
        isbillerbbps: d.isbillerbbps,
        isLoggedIn: isLoggedIn,
        loggedInUser: loggedInUser,
      };

      console.log("billData saved to localStorage:", {
        biller: billData.biller,
        authenticatorCount: billData.authenticators.length,
        authenticatorNames: billData.authenticators.map((a) => a.parameter_name),
      });

      localStorage.setItem("billData", JSON.stringify(billData));
      navigate("/bill-details");
    } catch (err) {
      console.error("handleSearch error:", err);
      alert("Error fetching biller details. Please try again.");
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <section className="relative min-h-[520px] md:min-h-[540px] flex items-center justify-center py-8 md:py-0">
      <img
        src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2071&q=80"
        alt="Bill payments background"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-red-600/90 via-red-500/80 to-purple-600/70" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      <div className="relative z-10 w-full max-w-6xl px-4 sm:px-6">
        <div className="text-center mb-4 sm:mb-6 md:mb-8 text-white">
          <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold mt-6 md:-mt-6">
            Pay Bills, Stress-Free
          </h1>
          <p className="text-xs sm:text-sm md:text-lg opacity-90 mt-1 sm:mt-2">
            Electricity, Water, Gas, Broadband &amp; more — all in one place
          </p>
        </div>

        <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 px-4 sm:px-6 md:px-8 lg:px-10 pt-5 sm:pt-6 md:pt-8 pb-12">
          <div className="hidden lg:flex gap-3 mb-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    navigate(tabRoutes[tab.id]);
                  }}
                  className={`flex items-center gap-2 px-3 lg:px-4 xl:px-5 py-1.5 lg:py-2 xl:py-2.5 cursor-pointer rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 border ${
                    active
                      ? "bg-gradient-to-r from-[#FD561E] to-[#ff7b4a] text-white border-transparent shadow-lg scale-105"
                      : "border-gray-200 text-gray-600 hover:border-[#FD561E] hover:text-[#FD561E] bg-white/80"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* ── Mobile View ── */}
          <div className="md:hidden space-y-3">
            <div className="border border-gray-200 rounded-xl px-3 pt-2 pb-2">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                <i className="fa-solid fa-table-cells-large" /> Category
              </p>
              <div className="relative" ref={catRef}>
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => {
                    if (!catLoading) {
                      setCatDropOpen(!catDropOpen);
                      setTimeout(() => catSearchRef.current?.focus(), 50);
                    }
                  }}
                >
                  <span className="flex-1 font-semibold text-sm sm:text-base py-1 select-none text-gray-800">
                    {catLoading ? "Loading..." : categoryName}
                  </span>
                  <span
                    className={`text-gray-400 text-xs ml-2 transition-transform duration-200 ${
                      catDropOpen ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                </div>
                {catDropOpen && !catLoading && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50">
                    <div className="px-3 pt-2 pb-1 border-b border-gray-100">
                      <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-2 py-1.5">
                        <i className="fa-solid fa-magnifying-glass text-gray-400 text-xs" />
                        <input
                          ref={catSearchRef}
                          type="text"
                          value={catSearch}
                          onChange={(e) => setCatSearch(e.target.value)}
                          placeholder="Search category..."
                          className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400"
                        />
                        {catSearch && (
                          <button
                            onClick={() => setCatSearch("")}
                            className="text-gray-400 hover:text-gray-600 text-xs"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                    <ul className="max-h-48 overflow-y-auto">
                      <li
                        onMouseDown={() => handleCategorySelect("All", "All")}
                        className={`px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors text-gray-800 hover:bg-orange-50 hover:text-[#FD561E] ${
                          category === "All" ? "bg-orange-50 text-[#FD561E]" : ""
                        }`}
                      >
                        All
                      </li>
                      {filteredCategories.length > 0 ? (
                        filteredCategories.map((c) => (
                          <li
                            key={c}
                            onMouseDown={() => handleCategorySelect(c, c)}
                            className={`px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors text-gray-800 hover:bg-orange-50 hover:text-[#FD561E] ${
                              category === c ? "bg-orange-50 text-[#FD561E]" : ""
                            }`}
                          >
                            {c}
                          </li>
                        ))
                      ) : (
                        <li className="px-4 py-3 text-sm text-gray-400">No results found</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div
              className={`border rounded-xl px-3 pt-2 pb-2 ${
                billerError ? "border-red-400" : "border-gray-200"
              }`}
            >
              <p
                className={`text-[10px] uppercase tracking-widest mb-1 flex items-center gap-1 ${
                  billerError ? "text-red-400" : "text-gray-400"
                }`}
              >
                <i className="fa-solid fa-building-columns" /> Biller
              </p>
              <div className="relative" ref={billerRef}>
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => {
                    if (!billerLoading) {
                      setBillerDropOpen(!billerDropOpen);
                      setTimeout(() => billerSearchRef.current?.focus(), 50);
                    }
                  }}
                >
                  <span
                    className={`flex-1 font-semibold text-sm sm:text-base py-1 select-none ${
                      biller ? "text-gray-800" : "text-gray-400"
                    }`}
                  >
                    {billerLoading ? "Loading billers..." : billerName || "Search biller"}
                  </span>
                  <span
                    className={`text-gray-400 text-xs ml-2 transition-transform duration-200 ${
                      billerDropOpen ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                </div>
                {billerDropOpen && !billerLoading && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50">
                    <div className="px-3 pt-2 pb-1 border-b border-gray-100">
                      <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-2 py-1.5">
                        <i className="fa-solid fa-magnifying-glass text-gray-400 text-xs" />
                        <input
                          ref={billerSearchRef}
                          type="text"
                          value={billerSearch}
                          onChange={(e) => setBillerSearch(e.target.value)}
                          placeholder="Search biller..."
                          className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400"
                        />
                        {billerSearch && (
                          <button
                            onClick={() => setBillerSearch("")}
                            className="text-gray-400 hover:text-gray-600 text-xs"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                    <ul className="max-h-48 overflow-y-auto">
                      {filteredBillers.length > 0 ? (
                        filteredBillers.map((b) => (
                          <li
                            key={b.billerid}
                            onMouseDown={() => handleBillerSelect(b)}
                            className={`px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors text-gray-800 hover:bg-orange-50 hover:text-[#FD561E] ${
                              biller === b.billerid ? "bg-orange-50 text-[#FD561E]" : ""
                            }`}
                          >
                            {b.biller_name}
                          </li>
                        ))
                      ) : (
                        <li className="px-4 py-3 text-sm text-gray-400">No billers found</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
              {billerError && (
                <p className="text-red-500 text-[10px] mt-0.5 flex items-center gap-1">
                  <span>⚠</span>
                  {billerError}
                </p>
              )}
            </div>

            <div className="flex justify-center pt-4">
              <button
                onClick={handleSearch}
                disabled={searchLoading}
                className="bg-gradient-to-r from-[#FD561E] to-[#ff7b4a] text-white px-8 py-3 rounded-full font-bold text-sm shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                {searchLoading ? "Loading..." : "Fetch Bill Details"}
              </button>
            </div>
            <div className="flex justify-center pt-2 pb-2">
              <p className="text-[11px] text-gray-400 flex items-center gap-1">
                <i
                  className="fa-solid fa-shield-halved"
                  style={{ color: "#22c55e", fontSize: "12px" }}
                />{" "}
                Secured via Bharat BillPay Network
              </p>
            </div>
          </div>

          {/* ── Desktop View ── */}
          <div className="hidden md:block">
            <div className="grid grid-cols-2 gap-0">
              <div className="group pr-6">
                <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1 group-hover:text-[#FD561E] transition-colors duration-300 flex items-center gap-1">
                  <i className="fa-solid fa-table-cells-large" /> Category
                </p>
                <div className="pb-1.5 border-b border-gray-200 group-hover:border-[#FD561E] transition-colors duration-300">
                  <div className="relative" ref={catRef}>
                    <div
                      className="flex items-center cursor-pointer"
                      onClick={() => {
                        if (!catLoading) {
                          setCatDropOpen(!catDropOpen);
                          setTimeout(() => catSearchRef.current?.focus(), 50);
                        }
                      }}
                    >
                      <span className="flex-1 font-semibold text-sm sm:text-base md:text-lg py-1 select-none text-gray-800">
                        {catLoading ? "Loading..." : categoryName}
                      </span>
                      <span
                        className={`text-gray-400 text-xs ml-2 transition-transform duration-200 ${
                          catDropOpen ? "rotate-180" : ""
                        }`}
                      >
                        ▼
                      </span>
                    </div>
                    {catDropOpen && !catLoading && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50">
                        <div className="px-3 pt-2 pb-1 border-b border-gray-100">
                          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-2 py-1.5">
                            <i className="fa-solid fa-magnifying-glass text-gray-400 text-xs" />
                            <input
                              ref={catSearchRef}
                              type="text"
                              value={catSearch}
                              onChange={(e) => setCatSearch(e.target.value)}
                              placeholder="Search category..."
                              className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400"
                            />
                            {catSearch && (
                              <button
                                onClick={() => setCatSearch("")}
                                className="text-gray-400 hover:text-gray-600 text-xs"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </div>
                        <ul className="max-h-48 overflow-y-auto">
                          <li
                            onMouseDown={() => handleCategorySelect("All", "All")}
                            className={`px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors text-gray-800 hover:bg-orange-50 hover:text-[#FD561E] ${
                              category === "All" ? "bg-orange-50 text-[#FD561E]" : ""
                            }`}
                          >
                            All
                          </li>
                          {filteredCategories.length > 0 ? (
                            filteredCategories.map((c) => (
                              <li
                                key={c}
                                onMouseDown={() => handleCategorySelect(c, c)}
                                className={`px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors text-gray-800 hover:bg-orange-50 hover:text-[#FD561E] ${
                                  category === c ? "bg-orange-50 text-[#FD561E]" : ""
                                }`}
                              >
                                {c}
                              </li>
                            ))
                          ) : (
                            <li className="px-4 py-3 text-sm text-gray-400">
                              No results found
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="group pl-6 border-l border-gray-200">
                <p
                  className={`text-[11px] uppercase tracking-wide mb-1 transition-colors duration-300 flex items-center gap-1 ${
                    billerError ? "text-red-400" : "text-gray-400 group-hover:text-[#FD561E]"
                  }`}
                >
                  <i className="fa-solid fa-building-columns" /> Biller
                </p>
                <div
                  className={`pb-1.5 border-b transition-colors duration-300 ${
                    billerError
                      ? "border-red-400"
                      : "border-gray-200 group-hover:border-[#FD561E]"
                  }`}
                >
                  <div className="relative" ref={billerRef}>
                    <div
                      className="flex items-center cursor-pointer"
                      onClick={() => {
                        if (!billerLoading) {
                          setBillerDropOpen(!billerDropOpen);
                          setTimeout(() => billerSearchRef.current?.focus(), 50);
                        }
                      }}
                    >
                      <span
                        className={`flex-1 font-semibold text-sm sm:text-base md:text-lg py-1 select-none ${
                          biller ? "text-gray-800" : "text-gray-400"
                        }`}
                      >
                        {billerLoading ? "Loading billers..." : billerName || "Search biller"}
                      </span>
                      <span
                        className={`text-gray-400 text-xs ml-2 transition-transform duration-200 ${
                          billerDropOpen ? "rotate-180" : ""
                        }`}
                      >
                        ▼
                      </span>
                    </div>
                    {billerDropOpen && !billerLoading && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50">
                        <div className="px-3 pt-2 pb-1 border-b border-gray-100">
                          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-2 py-1.5">
                            <i className="fa-solid fa-magnifying-glass text-gray-400 text-xs" />
                            <input
                              ref={billerSearchRef}
                              type="text"
                              value={billerSearch}
                              onChange={(e) => setBillerSearch(e.target.value)}
                              placeholder="Search biller..."
                              className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400"
                            />
                            {billerSearch && (
                              <button
                                onClick={() => setBillerSearch("")}
                                className="text-gray-400 hover:text-gray-600 text-xs"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </div>
                        <ul className="max-h-48 overflow-y-auto">
                          {filteredBillers.length > 0 ? (
                            filteredBillers.map((b) => (
                              <li
                                key={b.billerid}
                                onMouseDown={() => handleBillerSelect(b)}
                                className={`px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors text-gray-800 hover:bg-orange-50 hover:text-[#FD561E] ${
                                  biller === b.billerid ? "bg-orange-50 text-[#FD561E]" : ""
                                }`}
                              >
                                {b.biller_name}
                              </li>
                            ))
                          ) : (
                            <li className="px-4 py-3 text-sm text-gray-400">
                              No billers found
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                {billerError && (
                  <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1">
                    <span>⚠</span>
                    {billerError}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="absolute bottom-6 left-0 right-0 flex justify-center">
              <p className="text-[11px] text-gray-400 flex items-center gap-1">
                <i
                  className="fa-solid fa-shield-halved"
                  style={{ color: "#22c55e", fontSize: "12px" }}
                />{" "}
                Secured via Bharat BillPay Network
              </p>
            </div>
            <div className="absolute -bottom-6 left-0 right-0 flex justify-center">
              <button
                onClick={handleSearch}
                disabled={searchLoading}
                className="bg-gradient-to-r from-[#FD561E] to-[#ff7b4a] text-white px-8 py-3 rounded-full font-bold text-sm shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                {searchLoading ? "Loading..." : "Fetch Bill Details"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BillBookingForm;