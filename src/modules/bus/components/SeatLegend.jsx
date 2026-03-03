const SeatLegend = () => {
  return (
    <div className="bg-white border rounded-xl p-6 w-1/3">
      <h3 className="font-semibold mb-4">Know Your Seat Types</h3>

      <div className="space-y-3 text-sm">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-green-100 rounded" />
          Available
        </div>

        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-gray-300 rounded" />
          Booked
        </div>

        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-pink-200 rounded" />
          Reserved for Ladies
        </div>

        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-red-500 rounded" />
          Selected
        </div>
      </div>
    </div>
  );
};

export default SeatLegend;
