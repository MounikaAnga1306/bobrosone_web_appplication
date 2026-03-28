// src/modules/flights/hooks/useMultiCitySelection.js

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  findMatchingCombination,
  calculateTotalPrice,
  isValidCombination
} from '../utils/multiCityHelpers';

export const useMultiCitySelection = (legs, combinations, initialSelected = null) => {
  // State for selected flights per leg
  const [selectedFlights, setSelectedFlights] = useState(() => {
    if (initialSelected) return initialSelected;
    return legs ? Array(legs.length).fill(null) : [];
  });

  // Update selected flights when legs change
  useEffect(() => {
    if (legs && legs.length > 0 && selectedFlights.length !== legs.length) {
      setSelectedFlights(Array(legs.length).fill(null));
    }
  }, [legs, selectedFlights.length]);

  // Find matching combination
  const matchingCombination = useMemo(() => {
    return findMatchingCombination(selectedFlights, combinations);
  }, [selectedFlights, combinations]);

  // Calculate total price
  const totalPrice = useMemo(() => {
    return calculateTotalPrice(selectedFlights, matchingCombination);
  }, [selectedFlights, matchingCombination]);

  // Check if all legs are selected
  const allLegsSelected = useMemo(() => {
    return selectedFlights.every(flight => flight !== null);
  }, [selectedFlights]);

  // Check if current selection is valid
  const selectionIsValid = useMemo(() => {
    return isValidCombination(selectedFlights, combinations);
  }, [selectedFlights, combinations]);

  // Select a flight for a specific leg
  const selectFlightForLeg = useCallback((legIndex, flight) => {
    setSelectedFlights(prev => {
      const newSelected = [...prev];
      newSelected[legIndex] = flight;
      return newSelected;
    });
  }, []);

  // Clear selection for a specific leg
  const clearLegSelection = useCallback((legIndex) => {
    setSelectedFlights(prev => {
      const newSelected = [...prev];
      newSelected[legIndex] = null;
      return newSelected;
    });
  }, []);

  // Clear all selections
  const clearAllSelections = useCallback(() => {
    setSelectedFlights(Array(legs?.length || 0).fill(null));
  }, [legs]);

  // Get selected flight for a leg
  const getSelectedFlightForLeg = useCallback((legIndex) => {
    return selectedFlights[legIndex] || null;
  }, [selectedFlights]);

  // Get selection progress (percentage)
  const selectionProgress = useMemo(() => {
    if (!legs || legs.length === 0) return 0;
    const selectedCount = selectedFlights.filter(f => f !== null).length;
    return (selectedCount / legs.length) * 100;
  }, [selectedFlights, legs]);

  // Get selected count
  const selectedCount = useMemo(() => {
    return selectedFlights.filter(f => f !== null).length;
  }, [selectedFlights]);

  // Get unselected leg indices
  const unselectedLegIndices = useMemo(() => {
    return selectedFlights
      .map((flight, index) => flight === null ? index : null)
      .filter(index => index !== null);
  }, [selectedFlights]);

  // Check if a specific leg is selected
  const isLegSelected = useCallback((legIndex) => {
    return selectedFlights[legIndex] !== null;
  }, [selectedFlights]);

  return {
    // State
    selectedFlights,
    matchingCombination,
    totalPrice,
    allLegsSelected,
    selectionIsValid,
    selectionProgress,
    selectedCount,
    unselectedLegIndices,
    
    // Actions
    selectFlightForLeg,
    clearLegSelection,
    clearAllSelections,
    getSelectedFlightForLeg,
    isLegSelected
  };
};

/**
 * Hook for managing multi-city filter state
 */
