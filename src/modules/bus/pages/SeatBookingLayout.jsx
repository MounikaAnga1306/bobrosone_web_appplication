// src/modules/bus/pages/SeatBookingLayout.jsx
import { useEffect, useState } from "react";
import { fetchTripDetails } from "../services/TripDetailsService";
import { blockTicket } from "../services/blockTicketService";
import { useNavigate } from "react-router-dom";
import { getUserDetails } from "../../../utils/authHelper";
import { Bus, MapPin, Armchair, Users, Phone } from "lucide-react";

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
          <h3 className="font-semibold text-gray-900 mb-1.5">{title}</h3>
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
            <div className="max-w-5xl mx-auto">

              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-[#fd561e] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                  4
                </div>
                <h2 className="text-xl font-bold text-gray-900">Review Your Booking</h2>
              </div>

              <div className="flex flex-col lg:flex-row gap-4 items-start">

                {/* ── LEFT: Review Cards ── */}
                <div className="flex-1 space-y-2.5">

                  {/* Travel Itinerary */}
                  <ReviewCard icon={<Bus size={22} />} title="Travel Itinerary">
                    <p className="text-sm text-gray-700">{fromCity} → {toCity}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Date: {date}</p>
                    {tripDetails?.travels && (
                      <p className="text-xs text-gray-400 mt-0.5">{tripDetails.travels} · {tripDetails.busType}</p>
                    )}
                  </ReviewCard>

                  {/* Boarding & Dropping */}
                  <ReviewCard icon={<MapPin size={22} />} title="Boarding & Dropping">
                    <div className="space-y-0.5 text-sm text-gray-700">
                      <div className="flex justify-between">
                        <span><span className="font-medium">Boarding:</span>&nbsp;&nbsp;{boardingPoint?.bpName}</span>
                        <span className="text-gray-500">{minutesToTime(boardingPoint?.time)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span><span className="font-medium">Dropping:</span>&nbsp;&nbsp;{droppingPoint?.bpName}</span>
                        <span className="text-gray-500">{minutesToTime(droppingPoint?.time)}</span>
                      </div>
                    </div>
                  </ReviewCard>

                  {/* Seat Details */}
                  <ReviewCard icon={<Armchair size={22} />} title="Seat Details">
                    <div className="flex flex-wrap gap-x-8 text-sm text-gray-700">
                      {selectedSeats.map((seat, i) => (
                        <span key={i}>
                          Seat:&nbsp;<span className="font-medium">{seat.name}</span>
                          &nbsp;&nbsp;&nbsp;Fare:&nbsp;<span className="font-medium">&#8377;{seat.totalFare}</span>
                          &nbsp;&nbsp;&nbsp;Total Seats:&nbsp;<span className="font-medium">{selectedSeats.length}</span>
                        </span>
                      ))}
                    </div>
                  </ReviewCard>

                  {/* Passenger Details */}
                  <ReviewCard icon={<Users size={22} />} title="Passenger Details">
                    {savedPassengers.map((p, i) => (
                      <div key={i} className="flex gap-6 text-sm text-gray-700">
                        <span>{p.title} {p.name}</span>
                        <span>{p.gender}</span>
                        <span>{p.age}</span>
                        <span>{selectedSeats[i]?.name}</span>
                      </div>
                    ))}
                  </ReviewCard>

                  {/* Contact Details */}
                  <ReviewCard icon={<Phone size={22} />} title="Contact Details">
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-sm text-gray-700">
                      <span>Mobile: {savedContact?.mobile}</span>
                      <span>Email: {savedContact?.email}</span>
                      <span>City: {savedContact?.city}</span>
                      <span>Address: {savedContact?.address}</span>
                    </div>
                  </ReviewCard>

                </div>

                {/* ── RIGHT: Fare Card with bus illustration ── */}
                <div className="lg:w-60 w-full flex-shrink-0">
                  <div className="bg-orange-50 border border-orange-100 rounded-2xl overflow-hidden">

                    {/* Fare section */}
                    <div className="p-5 text-center border-b border-orange-100">
                      <p className="text-gray-600 font-medium text-sm mb-1">Total Fare</p>
                      <p className="text-4xl font-bold text-gray-900">
                        &#8377;{selectedSeats.reduce((sum, s) => sum + s.totalFare, 0)}
                      </p>
                    </div>

                    {/* Buttons */}
                    <div className="p-4 space-y-2.5">
                      <button
                        onClick={() => setStep(3)}
                        disabled={isBooking}
                        className={`w-full py-2.5 rounded-xl border font-semibold text-sm bg-white transition ${
                          isBooking
                            ? "border-gray-200 text-gray-300 cursor-not-allowed"
                            : "border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
                        }`}
                      >
                        Edit
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

                    {/* Bus + city illustration */}
                    <div className="px-2 pb-2">
                      <svg viewBox="0 0 220 130" xmlns="http://www.w3.org/2000/svg" className="w-full">
                        {/* City skyline — light orange tones */}
                        <rect x="0"   y="75" width="12" height="35" rx="1" fill="#fbd0b0" />
                        <rect x="14"  y="60" width="16" height="50" rx="1" fill="#fbd0b0" />
                        <rect x="16"  y="50" width="12" height="12" rx="1" fill="#f9bfa0" />
                        <rect x="32"  y="68" width="12" height="42" rx="1" fill="#fbd0b0" />
                        <rect x="46"  y="55" width="18" height="55" rx="1" fill="#fbd0b0" />
                        <rect x="49"  y="44" width="12" height="13" rx="1" fill="#f9bfa0" />
                        <rect x="66"  y="70" width="14" height="40" rx="1" fill="#fbd0b0" />
                        <rect x="82"  y="50" width="20" height="60" rx="1" fill="#fbd0b0" />
                        <rect x="85"  y="38" width="14" height="14" rx="1" fill="#f9bfa0" />
                        <rect x="104" y="63" width="16" height="47" rx="1" fill="#fbd0b0" />
                        <rect x="122" y="72" width="12" height="38" rx="1" fill="#fbd0b0" />
                        <rect x="136" y="56" width="18" height="54" rx="1" fill="#fbd0b0" />
                        <rect x="139" y="45" width="12" height="13" rx="1" fill="#f9bfa0" />
                        <rect x="156" y="65" width="14" height="45" rx="1" fill="#fbd0b0" />
                        <rect x="172" y="74" width="12" height="36" rx="1" fill="#fbd0b0" />
                        <rect x="186" y="60" width="16" height="50" rx="1" fill="#fbd0b0" />
                        <rect x="204" y="70" width="16" height="40" rx="1" fill="#fbd0b0" />

                        {/* Road */}
                        <rect x="0" y="108" width="220" height="22" fill="#f3e8e0" />
                        <rect x="0" y="108" width="220" height="2"  fill="#e8d0c0" />

                        {/* Bus body */}
                        <rect x="18" y="76" width="148" height="34" rx="7" fill="#fd7c50" opacity="0.85" />
                        {/* Bus front face */}
                        <rect x="158" y="80" width="10" height="26" rx="3" fill="#fd6030" opacity="0.85" />
                        {/* Windows */}
                        <rect x="28"  y="81" width="20" height="13" rx="2" fill="white" opacity="0.75" />
                        <rect x="54"  y="81" width="20" height="13" rx="2" fill="white" opacity="0.75" />
                        <rect x="80"  y="81" width="20" height="13" rx="2" fill="white" opacity="0.75" />
                        <rect x="106" y="81" width="20" height="13" rx="2" fill="white" opacity="0.75" />
                        <rect x="132" y="81" width="16" height="13" rx="2" fill="white" opacity="0.75" />
                        {/* Destination strip */}
                        <rect x="28" y="97" width="62" height="8"  rx="2" fill="#e24c16" opacity="0.7" />
                        {/* Wheels */}
                        <circle cx="52"  cy="112" r="9" fill="#c0604a" />
                        <circle cx="52"  cy="112" r="4" fill="#e8a090" />
                        <circle cx="130" cy="112" r="9" fill="#c0604a" />
                        <circle cx="130" cy="112" r="4" fill="#e8a090" />
                        {/* Headlight */}
                        <rect x="162" y="85" width="7" height="5" rx="1.5" fill="#fef3c7" opacity="0.9" />
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
                <div className="text-3xl text-center mb-3">🎟️</div>
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