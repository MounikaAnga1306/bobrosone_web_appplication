import { createContext, useState } from "react";

export const FlightStatusContext = createContext(null);

export const FlightStatusProvider = ({ children }) => {
  const [flightStatus, setFlightStatus] = useState(null);

  return (
    <FlightStatusContext.Provider
      value={{
        flightStatus,
        setFlightStatus,
      }}
    >
      {children}
    </FlightStatusContext.Provider>
  );
};