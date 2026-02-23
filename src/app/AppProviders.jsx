import { FlightMasterProvider } from "../modules/flights/providers/CarrierCodeProvider";

export default function AppProviders({ children }) {
  return (
    <CarrierCodeProvider>
      {children}
    </CarrierCodeProvider>
  );
}
