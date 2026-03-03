import { useEffect, useState } from "react";
import { fetchTripDetails } from "../services/TripDetailsService";

import SeatBookingHeader from "../components/SeatBookingHeader";
import SeatSelection from "../components/SeatSelection";
import BoardingDropping from "../components/BoardingDropping";
import PassengerForm from "../components/PassengerForm";

const SeatBookingLayout = ({ tripId, open, onClose }) => {
  const [tripDetails, setTripDetails] = useState(null);
  const [step, setStep] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [boardingPoint, setBoardingPoint] = useState(null);
  const [droppingPoint, setDroppingPoint] = useState(null);

  useEffect(() => {
    if (!tripId) return;

    const loadTripDetails = async () => {
      const data = await fetchTripDetails(tripId);
      setTripDetails(data);
    };

    loadTripDetails();
  }, [tripId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end">
      <div className="bg-white w-full h-[95vh] rounded-t-2xl flex flex-col">
        {/* Header */}
        <SeatBookingHeader step={step} setStep={setStep} onClose={onClose} />

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
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SeatBookingLayout;
