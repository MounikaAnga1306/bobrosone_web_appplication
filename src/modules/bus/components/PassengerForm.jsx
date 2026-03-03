const PassengerForm = ({ selectedSeats }) => {
  return (
    <div>
      <h3 className="font-semibold mb-6">Passenger Information</h3>

      {selectedSeats.map((seat, index) => (
        <div key={index} className="border p-4 rounded mb-4">
          <p className="mb-2 font-medium">Seat {seat.name}</p>

          <input
            type="text"
            placeholder="Passenger Name"
            className="w-full border p-2 rounded mb-2"
          />

          <input
            type="number"
            placeholder="Age"
            className="w-full border p-2 rounded mb-2"
          />

          <select className="w-full border p-2 rounded">
            <option>Male</option>
            <option>Female</option>
          </select>
        </div>
      ))}

      <button className="bg-green-600 text-white px-6 py-3 rounded">
        Pay Now
      </button>
    </div>
  );
};

export default PassengerForm;
