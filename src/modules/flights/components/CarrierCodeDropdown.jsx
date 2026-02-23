import React from "react";

export default function CarrierCodeDropdown({
  airlines = [],
  selectedCode = "",
  onChange,
  loading = false,
}) {
  return (
    <>
      {/* Floating Label */}
      <label
        className={`absolute left-3 transition-all duration-200 pointer-events-none
        ${
          selectedCode
            ? "text-xs top-1 text-blue-600"
            : "text-gray-500 top-1/2 -translate-y-1/2 text-base group-focus-within:text-blue-600 group-focus-within:text-xs group-focus-within:top-1 group-focus-within:translate-y-0"
        }`}
      >
        Carrier Code
      </label>

      {/* Dropdown */}
      <select
        value={selectedCode}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
        className="w-full bg-transparent text-lg font-semibold outline-none pt-5 border-b-2 border-transparent focus:border-blue-600 transition cursor-pointer"
      >
        <option value="">
          {loading ? "Loading..." : "Select Airline"}
        </option>

        {airlines.map((airline) => (
          <option key={airline.id} value={airline.code}>
            {airline.name} ({airline.code})
          </option>
        ))}
      </select>
    </>
  );
}
