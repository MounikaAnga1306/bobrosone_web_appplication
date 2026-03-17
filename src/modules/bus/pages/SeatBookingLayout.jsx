import { useEffect, useState } from "react";
import { fetchTripDetails } from "../services/TripDetailsService";

import SeatBookingHeader from "../components/SeatBookingHeader";
import SeatSelection from "../components/SeatSelection";
import BoardingDropping from "../components/BoardingDropping";
import PassengerForm from "../components/PassengerForm";

const SeatBookingLayout = ({ tripId, open, onClose,fromCity,toCity,source,destination,date }) => {
  const [tripDetails, setTripDetails] = useState(null);
  const [step, setStep] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [boardingPoint, setBoardingPoint] = useState(null);
  const [droppingPoint, setDroppingPoint] = useState(null);
  const [warning, setWarning] = useState("");

   const [savedPassengers, setSavedPassengers] = useState(null);
  const [savedContact, setSavedContact] = useState(null);

  const showWarning = (msg) => {
  setWarning(msg);
};
useEffect(() => {
  if (selectedSeats.length > 0 && warning === "Please select at least one seat") {
    setWarning("");
  }

  if (
    boardingPoint &&
    droppingPoint &&
    warning === "Please select boarding and dropping points"
  ) {
    setWarning("");
  }
}, [selectedSeats, boardingPoint, droppingPoint]);
const handleStepClick = (stepNumber) => {
  if (stepNumber === 2 && selectedSeats.length === 0) {
    showWarning("Please select at least one seat");
    return;
  }

  if (stepNumber === 3 && (!boardingPoint || !droppingPoint)) {
    showWarning("Please select boarding and dropping points");
    return;
  }

  setStep(stepNumber);
};

  useEffect(() => {
  if (!tripId) return;

  // RESET BOOKING STATE
  setStep(1);
  setSelectedSeats([]);
  setBoardingPoint(null);
  setDroppingPoint(null);
  setWarning("");

   // ← reset saved data too when new trip selected
    setSavedPassengers(null);
    setSavedContact(null);

  const loadTripDetails = async () => {
    const data = await fetchTripDetails(tripId);
    setTripDetails(data);
  };

  loadTripDetails();

}, [tripId]);

 // ← ONLY ADDITION: when review page navigates back, go to step 3
  useEffect(() => {
    const handlePopState = () => {
      if (open) {
        setStep(3);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [open]);

  if (!open) return null;

  return (
    
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end">
      
      <div className="bg-white w-full h-[95vh] rounded-t-2xl flex flex-col animate-slideUp-seat">
         {warning && ( <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100]"> <div className="bg-gray-700 text-white px-6 py-3 rounded-lg shadow-lg relative overflow-hidden"> {warning} {/* moving line */} <div className="absolute bottom-0 left-0 h-[3px] bg-[#fd561e] animate-warningBar"></div> </div> </div> )}
        {/* Header */}
        <SeatBookingHeader step={step}  handleStepClick={handleStepClick} onClose={onClose}  fromCity={fromCity}
          toCity={toCity} date={date} />

        {/* Body */}
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

              // ← ONLY ADDITION: pass saved data as props
              existingPassengers={savedPassengers}
              existingContact={savedContact}
              onPassengerSubmit={(passengers, contact) => {
                setSavedPassengers(passengers);
                setSavedContact(contact);
              }}
            />
          )}
        </div>
        
      </div>
      
    </div>
  );
};

export default SeatBookingLayout;
