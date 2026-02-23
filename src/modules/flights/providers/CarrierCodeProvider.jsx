import { createContext, useEffect, useState } from "react";
import { fetchAirlines } from "../services/carriercode.services";
import { mapAirline } from "../models/carriercode.model";

export const FlightMasterContext = createContext(null);

export const FlightMasterProvider = ({ children }) => {
  const [airlines, setAirlines] = useState([]);
  const [loadingAirlines, setLoadingAirlines] = useState(false);
  const [airlinesError, setAirlinesError] = useState("");

  const loadAirlines = async () => {
    try {
      setLoadingAirlines(true);
      setAirlinesError("");

      const res = await fetchAirlines();

      const mappedAirlines = res.data.rows.map(mapAirline);

      setAirlines(mappedAirlines);
    } catch (error) {
      setAirlinesError("Failed to load airlines");
    } finally {
      setLoadingAirlines(false);
    }
  };

  useEffect(() => {
    loadAirlines();
  }, []);

  return (
    <FlightMasterContext.Provider
      value={{
        airlines,
        loadingAirlines,
        airlinesError,
        reloadAirlines: loadAirlines,
      }}
    >
      {children}
    </FlightMasterContext.Provider>
  );
};
