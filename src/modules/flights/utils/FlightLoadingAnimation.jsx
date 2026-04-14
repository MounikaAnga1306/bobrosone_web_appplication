// src/modules/flights/components/FlightLoadingAnimation.jsx
 
import React, { useState, useEffect, useRef } from 'react';
 
const FlightLoadingAnimation = ({ searchSummary, isLoading, onComplete }) => {
  const [dots, setDots] = useState('');
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [imageLeft, setImageLeft] = useState(-100);
  const [searchBarTop, setSearchBarTop] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
 
  const animationRef = useRef(null);
  const searchBarRef = useRef(null);
 
  const loadingMessages = [
    "Searching for the best routes",
    "Checking seat availability",
    "Finding the lowest fares",
    "Comparing airline prices",
    "Almost there, preparing your results"
  ];
 
  // Animated dots effect
  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 400);
    return () => clearInterval(dotInterval);
  }, []);
 
  // Rotate through loading messages
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex(prev => (prev + 1) % loadingMessages.length);
    }, 2000);
    return () => clearInterval(messageInterval);
  }, []);
 
  // Update progress bar
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return 95;
        return prev + Math.random() * 3;
      });
    }, 200);
    return () => clearInterval(progressInterval);
  }, []);
 
  // Get search bar position
  useEffect(() => {
    const updateSearchBarPosition = () => {
      const searchBar = document.querySelector('.flight-search-bar');
      if (searchBar) {
        const rect = searchBar.getBoundingClientRect();
        setSearchBarTop(rect.bottom - 30);
      } else {
        setSearchBarTop(120);
      }
    };
   
    updateSearchBarPosition();
    window.addEventListener('resize', updateSearchBarPosition);
    window.addEventListener('scroll', updateSearchBarPosition);
   
    return () => {
      window.removeEventListener('resize', updateSearchBarPosition);
      window.removeEventListener('scroll', updateSearchBarPosition);
    };
  }, []);
 
  // Smooth continuous animation
  useEffect(() => {
    if (!isAnimating) return;
   
    const screenWidth = window.innerWidth;
    const imageWidth = 96;
    const startLeft = -imageWidth;
    const endLeft = screenWidth;
    const totalDistance = endLeft - startLeft;
    const speed = totalDistance / 3000; // pixels per millisecond
   
    let animationStartTime = performance.now();
    let currentLeft = startLeft;
    let isLooping = true;
   
    const animate = (timestamp) => {
      if (!isLooping) return;
     
      const elapsed = timestamp - animationStartTime;
      let newLeft = startLeft + (speed * elapsed);
     
      if (newLeft < endLeft) {
        currentLeft = newLeft;
        setImageLeft(newLeft);
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Loop back to start
        animationStartTime = timestamp;
        currentLeft = startLeft;
        setImageLeft(startLeft);
        animationRef.current = requestAnimationFrame(animate);
      }
    };
   
    animationRef.current = requestAnimationFrame(animate);
   
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      isLooping = false;
    };
  }, [isAnimating]);
 
  // Handle API response - smooth finish
  useEffect(() => {
    if (!isLoading && isAnimating) {
      const screenWidth = window.innerWidth;
      const endLeft = screenWidth;
      const startLeftPos = imageLeft;
      const remainingDistance = endLeft - startLeftPos;
      const duration = Math.min(500, Math.max(200, remainingDistance / 5));
      const startTime = performance.now();
     
      const finishAnimation = (timestamp) => {
        const elapsed = timestamp - startTime;
        const progressPercent = Math.min(1, elapsed / duration);
        const eased = 1 - Math.pow(1 - progressPercent, 3);
        const newLeft = startLeftPos + (remainingDistance * eased);
        setImageLeft(newLeft);
       
        if (progressPercent < 1) {
          requestAnimationFrame(finishAnimation);
        } else {
          setIsAnimating(false);
          setProgress(100);
          if (onComplete) setTimeout(onComplete, 300);
        }
      };
     
      requestAnimationFrame(finishAnimation);
    }
  }, [isLoading, isAnimating, imageLeft, onComplete]);
 
  return (
    <div className="relative min-h-[calc(100vh-200px)] bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      {/* Search Bar Reference Point */}
      <div ref={searchBarRef} className="absolute top-0 left-0 w-full h-0 pointer-events-none" />
     
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-[#f36b32]/5 to-[#fd8a5c]/5 animate-float"
            style={{
              width: `${Math.random() * 150 + 50}px`,
              height: `${Math.random() * 150 + 50}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 10}s`,
            }}
          />
        ))}
      </div>
     
      {/* Moving Flight Image */}
      {searchBarTop > 0 && (
        <div
          className="fixed z-50 will-change-transform"
          style={{
            left: `${imageLeft}px`,
            top: `${searchBarTop}px`,
            transition: 'left 0.016s linear',
          }}
        >
          <div className="relative group">
            {/* Main Flight Image */}
            <img
              src="/assets/flight_moving_image1.png"
              alt="Flight searching"
              className="w-16 h-16 md:w-20 md:h-20 object-contain"
              style={{
                filter: 'drop-shadow(0 10px 20px rgba(0, 0, 0, 0.15))',
                transform: 'rotate(-5deg)',
              }}
            />
           
            {/* Animated Trail Effect */}
            <div className="absolute -left-10 top-1/2 -translate-y-1/2 flex gap-1">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-full bg-gradient-to-r from-[#f36b32] to-transparent"
                  style={{
                    width: `${12 - i * 2}px`,
                    height: `${3 - i * 0.5}px`,
                    opacity: 0.6 - i * 0.15,
                    animation: `trailPulse 0.6s ease-in-out infinite`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
           
            {/* Glow Effect */}
            <div className="absolute inset-0 rounded-full blur-xl bg-[#f36b32]/20 animate-pulse"></div>
          </div>
        </div>
      )}
     
      {/* Bottom Border Line */}
      <div className="absolute bottom-32 left-0 right-0">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent w-full"></div>
      </div>
     
      {/* Loading Content */}
      <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 text-center z-10 w-full max-w-md px-4">
        {/* Animated Loading Message */}
        <div className="mb-4">
          <h2 className="text-lg md:text-xl font-medium text-gray-700">
            {loadingMessages[currentMessageIndex]}
            <span className="inline-block w-8 text-left text-gray-400">{dots}</span>
          </h2>
        </div>
       
        {/* Route Information */}
        <div className="mb-6">
          <div className="flex items-center justify-center gap-3 text-sm text-gray-500">
            <div className="flex flex-col items-end">
              <span className="font-semibold text-gray-700">{searchSummary?.fromCode || 'JFK'}</span>
              <span className="text-xs text-gray-400">{searchSummary?.fromName || 'New York'}</span>
            </div>
            <svg className="w-5 h-5 text-[#f36b32] animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
            <div className="flex flex-col items-start">
              <span className="font-semibold text-gray-700">{searchSummary?.toCode || 'LAX'}</span>
              <span className="text-xs text-gray-400">{searchSummary?.toName || 'Los Angeles'}</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {searchSummary?.formattedDate || 'Monday, 15 Jan 2024'}
          </p>
        </div>
       
        {/* Progress Bar */}
        <div className="mt-6">
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#f36b32] to-[#fd8a5c] rounded-full transition-all duration-300 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/30 animate-shimmer"></div>
            </div>
          </div>
         
          {/* Progress Stats */}
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#f36b32] animate-pulse"></div>
              <span>Searching flights</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
              <span>Best deals</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
              <span>Secure booking</span>
            </div>
          </div>
        </div>
       
        {/* Trust Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-full">
            <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Best Price Guarantee
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-full">
            <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Secure Payments
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-full">
            <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            24/7 Support
          </div>
        </div>
      </div>
     
      <style>{`
        @keyframes trailPulse {
          0%, 100% {
            opacity: 0.6;
            transform: translateX(0);
          }
          50% {
            opacity: 0.2;
            transform: translateX(-5px);
          }
        }
       
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }
       
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
       
        .animate-float {
          animation: float linear infinite;
        }
       
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
       
        .will-change-transform {
          will-change: left;
        }
      `}</style>
    </div>
  );
};
 
export default FlightLoadingAnimation;