export const useMultiCityFilters = (legs) => {
  const [filters, setFilters] = useState({
    priceRange: { min: 0, max: 100000, selected: [0, 100000] },
    airlines: [],
    stops: [],
    departureBands: {
      earlyMorning: false,
      morning: false,
      afternoon: false,
      evening: false,
      night: false
    },
    targetLeg: null
  });

  // Update price range based on flights
  useEffect(() => {
    if (!legs || legs.length === 0) return;
    
    // Get all flights from all legs
    const allFlights = legs.flatMap(leg => leg.flights || []);
    const prices = allFlights
      .map(f => f.lowestPrice || f.price || 0)
      .filter(p => p > 0);
    
    if (prices.length > 0) {
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      setFilters(prev => ({
        ...prev,
        priceRange: {
          min,
          max,
          selected: [min, max]
        }
      }));
    }
  }, [legs]);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  }, []);

  // Update price range
  const updatePriceRange = useCallback((selected) => {
    setFilters(prev => ({
      ...prev,
      priceRange: {
        ...prev.priceRange,
        selected
      }
    }));
  }, []);

  // Toggle airline filter
  const toggleAirline = useCallback((airlineCode) => {
    setFilters(prev => {
      const airlines = [...(prev.airlines || [])];
      const index = airlines.indexOf(airlineCode);
      
      if (index === -1) {
        airlines.push(airlineCode);
      } else {
        airlines.splice(index, 1);
      }
      
      return { ...prev, airlines };
    });
  }, []);

  // Toggle stop filter
  const toggleStop = useCallback((stopValue) => {
    setFilters(prev => {
      const stops = [...(prev.stops || [])];
      const index = stops.indexOf(stopValue);
      
      if (index === -1) {
        stops.push(stopValue);
      } else {
        stops.splice(index, 1);
      }
      
      return { ...prev, stops };
    });
  }, []);

  // Toggle departure band
  const toggleDepartureBand = useCallback((band) => {
    setFilters(prev => ({
      ...prev,
      departureBands: {
        ...prev.departureBands,
        [band]: !prev.departureBands[band]
      }
    }));
  }, []);

  // Set target leg for filters
  const setTargetLeg = useCallback((legIndex) => {
    setFilters(prev => ({
      ...prev,
      targetLeg: legIndex
    }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      airlines: [],
      stops: [],
      departureBands: {
        earlyMorning: false,
        morning: false,
        afternoon: false,
        evening: false,
        night: false
      },
      priceRange: {
        ...prev.priceRange,
        selected: [prev.priceRange.min, prev.priceRange.max]
      }
    }));
  }, []);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.airlines.length > 0 ||
      filters.stops.length > 0 ||
      Object.values(filters.departureBands).some(v => v) ||
      filters.priceRange.selected[0] > filters.priceRange.min ||
      filters.priceRange.selected[1] < filters.priceRange.max
    );
  }, [filters]);

  return {
    filters,
    updateFilters,
    updatePriceRange,
    toggleAirline,
    toggleStop,
    toggleDepartureBand,
    setTargetLeg,
    clearFilters,
    hasActiveFilters
  };
};

/**
 * Hook for managing multi-city sort state
 */
export const useMultiCitySort = (initialSort = 'price') => {
  const [sortBy, setSortBy] = useState(initialSort);
  
  const updateSort = useCallback((newSort) => {
    setSortBy(newSort);
  }, []);
  
  return {
    sortBy,
    updateSort
  };
};

/**
 * Hook for managing visible items (for virtual scrolling)
 */
export const useVisibleItems = (initialCount = 20) => {
  const [visibleCount, setVisibleCount] = useState(initialCount);
  
  const loadMore = useCallback(() => {
    setVisibleCount(prev => prev + 20);
  }, []);
  
  const resetVisible = useCallback(() => {
    setVisibleCount(initialCount);
  }, [initialCount]);
  
  return {
    visibleCount,
    loadMore,
    resetVisible
  };
};

/**
 * Hook for managing mobile leg navigation
 */
export const useMobileLegNavigation = (legCount) => {
  const [activeLeg, setActiveLeg] = useState(0);
  
  const goToNextLeg = useCallback(() => {
    setActiveLeg(prev => Math.min(prev + 1, legCount - 1));
  }, [legCount]);
  
  const goToPrevLeg = useCallback(() => {
    setActiveLeg(prev => Math.max(prev - 1, 0));
  }, []);
  
  const goToLeg = useCallback((legIndex) => {
    if (legIndex >= 0 && legIndex < legCount) {
      setActiveLeg(legIndex);
    }
  }, [legCount]);
  
  return {
    activeLeg,
    setActiveLeg,
    goToNextLeg,
    goToPrevLeg,
    goToLeg
  };
};

export default {
  useMultiCitySelection,
  useMultiCityFilters,
  useMultiCitySort,
  useVisibleItems,
  useMobileLegNavigation
};