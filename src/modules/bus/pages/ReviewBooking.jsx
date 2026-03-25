import { useLocation, useNavigate } from "react-router-dom";
import { blockTicket } from "../services/blockTicketService";
import { useState } from "react";
import { getUserDetails } from "../../../utils/authHelper";

const ReviewBooking = () => {

const { state } = useLocation();
const navigate = useNavigate();
const [isLoading, setIsLoading] = useState(false);

if (!state) {
  navigate("/");
  return null;
}

const {
  passengers,
  contact,
  selectedSeats,
  boardingPoint,
  droppingPoint,
  tripDetails,
  availableTripId,
  fromCity,
  toCity,
  source,
  destination,
  date,
  seatCount
} = state;


const user = getUserDetails();
const uid = String(user?.uid || contact?.uid || contact.mobile);

console.log("=== UID DEBUG ===");
console.log("user?.uid:", user?.uid);
console.log("contact?.uid:", contact?.uid);
console.log("final uid:", uid);
console.log("=================");

const totalFare = selectedSeats.reduce(
  (sum, seat) => sum + seat.totalFare,
  0
);

const minutesToTime = (minutes) => {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};

// CHANGED: Edit button → fire event to reopen SeatBookingLayout at step 3
const handleEdit = () => {
  window.dispatchEvent(new CustomEvent("reopenSeatBooking", {
    detail: {
      step: 3,
      passengers,
      contact,
    }
  }));
  navigate(-1);
};

const handleConfirmBooking = async () => {
  if (isLoading) return;
  setIsLoading(true);

  try {
    const inventoryItems = selectedSeats.map((seat, index) => ({
      seatName: seat.name,
      fare: seat.totalFare,
      ladiesSeat: seat.ladiesSeat,
      passenger: [{
        title: passengers[index].title || "Ms",
        name: passengers[index].name,
        gender: passengers[index].gender,
        seatName: seat.name,
        mobile: contact.mobile,
        age: Number(passengers[index].age),
        email: contact.email,
        address: contact.address,
        city: contact.city,
        primary: index === 0,
        idType: "",
        idNumber: ""
      }]
    }));

    const body = {
      uId: uid,
      availableTripId,
      boardingPointId: boardingPoint.bpId,
      droppingPointId: droppingPoint.bpId,
      dateOfJourney: date,
      departureTime: minutesToTime(boardingPoint.time),
      arrivalTime: minutesToTime(droppingPoint.time),
      source,
      destination,
      inventoryItems
    };

    console.log("Block Ticket Body:", JSON.stringify(body, null, 2));

    const response = await blockTicket(body);

    console.log("Block Ticket Response:", response);

    if (!response.success) {
      alert("Ticket block failed");
      setIsLoading(false);
      return;
    }

    localStorage.setItem("blockStartTime", Date.now());

    navigate("/booking-success", {
      state: {
        ticketId: response.blockedTicketId,
        totalFare,
        seats: selectedSeats,
        passengers: inventoryItems.map(i => i.passenger[0]),
        contact,
        fromCity,
        toCity,
        date,
        tripDetails,
        boardingPoint,
        droppingPoint,
        seatCount: selectedSeats.length,
        uid: uid,
        rewardpoint: response.rewardpoint,               
        availableRewardPoint: response.availableRewardPoint,
        busType: tripDetails?.busType,
        operator: tripDetails?.travels,
      }
    });

  } catch (err) {
    console.error("Block ticket error:", err);
    alert("Seat already booked by another user.");
    setIsLoading(false);
    navigate(-1);
  }
};

return (
  <div className="min-h-screen bg-gray-100 flex justify-center p-6 mt-25">
    <div className="bg-white rounded-xl shadow-md p-8 w-[900px]">

      <h2 className="text-2xl font-semibold mb-6">Review Your Booking</h2>

      <div className="border-b pb-4 mb-4">
        <p className="font-semibold text-lg mb-2">Travel Itinerary</p>
        <p>{fromCity} → {toCity}</p>
        <p>Date : {date}</p>
        <p className="text-sm text-gray-600 mt-2">{tripDetails?.travels}</p>
        <p className="text-sm text-gray-600">{tripDetails?.busType}</p>
      </div>

      <div className="border-b pb-4 mb-4">
        <p className="font-semibold text-lg mb-2">Boarding & Dropping</p>
        <p>Boarding : <span className="font-medium ml-1">{boardingPoint?.bpName}</span></p>
        <p className="text-sm text-gray-600">Time : {minutesToTime(boardingPoint?.time)}</p>
        <p className="mt-2">Dropping : <span className="font-medium ml-1">{droppingPoint?.bpName}</span></p>
        <p className="text-sm text-gray-600">Time : {minutesToTime(droppingPoint?.time)}</p>
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
        <p className="mt-2 text-sm font-medium">Total Seats : {seatCount}</p>
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
            {passengers.map((p, i) => (
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
        <p>Mobile : {contact?.mobile}</p>
        <p>Email : {contact?.email}</p>
        <p>City : {contact?.city}</p>
        <p className="text-sm text-gray-600">Address : {contact?.address}</p>
      </div>

      <div className="text-xl font-semibold mb-6">
        Total Fare : ₹{totalFare}
      </div>

      <div className="flex gap-6">
        <button
          onClick={handleEdit}
          disabled={isLoading}
          className={`px-6 py-3 text-white rounded ${
            isLoading ? "bg-gray-300 cursor-not-allowed" : "bg-gray-400 hover:bg-gray-500 cursor-pointer"
          }`}
        >
          Edit
        </button>
        <button
          onClick={handleConfirmBooking}
          disabled={isLoading}
          className={`px-6 py-3 text-white rounded ${
            isLoading ? "bg-orange-300 cursor-not-allowed" : "bg-[#fd561e] hover:bg-[#e24c16] cursor-pointer"
          }`}
        >
          {isLoading ? "Please wait..." : "Confirm Booking"}
        </button>
      </div>

    </div>
  </div>
);

};

export default ReviewBooking;