import { useContext } from 'react';
import { FlightStatusContext } from '../providers/FlightStatusProvider';

export const useFlightStatus = () => {
  const context = useContext(FlightStatusContext);
  
  if (!context) {
    throw new Error('useFlightStatus must be used within FlightStatusProvider');
  }
  
  return context;
};