// src/modules/hotels/pages/HotelSearchResults.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useHotelSearch } from '../context/HotelSearchContext';
import { useHotelSearch as useHotelSearchHook } from '../hooks/useHotelSearch';
import { mapHotelSearchResults } from '../utils/hotelMapper'; // IMPORT the mapper
import HotelSearchHeader from '../components/HotelSearchHeader';
import HotelSortBar from '../components/HotelSortBar';
import HotelFilters from '../components/HotelFilters';
import HotelCard from '../components/HotelCard';
import HotelPagination from '../components/HotelPagination';
import { FaSlidersH } from 'react-icons/fa';

const HotelSearchResults = () => {
  const location = useLocation();
  const { searchParams, hotels, loading, error, updateSearchParams, setHotels } = useHotelSearch(); // Add setHotels
  const { executeSearch } = useHotelSearchHook();
  
  // Use ref to track if initial search has been triggered
  const initialSearchTriggered = useRef(false);
  
  // Local state
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('recommended');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Only run the search once when component mounts or params change
  useEffect(() => {
    const params = location.state?.searchParams;
    
    if (params) {
      updateSearchParams(params);
      
      // Only execute search if we haven't already and if we don't have hotels
      if (!initialSearchTriggered.current && !hotels.length && !loading) {
        initialSearchTriggered.current = true;
        
        // Modify executeSearch to handle the response mapping
        const searchPromise = executeSearch(params);
        
        // If executeSearch returns the response, map it here
        if (searchPromise && typeof searchPromise.then === 'function') {
          searchPromise.then((response) => {
            if (response?.hotels) {
              const mappedHotels = mapHotelSearchResults(response.hotels);
              setHotels(mappedHotels);
            }
          }).catch(error => {
            console.error('Search failed:', error);
          });
        }
      }
    }
  }, [location.state, updateSearchParams, executeSearch, hotels.length, loading, setHotels]);

  // Sort hotels
  const sortedHotels = [...hotels].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return (a.price?.min || 0) - (b.price?.min || 0);
      case 'price-high':
        return (b.price?.min || 0) - (a.price?.min || 0);
      case 'rating':
        return (b.rating?.stars || 0) - (a.rating?.stars || 0);
      case 'distance':
        return (a.distance?.value || 0) - (b.distance?.value || 0);
      default:
        return 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedHotels.length / itemsPerPage);
  const paginatedHotels = sortedHotels.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Skeleton Loading UI - Fixed to prevent blinking */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
          </div>
          <div className="flex gap-6">
            <div className="hidden lg:block w-72 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="h-10 bg-gray-200 rounded mb-4 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded mb-4 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="bg-white rounded-lg shadow-sm p-4">
                    <div className="h-40 bg-gray-200 rounded mb-4 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8">
            <div className="text-6xl mb-4">😕</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h3>
            <p className="text-red-600 mb-6">{error}</p>
            <button 
              onClick={() => window.history.back()}
              className="px-6 py-2 bg-[#FD561E] text-white rounded-lg hover:bg-[#e54d1a] transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Spacer for navbar */}
      <div className="pt-24">
        {/* Sticky Search Header - only show if we have searchParams */}
        {searchParams && (
          <HotelSearchHeader 
            searchParams={searchParams} 
            totalHotels={hotels.length}
          />
        )}

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Mobile Filter Button */}
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setShowMobileFilters(true)}
              className="w-full flex items-center justify-center gap-2 bg-white py-3 rounded-lg shadow-md text-gray-700 font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <FaSlidersH />
              Show Filters
            </button>
          </div>

          <div className="flex gap-6">
            {/* Filters Sidebar - Desktop */}
            <div className="hidden lg:block w-72 flex-shrink-0">
              <HotelFilters />
            </div>

            {/* Filters Sidebar - Mobile Modal */}
            {showMobileFilters && (
              <div className="fixed inset-0 z-50 lg:hidden">
                <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
                <div className="absolute right-0 top-0 h-full w-80 bg-white overflow-y-auto">
                  <HotelFilters 
                    onClose={() => setShowMobileFilters(false)} 
                    isMobile={true} 
                  />
                </div>
              </div>
            )}

            {/* Results Section */}
            <div className="flex-1">
              {/* Sort Bar - only show if we have hotels */}
              {hotels.length > 0 && (
                <HotelSortBar
                  totalHotels={sortedHotels.length}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                />
              )}

              {/* Hotel Cards or No Results */}
              {paginatedHotels.length > 0 ? (
                <>
                  <div className={viewMode === 'grid' 
                    ? 'grid grid-cols-1 md:grid-cols-2 gap-4' 
                    : 'space-y-4'
                  }>
                    {paginatedHotels.map((hotel) => (
                      <HotelCard 
                        key={hotel.id} 
                        hotel={hotel} 
                        viewMode={viewMode}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <HotelPagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  )}
                </>
              ) : (
                // No Results State
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <div className="text-6xl mb-4">🏨</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">No Hotels Found</h3>
                  <p className="text-gray-600 mb-6">
                    We couldn't find any hotels matching your search criteria.
                  </p>
                  <button 
                    onClick={() => window.history.back()}
                    className="px-6 py-2 bg-[#FD561E] text-white rounded-lg hover:bg-[#e54d1a] transition-colors"
                  >
                    Modify Search
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelSearchResults;