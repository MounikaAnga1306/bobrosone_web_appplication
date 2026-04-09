// src/modules/bus/pages/SeatBookingLayout.jsx (or wherever this component is)
import { useEffect, useState } from "react";
import { fetchTripDetails } from "../services/TripDetailsService";
import { blockTicket } from "../services/blockTicketService";
import { useNavigate } from "react-router-dom";
import { getUserDetails } from "../../../utils/authHelper";

import SeatBookingHeader from "../components/SeatBookingHeader";
import SeatSelection from "../components/SeatSelection";
import BoardingDropping from "../components/BoardingDropping";
import PassengerForm from "../components/PassengerForm";

const SeatBookingLayout = ({ tripId, open, onClose, fromCity, toCity, source, destination, date,operator }) => {
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
  const [showBackConfirm, setShowBackConfirm] = useState(false);  // Only for final review page
  const [showBookConfirm, setShowBookConfirm] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const showWarning = (msg) => setWarning(msg);

  const handleClose = () => {
    // Show back confirmation ONLY on step 4 (review page)
    if (step === 4) {
      setShowBackConfirm(true);
    } else {
      // For steps 1-3, just close directly
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
      // Show back confirmation for browser back button only on final review page
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
  const mins = totalMinutes % 60;
  const period = hrs24 >= 12 ? "PM" : "AM";
  const hrs12 = hrs24 % 12 || 12;
  return `${hrs12}:${String(mins).padStart(2, "0")} ${period}`;
};

  const handleConfirmBooking = async () => {
    if (isBooking) return;
    setIsBooking(true);

    const user = getUserDetails();
    const uid  = String(user?.uid || savedContact?.uid || savedContact?.mobile);
    const totalFare = selectedSeats.reduce((sum, s) => sum + s.totalFare, 0);

    try {
      const inventoryItems = selectedSeats.map((seat, index) => ({
        seatName: seat.name,
        fare: seat.totalFare,
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
        uId: uid,
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
      console.log("tripDetails:", tripDetails);


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
      const msg = err?.response?.data?.message 
    || err?.response?.data?.error 
    || (err?.message?.includes("500") || err?.response?.status === 500 
        ? "This seat was just booked by another user. Please select a different seat." 
        : err?.message)
    || "This seat was just booked by another user. Please select a different seat.";
  setErrorMessage(msg);
  setIsBooking(false);
  setShowErrorPopup(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end">
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

        <div className="flex-1 overflow-y-auto p-6">

          {step === 1 && tripDetails && (
            <SeatSelection
              tripDetails={tripDetails}
              selectedSeats={selectedSeats}
              setSelectedSeats={setSelectedSeats}
              onNext={() => setStep(2)}
            />
          )}

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

          {step === 4 && savedPassengers && savedContact && (
            <div className="max-w-3xl mx-auto bg-white rounded-xl">

              <h2 className="text-2xl font-semibold mb-6">Review Your Booking</h2>

              <div className="border-b pb-4 mb-4 flex flex-col sm:flex-row gap-6">
  
  {/* Travel Itinerary - Left */}
  <div className="flex-1">
    <p className="font-semibold text-lg mb-2">Travel Itinerary</p>
    <p>{fromCity} → {toCity}</p>
    <p>Date : {date}</p>
    <p className="text-sm text-gray-600 mt-2">{tripDetails?.travels}</p>
    <p className="text-sm text-gray-600">{tripDetails?.busType}</p>
  </div>

  {/* Boarding & Dropping - Right */}
  <div className="flex-1">
    <p className="font-semibold text-lg mb-2">Boarding & Dropping</p>
    <p>Boarding : <span className="font-medium ml-1">{boardingPoint?.bpName}</span></p>
    <p className="text-sm text-gray-600">Time : {minutesToTime(boardingPoint?.time)}</p>
    <p className="mt-2">Dropping : <span className="font-medium ml-1">{droppingPoint?.bpName}</span></p>
    <p className="text-sm text-gray-600">Time : {minutesToTime(droppingPoint?.time)}</p>
  </div>

</div>

              <div className="border-b pb-4 mb-4">
                <p className="font-semibold text-lg mb-2">Seat Details</p>
                <table className="w-full border border-gray-300">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 border">Seat</th>
                      <th className="p-2 border">Fare</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSeats.map((seat, i) => (
                      <tr key={i} className="text-center">
                        <td className="p-2 border">{seat.name}</td>
                        <td className="p-2 border">₹{seat.totalFare}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-2 text-sm font-medium">Total Seats : {selectedSeats.length}</p>
              </div>

              <div className="border-b pb-4 mb-4">
                <p className="font-semibold text-lg mb-2">Passenger Details</p>
                <table className="w-full border border-gray-300">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 border">Name</th>
                      <th className="p-2 border">Gender</th>
                      <th className="p-2 border">Age</th>
                      <th className="p-2 border">Seat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {savedPassengers.map((p, i) => (
                      <tr key={i} className="text-center">
                        <td className="p-2 border">{p.title} {p.name}</td>
                        <td className="p-2 border">{p.gender}</td>
                        <td className="p-2 border">{p.age}</td>
                        <td className="p-2 border">{selectedSeats[i]?.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mb-6">
                <p className="font-semibold text-lg mb-2">Contact Details</p>
                <p>Mobile : {savedContact?.mobile}</p>
                <p>Email : {savedContact?.email}</p>
                <p>City : {savedContact?.city}</p>
                <p className="text-sm text-gray-600">Address : {savedContact?.address}</p>
              </div>

              <div className="text-xl font-semibold mb-6">
                Total Fare : ₹{selectedSeats.reduce((sum, s) => sum + s.totalFare, 0)}
              </div>

              <div className="flex gap-6">
                <button
                  onClick={() => setStep(3)}
                  disabled={isBooking}
                  className={`px-6 py-3 text-white rounded ${
                    isBooking ? "bg-gray-300 cursor-not-allowed" : "bg-gray-400 hover:bg-gray-500 cursor-pointer"
                  }`}
                >
                  Edit
                </button>
                <button
                  onClick={() => setShowBookConfirm(true)}
                  disabled={isBooking}
                  className={`px-6 py-3 text-white rounded ${
                    isBooking ? "bg-orange-300 cursor-not-allowed" : "bg-[#fd561e] hover:bg-[#e24c16] cursor-pointer"
                  }`}
                >
                  {isBooking ? "Please wait..." : "Confirm Booking"}
                </button>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* ── BACK CONFIRM POPUP ── */}
      {showBookConfirm && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4">
    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
      
      {isBooking ? (
        // ── LOADING STATE ──
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
        // ── CONFIRM STATE ──
        <>
          <div className="text-3xl text-center mb-3">🎟️</div>
          <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Confirm Booking?</h3>
          <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
            Are you sure you want to confirm now and proceed for Payment?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowBookConfirm(false)}
              className="flex-1 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold cursor-pointer hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => handleConfirmBooking()}
              className="flex-1 py-3 rounded-xl bg-[#fd561e] text-white font-semibold cursor-pointer hover:bg-[#e24c16] transition"
            >
              Confirm
            </button>
          </div>
        </>
      )}

    </div>
  </div>
)}
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