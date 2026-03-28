// src/modules/flights/components/roundtrip/RoundTripPage.jsx

import React, { useState, useMemo } from 'react';
import OutboundFlightsColumn from './OutboundFlightsColumn';
import ReturnFlightsColumn from './ReturnFlightsColumn';
import SelectionSummaryBar from './SelectionSummaryBar';

const RoundTripPage = ({ data, passengerCount, onContinue, filters }) => {
  const [selectedOutbound, setSelectedOutbound] = useState(null);
  const [selectedReturn, setSelectedReturn] = useState(null);

  // Apply filters to outbound flights
  const filteredOutbound = useMemo(() => {
    if (!data?.outbound?.flights) return [];
    
    return data.outbound.flights.filter(flight => {
      // Airline filter
      if (filters?.selectedAirlines?.length > 0 && 
          !filters.selectedAirlines.includes(flight.airline)) {
        return false;
      }
      
      // Stops filter
      if (filters?.selectedStops?.length > 0) {
        const stopType = flight.stops === 0 ? 'non-stop' : 
                        flight.stops === 1 ? '1-stop' : '2+ stops';
        if (!filters.selectedStops.includes(stopType)) {
          return false;
        }
      }
      
      // Time filter
      if (filters?.selectedTimes?.length > 0) {
        const hour = parseInt(flight.departureTime.split(':')[0]);
        const isEarlyMorning = hour >= 0 && hour < 6;
        const isMorning = hour >= 6 && hour < 12;
        const isAfternoon = hour >= 12 && hour < 18;
        const isEvening = hour >= 18 && hour < 24;
        
        const timeMatch = 
          (filters.selectedTimes.includes('early-morning') && isEarlyMorning) ||
          (filters.selectedTimes.includes('morning') && isMorning) ||
          (filters.selectedTimes.includes('afternoon') && isAfternoon) ||
          (filters.selectedTimes.includes('evening') && isEvening);
          
        if (!timeMatch) return false;
      }
      
      // Price filter
      if (filters?.priceRange) {
        if (flight.price < filters.priceRange.min || 
            flight.price > filters.priceRange.max) {
          return false;
        }
      }
      
      return true;
    });
  }, [data?.outbound?.flights, filters]);

  // Apply filters to return flights
  const filteredReturn = useMemo(() => {
    if (!data?.return?.flights) return [];
    
    return data.return.flights.filter(flight => {
      // Airline filter
      if (filters?.selectedAirlines?.length > 0 && 
          !filters.selectedAirlines.includes(flight.airline)) {
        return false;
      }
      
      // Stops filter
      if (filters?.selectedStops?.length > 0) {
        const stopType = flight.stops === 0 ? 'non-stop' : 
                        flight.stops === 1 ? '1-stop' : '2+ stops';
        if (!filters.selectedStops.includes(stopType)) {
          return false;
        }
      }
      
      // Time filter
      if (filters?.selectedTimes?.length > 0) {
        const hour = parseInt(flight.departureTime.split(':')[0]);
        const isEarlyMorning = hour >= 0 && hour < 6;
        const isMorning = hour >= 6 && hour < 12;
        const isAfternoon = hour >= 12 && hour < 18;
        const isEvening = hour >= 18 && hour < 24;
        
        const timeMatch = 
          (filters.selectedTimes.includes('early-morning') && isEarlyMorning) ||
          (filters.selectedTimes.includes('morning') && isMorning) ||
          (filters.selectedTimes.includes('afternoon') && isAfternoon) ||
          (filters.selectedTimes.includes('evening') && isEvening);
          
        if (!timeMatch) return false;
      }
      
      // Price filter
      if (filters?.priceRange) {
        if (flight.price < filters.priceRange.min || 
            flight.price > filters.priceRange.max) {
          return false;
        }
      }
      
      return true;
    });
  }, [data?.return?.flights, filters]);

  // Handle continue with selected flights
  const handleContinue = () => {
    if (selectedOutbound && selectedReturn) {
      onContinue({
        outbound: selectedOutbound,
        return: selectedReturn,
        total: (selectedOutbound.price || 0) + (selectedReturn.price || 0)
      });
    }
  };

  // If no data, show loading
  if (!data || !data.outbound || !data.return) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading flights...</p>
        </div>
      </div>
    );
  }

  // Show message if no flights match filters
  if (filteredOutbound.length === 0 || filteredReturn.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-200">
        <div className="text-5xl mb-4">🔍</div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No flights match your filters</h3>
        <p className="text-gray-600 mb-4">Try adjusting your filter criteria</p>
      </div>
    );
  }

  return (
    <div className="pb-32">
      {/* Results count */}
      <div className="mb-4 text-sm text-gray-600">
        <span className="font-medium text-gray-900">{filteredOutbound.length}</span> outbound flights · 
        <span className="font-medium text-gray-900 ml-1">{filteredReturn.length}</span> return flights
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column - Outbound */}
        <OutboundFlightsColumn
          data={{ ...data.outbound, flights: filteredOutbound }}
          selectedFlight={selectedOutbound}
          onSelect={setSelectedOutbound}
        />

        {/* Right column - Return */}
        <ReturnFlightsColumn
          data={{ ...data.return, flights: filteredReturn }}
          selectedFlight={selectedReturn}
          onSelect={setSelectedReturn}
        />
      </div>

      {/* Bottom summary bar - only shows when both selected */}
      <SelectionSummaryBar
        outbound={selectedOutbound}
        return={selectedReturn}
        onContinue={handleContinue}
        passengerCount={passengerCount}
      />
    </div>
  );
};

export default RoundTripPage;