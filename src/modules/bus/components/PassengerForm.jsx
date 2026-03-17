import {React, useState } from "react";
import { useNavigate, useLocation  } from "react-router-dom";
import { getUserDetails } from "../../../utils/authHelper";

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
   existingPassengers,   // ← ONLY ADDITION
  existingContact,      
  onPassengerSubmit,
}) => {

const navigate = useNavigate();
const storedUser = JSON.parse(localStorage.getItem("user"));
const loggedUser = storedUser?.user || null;
const user = getUserDetails();
console.log("User Details:", user);


const [passengers, setPassengers] = useState(
  existingPassengers ||
  selectedSeats.map(() => ({
    title: "",
    name: "",
    gender: "",
    age: ""
  }))
);

const [contact, setContact] = useState(
  existingContact || {  
  address: "",
  city: "",
   mobile: user?.mobile || loggedUser?.umob || "",   // ← autofill
    email: user?.email || loggedUser?.umail || "",    // ← autofill
    uid: user?.uid || ""
});

const [termsAccepted, setTermsAccepted] = useState(false);
const [error, setError] = useState("");

const handleChange = (index, field, value) => {

  if (field === "age") {
    if (value < 0) return;
  }

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

const handleSubmit = (e) => {

  e.preventDefault();

  for (let p of passengers) {

    if (p.age < 0) {
      alert("Age cannot be negative");
      return;
    }

    if (!p.name || !p.gender || !p.age) {
      alert("⚠️ Please enter complete passenger details.");
      return;
    }

    if (p.age < 1 || p.age > 120) {
      alert("⚠️ Please enter a valid passenger age.");
      return;
    }
  }

  if (!termsAccepted) {
    setError("Please accept Terms & Conditions");
    return;
  }

  setError("");

  // ← ONLY ADDITION: save data to SeatBookingLayout before navigating
  onPassengerSubmit(passengers, contact);

  navigate("/review-booking", {
    state: {
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
      existingPassengers: passengers, 
      existingContact: contact
    }
  });
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

<div className="col-span-2">

<h2 className="text-xl font-semibold mb-6">
Passenger Details
</h2>

{selectedSeats.map((seat, index) => (

<div
key={seat.name}
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
<option>Mr</option>
<option>Mrs</option>
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
max="120"
placeholder="Enter age"
value={passengers[index]?.age}
min="0"
onChange={(e) => handleChange(index, "age", e.target.value)}
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

    {/* Address */}
    <div>
      <label className="block text-sm font-medium mb-1">
        Address <span className="text-red-500">*</span>
      </label>

      <textarea
        placeholder="Enter your address"
        className="w-full border rounded px-3 py-2"
        required
        value={contact.address}
        onChange={(e)=>handleContactChange("address",e.target.value)}
      />
    </div>

    {/* City */}
    <div>
      <label className="block text-sm font-medium mb-1">
        City <span className="text-red-500">*</span>
      </label>

      <input
        type="text"
        placeholder="Enter your city"
        className="w-full border rounded px-3 py-2"
        required
        value={contact.city}
        onChange={(e)=>handleContactChange("city",e.target.value)}
      />
    </div>

    {/* Mobile */}
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
          value={contact.mobile}
          placeholder="Enter your mobile number"
          className="flex-1 border rounded-r px-3 py-2"
          maxLength="10"
          pattern="[0-9]{10}"
          required
          onChange={(e)=>handleContactChange("mobile",e.target.value)}
        />

      </div>
    </div>

    {/* Email */}
    <div>
      <label className="block text-sm font-medium mb-1">
        Email <span className="text-red-500">*</span>
      </label>

      <input
        type="email"
        value={contact.email}
        placeholder="Enter your email"
        className="w-full border rounded px-3 py-2"
        required
        onChange={(e)=>handleContactChange("email",e.target.value)}
      />
    </div>

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
className="bg-[#fd561e] text-white px-12 py-3 rounded-lg cursor-pointer hover:bg-[#e14d1a]"
>
Confirm
</button>

</div>

</form>

);

};

export default PassengerForm;