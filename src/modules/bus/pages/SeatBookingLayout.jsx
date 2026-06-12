// src/modules/bus/pages/SeatBookingLayout.jsx
import { useEffect, useState } from "react";
import { fetchTripDetails } from "../services/TripDetailsService";
import { blockTicket } from "../services/blockTicketService";
import { useNavigate } from "react-router-dom";
import { getUserDetails } from "../../../utils/authHelper";
import { Bus, MapPin, Armchair, Users, Phone, Clock, Calendar, Mail, Building2, Home, Smartphone } from "lucide-react";

import SeatBookingHeader from "../components/SeatBookingHeader";
import SeatSelection from "../components/SeatSelection";
import BoardingDropping from "../components/BoardingDropping";
import PassengerForm from "../components/PassengerForm";

const SeatBookingLayout = ({ tripId, open, onClose, fromCity, toCity, source, destination, date, operator }) => {
  const navigate = useNavigate();

  const [tripDetails, setTripDetails]         = useState(null);
  const [step, setStep]                       = useState(1);
  const [selectedSeats, setSelectedSeats]     = useState([]);
  const [boardingPoint, setBoardingPoint]     = useState(null);
  const [droppingPoint, setDroppingPoint]     = useState(null);
  const [warning, setWarning]                 = useState("");
  const [savedPassengers, setSavedPassengers] = useState(null);
  const [savedContact, setSavedContact]       = useState(null);
  const [isBooking, setIsBooking]             = useState(false);
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [showBookConfirm, setShowBookConfirm] = useState(false);
  const [showErrorPopup, setShowErrorPopup]   = useState(false);
  const [errorMessage, setErrorMessage]       = useState("");

  const showWarning = (msg) => setWarning(msg);

  const handleClose = () => {
    if (step === 4) {
      setShowBackConfirm(true);
    } else {
      onClose();
    }
  };

  useEffect(() => {
    if (selectedSeats.length > 0 && warning === "Please select at least one seat") setWarning("");
    if ((boardingPoint || droppingPoint) && warning === "Please select boarding and dropping points") setWarning("");
  }, [selectedSeats, boardingPoint, droppingPoint]);

  const handleStepClick = (stepNumber) => {
    if (stepNumber === 2 && selectedSeats.length === 0) { showWarning("Please select at least one seat"); return; }
    if (stepNumber === 3 && selectedSeats.length === 0) { showWarning("Please select at least one seat"); return; }
    if (stepNumber === 3 && (!boardingPoint || !droppingPoint)) { showWarning("Please select boarding and dropping points"); return; }
    setStep(stepNumber);
  };

  useEffect(() => {
    if (!tripId) return;
    setStep(1);
    setSelectedSeats([]);
    setBoardingPoint(null);
    setDroppingPoint(null);
    setWarning("");
    setSavedPassengers(null);
    setSavedContact(null);
    setIsBooking(false);

    const loadTripDetails = async () => {
      const data = await fetchTripDetails(tripId);
      setTripDetails(data);
    };
    loadTripDetails();
  }, [tripId]);

  useEffect(() => {
    if (!isBooking) return;
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      if (step === 4) {
        const confirmed = window.confirm("Are you sure? If you go back, you may lose the seats.");
        if (confirmed) { setIsBooking(false); onClose(); }
        else window.history.pushState(null, "", window.location.href);
      } else {
        const confirmed = window.confirm("Are you sure you want to leave?");
        if (confirmed) { setIsBooking(false); onClose(); }
        else window.history.pushState(null, "", window.location.href);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isBooking, step]);

  if (!open) return null;

  const minutesToTime = (minutes) => {
    const totalMinutes = Number(minutes);
    const hrs24 = Math.floor(totalMinutes / 60) % 24;
    const mins  = totalMinutes % 60;
    const period = hrs24 >= 12 ? "PM" : "AM";
    const hrs12  = hrs24 % 12 || 12;
    return `${hrs12}:${String(mins).padStart(2, "0")} ${period}`;
  };

  const totalFareAmount = selectedSeats.reduce((sum, s) => sum + s.totalFare, 0);

  const handleConfirmBooking = async () => {
    if (isBooking) return;
    setIsBooking(true);

    const user     = getUserDetails();
    const uid      = String(user?.uid || savedContact?.uid || savedContact?.mobile);
    const totalFare = selectedSeats.reduce((sum, s) => sum + s.totalFare, 0);

    try {
      const inventoryItems = selectedSeats.map((seat, index) => ({
        seatName:   seat.name,
        fare:       seat.totalFare,
        ladiesSeat: seat.ladiesSeat,
        passenger: [{
          title:    savedPassengers[index].title || "Mr",
          name:     savedPassengers[index].name,
          gender:   savedPassengers[index].gender,
          seatName: seat.name,
          mobile:   savedContact.mobile,
          age:      Number(savedPassengers[index].age),
          email:    savedContact.email,
          address:  savedContact.address,
          city:     savedContact.city,
          primary:  index === 0,
          idType:   "",
          idNumber: ""
        }]
      }));

      const body = {
        uId:             uid,
        availableTripId: tripId,
        boardingPointId: boardingPoint.bpId,
        droppingPointId: droppingPoint.bpId,
        dateOfJourney:   date,
        departureTime:   minutesToTime(boardingPoint.time),
        arrivalTime:     minutesToTime(droppingPoint.time),
        source,
        destination,
        inventoryItems
      };

      const response = await blockTicket(body);

      if (!response.success) {
        alert("Ticket block failed");
        setIsBooking(false);
        return;
      }

      localStorage.setItem("blockStartTime", Date.now());

      navigate("/booking-success", {
        state: {
          ticketId:             response.blockedTicketId,
          totalFare,
          seats:                selectedSeats,
          passengers:           inventoryItems.map(i => i.passenger[0]),
          contact:              savedContact,
          fromCity,
          toCity,
          date,
          tripDetails,
          tripId,
          boardingPoint,
          droppingPoint,
          seatCount:            selectedSeats.length,
          uid,
          rewardpoint:          response.rewardpoint,
          availableRewardPoint: response.availableRewardPoint,
          busType:              tripDetails?.busType,
          operator:             tripDetails?.travels,
          source,
          destination,
        }
      });

    } catch (err) {
      console.error("Block ticket error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        (err?.message?.includes("500") || err?.response?.status === 500
          ? "This seat was just booked by another user. Please select a different seat."
          : err?.message) ||
        "This seat was just booked by another user. Please select a different seat.";
      setErrorMessage(msg);
      setIsBooking(false);
      setShowErrorPopup(true);
    }
  };

  // ── Review card wrapper ───────────────────────────────────────────────────
  const ReviewCard = ({ icon, title, children }) => (
    <div className="border border-gray-200 rounded-xl p-4 bg-white hover:shadow-sm transition">
      <div className="flex gap-4">
        <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-[#fd561e] flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
          <div className="text-gray-700">{children}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end overflow-hidden">
      <div className="bg-white w-full h-[95vh] rounded-t-2xl flex flex-col animate-slideUp-seat">

        {warning && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100]">
            <div className="bg-gray-700 text-white px-6 py-3 rounded-lg shadow-lg relative overflow-hidden">
              {warning}
              <div className="absolute bottom-0 left-0 h-[3px] bg-[#fd561e] animate-warningBar"></div>
            </div>
          </div>
        )}

        <SeatBookingHeader
          step={step > 3 ? 3 : step}
          handleStepClick={handleStepClick}
          onClose={handleClose}
          fromCity={fromCity}
          toCity={toCity}
          date={date}
          operator={operator || tripDetails?.travels}
        />

        <div className="flex-1 overflow-y-auto p-2 sm:p-4 lg:p-6 pb-24">

          {/* ── STEP 1: Seat Selection ── */}
          {step === 1 && tripDetails && (
            <SeatSelection
              tripDetails={tripDetails}
              selectedSeats={selectedSeats}
              setSelectedSeats={setSelectedSeats}
              onNext={() => setStep(2)}
            />
          )}

          {/* ── STEP 2: Boarding & Dropping ── */}
          {step === 2 && (
            <BoardingDropping
              tripDetails={tripDetails}
              boardingPoint={boardingPoint}
              setBoardingPoint={setBoardingPoint}
              droppingPoint={droppingPoint}
              setDroppingPoint={setDroppingPoint}
              onNext={() => setStep(3)}
            />
          )}

          {/* ── STEP 3: Passenger Form ── */}
          {step === 3 && (
            <PassengerForm
              selectedSeats={selectedSeats}
              boardingPoint={boardingPoint}
              droppingPoint={droppingPoint}
              tripDetails={tripDetails}
              availableTripId={tripId}
              fromCity={fromCity}
              toCity={toCity}
              source={source}
              destination={destination}
              date={date}
              existingPassengers={savedPassengers}
              existingContact={savedContact}
              onPassengerSubmit={(passengers, contact) => {
                setSavedPassengers(passengers);
                setSavedContact(contact);
                setStep(4);
              }}
            />
          )}

          {/* ── STEP 4: Review Booking ── */}
          {step === 4 && savedPassengers && savedContact && (
            <div className="max-w-6xl mx-auto">

              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-[#fd561e] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                  4
                </div>
                <h2 className="text-xl font-bold text-gray-900">Review Your Booking</h2>
              </div>

              <div className="flex flex-col lg:flex-row gap-4 items-start">

                {/* ── LEFT: Review Cards ── */}
                <div className="flex-1 w-full space-y-3">

                  {/* Travel Itinerary */}
                  <ReviewCard icon={<Bus size={22} />} title="Travel Itinerary">
                    <p className="text-base text-gray-800 font-medium">{fromCity} → {toCity}</p>
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                      <Calendar size={14} /> Date: {date}
                    </p>
                    {tripDetails?.travels && (
                      <p className="text-xs text-gray-400 mt-0.5">{tripDetails.travels} · {tripDetails.busType}</p>
                    )}
                  </ReviewCard>

                  {/* Boarding & Dropping */}
                  <ReviewCard icon={<MapPin size={22} />} title="Boarding & Dropping">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:divide-x md:divide-gray-200">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Boarding Point</p>
                        <p className="text-sm font-medium text-gray-900">{boardingPoint?.bpName}</p>
                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                          <Clock size={14} /> {minutesToTime(boardingPoint?.time)}
                        </p>
                      </div>
                      <div className="md:pl-6">
                        <p className="text-xs text-gray-500 mb-1">Dropping Point</p>
                        <p className="text-sm font-medium text-gray-900">{droppingPoint?.bpName}</p>
                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                          <Clock size={14} /> {minutesToTime(droppingPoint?.time)}
                        </p>
                      </div>
                    </div>
                  </ReviewCard>

                  {/* Seat Details */}
                  <ReviewCard icon={<Armchair size={22} />} title="Seat Details">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:divide-x md:divide-gray-200">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                          Selected Seats
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedSeats.map((seat, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-orange-50 border border-orange-200 text-[#fd561e] font-semibold text-xs"
                            >
                              {seat.name}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="md:pl-6">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          Total Seats
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {selectedSeats.length}
                        </p>
                      </div>
                      <div className="md:pl-6">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          Fare (Total)
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          &#8377;{totalFareAmount}
                        </p>
                      </div>
                    </div>
                  </ReviewCard>

                  {/* Traveller Details */}
                  <ReviewCard icon={<Users size={22} />} title="Traveller Details">
                    <div className="overflow-x-auto rounded-xl border border-gray-200">
                      <table className="w-full min-w-[420px]">
                        <thead>
                          <tr className="bg-orange-50">
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">#</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Name</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Gender</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Age</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Seat</th>
                          </tr>
                        </thead>
                        <tbody>
                          {savedPassengers.map((p, i) => (
                            <tr key={i} className="border-t border-gray-100">
                              <td className="px-4 py-3 text-sm text-gray-500">{i + 1}</td>
                              <td className="px-4 py-3 text-sm text-gray-800">{p.title} {p.name}</td>
                              <td className="px-4 py-3 text-sm text-gray-800">{p.gender}</td>
                              <td className="px-4 py-3 text-sm text-gray-800">{p.age}</td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-1 rounded-md bg-orange-50 text-[#fd561e] font-semibold text-sm">
                                  {selectedSeats[i]?.name}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </ReviewCard>

                  {/* Contact Details */}
                  <ReviewCard icon={<Phone size={22} />} title="Contact Details">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:divide-x md:divide-gray-200">
                      <div>
                        <p className="text-xs text-gray-500 mb-1 flex items-center gap-1.5">
                          <Smartphone size={13} /> Mobile
                        </p>
                        <p className="text-sm font-medium text-gray-900 break-words">{savedContact.mobile}</p>
                      </div>
                      <div className="md:pl-6">
                        <p className="text-xs text-gray-500 mb-1 flex items-center gap-1.5">
                          <Mail size={13} /> Email
                        </p>
                        <p className="text-sm font-medium text-gray-900 break-words">{savedContact.email}</p>
                      </div>
                      <div className="md:pl-6">
                        <p className="text-xs text-gray-500 mb-1 flex items-center gap-1.5">
                          <Building2 size={13} /> City
                        </p>
                        <p className="text-sm font-medium text-gray-900 break-words">{savedContact.city}</p>
                      </div>
                      <div className="md:pl-6">
                        <p className="text-xs text-gray-500 mb-1 flex items-center gap-1.5">
                          <Home size={13} /> Address
                        </p>
                        <p className="text-sm font-medium text-gray-900 break-words">{savedContact.address}</p>
                      </div>
                    </div>
                  </ReviewCard>

                </div>

                {/* ── RIGHT: Fare Summary Card with bus illustration ── */}
                <div className="lg:w-80 w-full flex-shrink-0">
                  <div className="bg-orange-50 border border-orange-100 rounded-2xl overflow-hidden">

                    {/* Fare Summary section */}
                    <div className="p-5 border-b border-orange-100">
                      <h3 className="font-bold text-lg text-gray-900 mb-4">
                        Fare Summary
                      </h3>

                      <div className="space-y-2 text-sm text-gray-700">
                        <div className="flex justify-between">
                          <span>Base Fare</span>
                          <span className="font-medium text-gray-900">&#8377;{totalFareAmount}</span>
                        </div>

                        <div className="border-t border-orange-200 pt-3 flex justify-between font-bold text-lg">
                          <span className="text-gray-900">Total Fare</span>
                          <span className="text-[#fd561e]">&#8377;{totalFareAmount}</span>
                        </div>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="p-4 space-y-2.5">
                      <button
                        onClick={() => setStep(3)}
                        disabled={isBooking}
                        className={`w-full py-2.5 rounded-xl border font-semibold text-sm bg-white transition ${
                          isBooking
                            ? "border-gray-200 text-gray-300 cursor-not-allowed"
                            : "border-[#fd561e] text-[#fd561e] hover:bg-orange-50 cursor-pointer"
                        }`}
                      >
                        Edit Booking
                      </button>

                      <button
                        onClick={() => setShowBookConfirm(true)}
                        disabled={isBooking}
                        className={`w-full py-2.5 rounded-xl font-semibold text-sm text-white transition ${
                          isBooking
                            ? "bg-orange-300 cursor-not-allowed"
                            : "bg-[#fd561e] hover:bg-[#e24c16] cursor-pointer"
                        }`}
                      >
                        {isBooking ? "Please wait..." : "Confirm Booking"}
                      </button>
                    </div>

                    {/* Bus + city illustration — level stance, all wheels grounded */}
                    <div className="px-3 pb-3 pt-4">
                      <svg viewBox="0 0 420 250" className="w-full h-auto">
                        <defs>
                          <linearGradient id="busGlassDark" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#5d4842" />
                            <stop offset="100%" stopColor="#43332e" />
                          </linearGradient>
                        </defs>

                        {/* ── Background skyline ── */}
                        <g fill="#fae3d2">
                          <rect x="14"  y="78"  width="26" height="130" rx="2" />
                          <rect x="46"  y="48"  width="36" height="160" rx="2" />
                          <rect x="54"  y="36"  width="14" height="13"  rx="2" />
                          <rect x="88"  y="92"  width="24" height="116" rx="2" />
                          <rect x="118" y="60"  width="42" height="148" rx="2" />
                          <rect x="166" y="86"  width="28" height="122" rx="2" />
                          <rect x="200" y="42"  width="40" height="166" rx="2" />
                          <rect x="208" y="30"  width="16" height="13"  rx="2" />
                          <rect x="246" y="76"  width="30" height="132" rx="2" />
                          <rect x="282" y="56"  width="40" height="152" rx="2" />
                          <rect x="328" y="90"  width="26" height="118" rx="2" />
                          <rect x="360" y="66"  width="36" height="142" rx="2" />
                        </g>
                        {/* Clouds */}
                        <g fill="#f6cfae" opacity="0.7">
                          <ellipse cx="70"  cy="34" rx="16" ry="7" />
                          <ellipse cx="330" cy="28" rx="18" ry="7" />
                        </g>

                        {/* ── Trees ── */}
                        <g>
                          <rect x="20"  y="190" width="5" height="24" rx="2" fill="#e6ab88" />
                          <circle cx="22.5" cy="182" r="14" fill="#f8c9a7" />
                          <rect x="50"  y="200" width="4" height="14" rx="2" fill="#e6ab88" />
                          <circle cx="52" cy="195" r="9" fill="#fad6ba" />
                          <rect x="392" y="188" width="5" height="26" rx="2" fill="#e6ab88" />
                          <circle cx="394.5" cy="179" r="16" fill="#f8c9a7" />
                          <rect x="366" y="200" width="4" height="14" rx="2" fill="#e6ab88" />
                          <circle cx="368" cy="194" r="9" fill="#fad6ba" />
                        </g>

                        {/* ── Ground shadow (wheels sit on this line) ── */}
                        <ellipse cx="232" cy="216" rx="170" ry="10" fill="#e9d2c2" opacity="0.8" />

                        {/* ══ BUS — level stance, front facing right ══ */}
                        <g>

                          {/* Front-right wheel (behind the front face, peeks below bumper) */}
                          <g>
                            <circle cx="342" cy="193" r="19" fill="#2f2622" />
<circle cx="342" cy="193" r="11" fill="#51413a" />
<circle cx="342" cy="193" r="6" fill="#d8b49a" />
                          </g>

                          {/* ── SIDE (recedes slightly to the left) ── */}
                          <path
                            d="M295 96
                               L120 112
                               Q86 110 86 122
                               L86 180
                               Q86 191 100 191
                               L295 196
                               Z"
                            fill="#fd561e"
                          />

                          {/* Side roof edge highlight */}
                          <path d="M295 96 L100 108 Q90 110 88 118 L88 124 Q92 114 102 113 L295 102 Z"
                                fill="#ffffff" opacity="0.35" />

                          {/* Side window band */}
                          <path
                            d="M290 104
                               L125 118
                               Q96 116 96 124
                               L96 146
                               L290 150
                               Z"
                            fill="url(#busGlassDark)"
                          />
                          {/* Window pillars */}
                          <g stroke="#fd6c38" strokeWidth="3">
                            <line x1="140" y1="113" x2="140" y2="147" />
                            <line x1="180" y1="111" x2="180" y2="148" />
                            <line x1="220" y1="109" x2="220" y2="149" />
                            <line x1="258" y1="107" x2="258" y2="149" />
                          </g>

                          7

                          {/* Side skirt */}
                          <path d="M86 174 L86 180 Q86 191 100 191 L295 196 L295 186 L102 182 Q90 181 86 174 Z"
                                fill="#d63e0a" />

                          {/* ── Side wheels (grounded at y≈210) — dual rear axle ── */}
                          {/* Rear Wheel */}
{/* Rear Outer Wheel */}

<g>
  <circle cx="128" cy="194" r="18" fill="#2f2622" />
  <circle cx="122" cy="194" r="11" fill="#51413a" />
  <circle cx="122" cy="194" r="6" fill="#d8b49a" />
</g>

{/* Rear Inner Wheel */}
<g>
  <circle cx="155" cy="194" r="18" fill="#2f2622" />
  <circle cx="165" cy="194" r="11" fill="#51413a" />
  <circle cx="165" cy="194" r="6" fill="#d8b49a" />
</g>
<path
  d="
    M135 156
    Q170 156 185 180
    L185 195
    L135 195
    Z
  "
  fill="#fd561e"
/>

{/* Middle Wheel */}
<g>
  <path
    d="M236 182
       a24 24 0 0 1 48 0"
    stroke="#c93c0a"
    strokeWidth="8"
    fill="none"
  />

  <circle cx="260" cy="194" r="20" fill="#2f2622" />
  <circle cx="260" cy="194" r="12" fill="#51413a" />
  <circle cx="260" cy="194" r="7" fill="#d8b49a" />
</g>

{/* Front Wheel */}
<g>
  <circle cx="342" cy="193" r="19" fill="#2f2622" />
  <circle cx="342" cy="193" r="11" fill="#51413a" />
  <circle cx="342" cy="193" r="6" fill="#d8b49a" />
</g>

                          {/* ── FRONT FACE (right) ── */}
                          <path
                            d="M295 96
                               L352 99
                               Q378 100 379 122
                               L380 180
                               Q380 195 364 196
                               L312 197
                               Q295 197 295 182
                               Z"
                            fill="#fd561e"
                          />

                          {/* Front roof highlight */}
                          <path d="M295 96 L352 99 Q374 100 378 116 L378 121 Q372 106 352 105 L295 102 Z"
                                fill="#ffffff" opacity="0.4" />

                          {/* Mirrors (subtle, at windshield corners) */}
                          <g fill="#e8480f">
                            <rect x="290" y="98"  width="6" height="13" rx="3" />
                            <rect x="376" y="101" width="6" height="13" rx="3" />
                          </g>

                          {/* Windshield — dark tinted */}
                          <path
                            d="M301 106
                               L366 109
                               Q373 110 373 118
                               L374 160
                               L301 156
                               Q298 156 298 151
                               L298 111
                               Q298 106 301 106
                               Z"
                            fill="url(#busGlassDark)"
                          />
                          {/* Diagonal shine */}
                          <path d="M312 107 L334 108 L306 155 L300 152 L300 128 Z" fill="#ffffff" opacity="0.14" />
                          {/* Wiper */}
                          <path d="M308 152 L334 132" stroke="#2f2421" strokeWidth="2" opacity="0.5" fill="none" />

                          {/* Headlights */}
                          <path d="M300 176 L318 177 L318 185 L300 184 Z" fill="#fff6e0" />
                          <path d="M356 178 L374 177 L374 185 L356 186 Z" fill="#fff6e0" />

                          {/* Number plate */}
                          <rect x="327" y="182" width="20" height="8" rx="2" fill="#ffe9d6" />

                          {/* Grille line */}
                          <path d="M300 170 L376 171" stroke="#e8480f" strokeWidth="3" opacity="0.8" />

                          {/* Front bumper */}
                          <path d="M295 186 L380 184 Q380 195 364 196 L312 197 Q295 197 295 186 Z" fill="#d63e0a" />

                        </g>
                      </svg>
                    </div>

                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── BACK CONFIRM POPUP ── */}
      {showBackConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Are you sure?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">If you go back, you may lose the selected seats.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowBackConfirm(false)} className="flex-1 py-3 rounded-xl border-2 border-gray-300 text-gray-700 cursor-pointer font-semibold">Cancel</button>
              <button onClick={() => { setShowBackConfirm(false); onClose(); }} className="flex-1 py-3 rounded-xl bg-[#fd561e] text-white cursor-pointer font-semibold">Yes, Go Back</button>
            </div>
          </div>
        </div>
      )}

      {/* ── BOOK CONFIRM POPUP ── */}
      {showBookConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            {isBooking ? (
              <div className="text-center py-4">
                <div className="flex justify-center mb-4">
                  <svg className="animate-spin h-10 w-10 text-[#fd561e]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Processing...</h3>
                <p className="text-sm text-gray-500">Redirecting to payment page</p>
              </div>
            ) : (
              <>

                <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Confirm Booking?</h3>
                <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
                  Are you sure you want to confirm now and proceed for Payment?
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setShowBookConfirm(false)} className="flex-1 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold cursor-pointer hover:bg-gray-50 transition">Cancel</button>
                  <button onClick={() => handleConfirmBooking()} className="flex-1 py-3 rounded-xl bg-[#fd561e] text-white font-semibold cursor-pointer hover:bg-[#e24c16] transition">Confirm</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── ERROR POPUP ── */}
      {showErrorPopup && (
        <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-[600] p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm text-center shadow-2xl">
            <div className="text-5xl mb-4">😕</div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Seat Unavailable</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-6">{errorMessage}</p>
            <button
              onClick={() => {
                setShowErrorPopup(false);
                setSelectedSeats([]);
                setBoardingPoint(null);
                setDroppingPoint(null);
                setSavedPassengers(null);
                setSavedContact(null);
                setIsBooking(false);
                setStep(1);
                setShowBookConfirm(false);
                setShowBackConfirm(false);
              }}
              className="w-full py-3 rounded-xl bg-[#fd561e] text-white font-bold text-base cursor-pointer hover:bg-[#e24c16] transition"
            >
              Choose Another Seat
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default SeatBookingLayout;