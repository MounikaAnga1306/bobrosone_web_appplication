import React, { useState } from "react";
import { blockTicket } from "../services/blockTicketService";
import { useNavigate } from "react-router-dom";
import { searchTrips } from "../services/BustripService";

const PassengerForm = ({
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
}) => {
const navigate = useNavigate();
  const [passengers, setPassengers] = useState(
    selectedSeats.map(() => ({
      title: "Mr.",
      name: "",
      gender: "",
      age: ""
    }))
  );

  const [contact, setContact] = useState({
    address: "",
    city: "",
    mobile: "",
    email: ""
  });

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (index, field, value) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[index][field] = value;
    setPassengers(updatedPassengers);
  };

  const handleContactChange = (field, value) => {
    setContact({
      ...contact,
      [field]: value
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!termsAccepted) {
      setError("Please accept Terms & Conditions");
      return;
    }

    setError("");

    try {

      const inventoryItems = selectedSeats.map((seat, index) => ({
        seatName: seat.name,
        fare:Number(seat.totalFare), 
        ladiesSeat: seat.ladiesSeat,

        passenger: [
          {
            title: passengers[index].title,
            name: passengers[index].name,
            gender: passengers[index].gender,
            seatName: seat.name,
            mobile: contact.mobile,
            age: Number(passengers[index].age),
            email: contact.email,
            address: contact.address,
            city: contact.city,
            primary: index === 0,
           
          }
        ]
      }));
      
      const body = {
        uId: contact.mobile,
        availableTripId: availableTripId,
        boardingPointId: boardingPoint.bpId,
        droppingPointId: droppingPoint.bpId,
        dateOfJourney: date,
        departureTime: minutesToTime(boardingPoint.time),
        arrivalTime: minutesToTime(droppingPoint.time),
        source:source,
        destination:destination,
        inventoryItems
      };

      console.log("Block Ticket API Body:", body);

      // ✅ USE SERVICE FILE
      const data = await blockTicket(body);

      console.log("Block Ticket Response:", data);

     navigate("/booking-success", {
  state: {
    ticketId: data.blockedTicketId,
    seats: selectedSeats,
    fromCity,
    toCity,
    date
  }
});
    } catch (err) {
      console.error("Block Ticket Error:", err);
    }
  };

 const minutesToTime = (minutes) => {
  const totalMinutes = Number(minutes);

  const hrs24 = Math.floor(totalMinutes / 60) % 24;
  const mins = totalMinutes % 60;

  const period = hrs24 >= 12 ? "PM" : "AM";

  const hrs12 = hrs24 % 12 || 12;

  return `${hrs12}:${String(mins).padStart(2, "0")} ${period}`;
};
  const totalCost = selectedSeats.reduce(
    (sum, seat) => sum + seat.totalFare,
    0
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-6xl mx-auto bg-white p-8 rounded-xl shadow-md"
    >

      <div className="grid grid-cols-4 gap-10">

        {/* PASSENGER DETAILS */}
        <div className="col-span-2">

          <h2 className="text-xl font-semibold mb-6">
            Passenger Details
          </h2>

          {selectedSeats.map((seat, index) => (

            <div
              key={seat.id}
              className={`mb-8 pb-6 ${
                index !== selectedSeats.length - 1
                  ? "border-b border-gray-300"
                  : ""
              }`}
            >

              <label className="block text-sm font-medium mb-2">
                Name <span className="text-red-500">*</span>
              </label>

              <div className="flex gap-3 mb-4">

                <select
                  value={passengers[index]?.title}
                  onChange={(e) =>
                    handleChange(index, "title", e.target.value)
                  }
                  className="border rounded px-3 py-2"
                >
                  <option>Mr.</option>
                  <option>Mrs.</option>
                  <option>Miss</option>
                </select>

                <input
                  type="text"
                  placeholder="Enter Your Name"
                  value={passengers[index]?.name}
                  onChange={(e) =>
                    handleChange(index, "name", e.target.value)
                  }
                  className="flex-1 border rounded px-3 py-2"
                  required
                />

              </div>

              <label className="block text-sm font-medium mb-2">
                Gender <span className="text-red-500">*</span>
              </label>

              <div className="flex gap-6 mb-4">

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`gender-${index}`}
                    checked={passengers[index]?.gender === "Male"}
                    onChange={() =>
                      handleChange(index, "gender", "Male")
                    }
                    required
                  />
                  Male
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`gender-${index}`}
                    checked={passengers[index]?.gender === "Female"}
                    onChange={() =>
                      handleChange(index, "gender", "Female")
                    }
                  />
                  Female
                </label>

              </div>

              <label className="block text-sm font-medium mb-2">
                Age <span className="text-red-500">*</span>
              </label>

              <input
                type="number"
                placeholder="Enter age"
                value={passengers[index]?.age}
                onChange={(e) =>
                  handleChange(index, "age", e.target.value)
                }
                className="w-full border rounded px-3 py-2 mb-4"
                required
              />

              <div className="text-sm">

                <p>
                  Seat Number :
                  <span className="text-blue-600 font-medium ml-1">
                    {seat.name}
                  </span>
                </p>

                <p>
                  Seat Fare :
                  <span className="text-blue-600 font-medium ml-1">
                    ₹{seat.totalFare}
                  </span>
                </p>

              </div>

            </div>

          ))}

        </div>


        {/* CONTACT + TRAVEL DETAILS */}
        <div className="col-span-2">

          <h2 className="text-xl font-semibold mb-6">
            Contact Details
          </h2>

          <div className="space-y-4">

            <div>
              <label className="block text-sm font-medium mb-1">
                Address <span className="text-red-500">*</span>
              </label>

              <textarea
                placeholder="Enter your address"
                className="w-full border rounded px-3 py-2"
                required
                onChange={(e)=>handleContactChange("address",e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                City <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                placeholder="Enter your city"
                className="w-full border rounded px-3 py-2"
                required
                onChange={(e)=>handleContactChange("city",e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Mobile <span className="text-red-500">*</span>
              </label>

              <div className="flex">

                <span className="border rounded-l px-3 py-2 bg-gray-100">
                  +91
                </span>

                <input
                  type="tel"
                  placeholder="Enter your mobile number"
                  className="flex-1 border rounded-r px-3 py-2"
                  maxLength="10"
                  pattern="[0-9]{10}"
                  required
                  onChange={(e)=>handleContactChange("mobile",e.target.value)}
                />

              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Email <span className="text-red-500">*</span>
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                className="w-full border rounded px-3 py-2"
                required
                onChange={(e)=>handleContactChange("email",e.target.value)}
              />
            </div>

          </div>

          <h3 className="font-semibold mt-6 text-lg">
            Travel Itinerary
          </h3>

          <div className="border mt-4 rounded-lg p-5 bg-gray-50">

            <p className="mb-1">
              Trip From:
              <span className="font-semibold ml-1">{fromCity}</span>
              {" "}to{" "}
              <span className="font-semibold">{toCity}</span>
            </p>

            <p className="mb-3">
              Date of Journey:
              <span className="font-semibold ml-1">{date}</span>
            </p>

            <div className="text-sm text-gray-700 mb-3">
              {tripDetails?.travels}
              <br />
              {tripDetails?.busType}
            </div>
           

            <p className="text-sm mb-1">
              B-Point:
              <span className="font-semibold ml-1">
                {boardingPoint?.bpName}
              </span>
              {" "} - B-Time:
              <span className="font-semibold ml-1">
                {minutesToTime(boardingPoint?.time)}
              </span>
            </p>

            <p className="text-sm mb-1">
              D-Point:
              <span className="font-semibold ml-1">
                {droppingPoint?.bpName}
              </span>
              {" "} - D-Time:
              <span className="font-semibold ml-1">
                {minutesToTime(droppingPoint?.time)}
              </span>
            </p>

            <p className="text-sm font-medium mt-3">
              Total Seat(s) {selectedSeats.length} - Total Cost ₹{totalCost}
            </p>

          </div>

        </div>

      </div>

      <div className="mt-8 text-center">
        <p className="text-gray-600 mb-4"> You will receive booking-related SMS updates on the mobile number provided above. </p>

        <label className="flex items-center justify-center gap-2 mb-5">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            required
          />
          I accept the
          <span className="text-blue-600 underline ml-1">
            terms and conditions
          </span>
        </label>

        {error && (
          <p className="text-red-500 mb-3">{error}</p>
        )}

        <button
          type="submit"
          className="bg-[#fd561e] text-white px-12 py-3 rounded-lg hover:opacity-90"
        >
          Confirm
        </button>

      </div>

    </form>
  );
};

export default PassengerForm;