// src/components/BankOffers.jsx
import React from 'react';

const BankOffers = () => {
  const priceCalendar = [
    { day: 'Thu', date: '05 Feb', price: '₹4,410' },
    { day: 'Fri', date: '06 Feb', price: '₹4,200', current: true },
    { day: 'Sat', date: '07 Feb', price: '₹3,908' },
    { day: 'Sun', date: '08 Feb', price: '₹4,200' },
    { day: 'Mon', date: '09 Feb', price: '₹4,149' },
    { day: 'Tue', date: '10 Feb', price: '₹4,149' },
    { day: 'Wed', date: '11 Feb', price: '₹4,149' },
    { day: 'Thu', date: '12 Feb', price: '₹4,149' }
  ];

  const bankOffers = [
    { id: 1, title: 'Up to 12% Off', bank: 'with RBL Bank Credit Card EMI' },
    { id: 2, title: 'Get Flat 10% Off', bank: 'with AU Bank Credit Card' },
    { id: 3, title: 'Flat 8% Off', bank: 'with Yes Bank Credit Cards' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      {/* Price Calendar */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Flexible Dates - Lowest Prices</h3>
        <div className="grid grid-cols-8 gap-3">
          {priceCalendar.map((day, index) => (
            <div 
              key={index} 
              className={`text-center p-3 border rounded-lg cursor-pointer transition-colors duration-200 ${
                day.current 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'
              }`}
            >
              <div className="text-sm font-medium text-gray-600">{day.day}</div>
              <div className="text-xs text-gray-500 mt-1">{day.date}</div>
              <div className={`text-sm font-semibold mt-2 ${
                day.current ? 'text-blue-600' : 'text-gray-900'
              }`}>
                {day.price}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bank Offers */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Bank Offers</h3>
        <div className="space-y-3">
          {bankOffers.map((offer) => (
            <div 
              key={offer.id} 
              className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex justify-between items-center">
                <div className="font-semibold text-blue-800">{offer.title}</div>
                <div className="text-sm font-medium text-gray-700">{offer.bank}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BankOffers;