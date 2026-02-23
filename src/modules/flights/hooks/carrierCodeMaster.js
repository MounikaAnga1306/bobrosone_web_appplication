import { useContext } from "react";
import { FlightMasterContext } from "../providers/CarrierCodeProvider";

export const useFlightMaster = () => {
  const context = useContext(FlightMasterContext);

  if (!context) {
    throw new Error("useFlightMaster must be used inside FlightMasterProvider");
  }

  return context;
};
