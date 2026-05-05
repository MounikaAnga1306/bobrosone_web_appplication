import { useState } from "react";
import Button from "../components/ui/Button";
import { X, AlertCircle, Info, Users } from "lucide-react";

const BusResultCard = ({
  id,
  operator,
  type,
  departure,
  departureCity,
  arrival,
  arrivalCity,
  duration,
  price,
  seatsLeft,
  onSelectSeat,
  cancellationPolicyParsed
}) => {
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [policyData, setPolicyData] = useState(cancellationPolicyParsed || null);
  const [loadingPolicy, setLoadingPolicy] = useState(false);
  const [error, setError] = useState("");

  const fetchCancellationPolicy = async () => {
    if (policyData) {
      setShowPolicyModal(true);
      return;
    }

    setLoadingPolicy(true);
    setError("");
    
    try {
      const apiUrl = `/cancellation-policy/${id}`;
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setPolicyData(data.policy);
        setShowPolicyModal(true);
      } else {
        setError(data.message || "Failed to fetch policy");
      }
    } catch (error) {
      console.error("Error fetching cancellation policy:", error);
      setError("Unable to load cancellation policy");
    } finally {
      setLoadingPolicy(false);
    }
  };

  const getSeatAvailabilityText = () => {
    if (seatsLeft === 0) return { text: "Sold Out", color: "text-red-600", icon: "🔴" };
    if (seatsLeft <= 5) return { text: `${seatsLeft} seats left`, color: "text-red-500", icon: "⚠️" };
    if (seatsLeft <= 10) return { text: `${seatsLeft} seats left`, color: "text-orange-500", icon: "🟠" };
    return { text: `${seatsLeft} seats available`, color: "text-green-600", icon: "✅" };
  };

  const seatInfo = getSeatAvailabilityText();

  const CancellationPolicyModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowPolicyModal(false)}>
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-[#fd561e]" />
            <h2 className="text-xl font-bold text-gray-900">Cancellation Policy</h2>
          </div>
          <button
            onClick={() => setShowPolicyModal(false)}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Operator</p>
            <p className="font-semibold text-gray-900">{operator}</p>
            <p className="text-xs text-gray-500 mt-1">{type}</p>
            <div className="flex justify-between mt-2">
              <div>
                <p className="text-xs text-gray-500">Departure</p>
                <p className="text-sm font-medium">{departure} • {departureCity}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Arrival</p>
                <p className="text-sm font-medium">{arrival} • {arrivalCity}</p>
              </div>
            </div>
          </div>

          {policyData?.summary && (
            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-[#fd561e] mt-0.5" />
                <div>
                  <p className="font-semibold text-orange-800">Policy Summary</p>
                  <p className="text-sm text-orange-700 mt-1">{policyData.summary}</p>
                </div>
              </div>
            </div>
          )}

          {policyData?.rules && policyData.rules.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-3 text-sm font-semibold text-gray-700 border-b">Cancellation Time</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-700 border-b">Charges</th>
                  </tr>
                </thead>
                <tbody>
                  {policyData.rules.map((rule, index) => (
                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="p-3 text-sm text-gray-600">{rule.timeRange}</td>
                      <td className="p-3 text-sm">
                        <span className={`font-semibold ${rule.type === 0 ? 'text-[#fd561e]' : 'text-green-600'}`}>
                          {rule.charge}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>No cancellation policy available for this trip</p>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-semibold text-blue-800 mb-2">Important Notes:</p>
            <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
              <li>Cancellation charges are calculated based on departure time</li>
              <li>Refund will be processed within 5-7 business days</li>
              <li>Convenience fees are non-refundable</li>
              <li>For any queries, contact customer support</li>
            </ul>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
          <Button
            onClick={() => setShowPolicyModal(false)}
            className="w-full bg-[#fd561e] hover:bg-[#e04a16] text-white"
          >
            Got It
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
        {/* Laptop & Desktop View (lg and above) */}
        <div className="hidden lg:block">
          <div className="flex flex-row items-center gap-4">
            <div className="flex items-start gap-3 w-[220px] shrink-0">
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-gray-900 truncate">{operator}</h3>
                <p className="text-xs text-gray-500 truncate">{type}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <Users className="w-3.5 h-3.5 text-gray-500" />
                  <span className={`text-xs font-medium ${seatInfo.color}`}>{seatInfo.text}</span>
                </div>
              </div>
            </div>

            <div className="flex-1 flex items-center gap-4">
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">{departure}</p>
                <p className="text-[11px] text-gray-500">{departureCity}</p>
              </div>
              <div className="flex-1 flex flex-col items-center">
                <span className="text-[10px] text-gray-500 font-medium">{duration}</span>
                <div className="w-full h-px bg-gray-300 my-1 relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-[#fd561e] rounded-full" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">{arrival}</p>
                <p className="text-[11px] text-gray-500">{arrivalCity}</p>
              </div>
            </div>

            <div className="w-[100px] shrink-0 text-right -mb-6">
              <p className="text-xl font-extrabold -mt-5 text-gray-900">₹{price?.toLocaleString("en-IN")}</p>
              <div className="-mt-1 mr-0.5">
              <p className="text-[10px] text-gray-500 mt-0.5 italic  ">(Incl. GST)</p>
              <p className="text-[12px] text-gray-600 -mt-1.5">Onwards</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
            <button
              onClick={fetchCancellationPolicy}
              disabled={loadingPolicy}
              className="text-xs text-[#fd561e] cursor-pointer font-medium flex items-center gap-1.5 hover:underline transition-all"
            >
              <div className="w-3.5 h-3.5 rounded-full border border-[#fd561e] flex items-center justify-center">
                <span className="text-[8px] font-bold">!</span>
              </div>
              {loadingPolicy ? "Loading..." : "Cancellation Policy"}
            </button>
            <Button
              size="sm"
              className="font-bold cursor-pointer bg-[#fd561e] hover:bg-[#e04a16] text-white px-4 py-1.5 text-sm min-w-[100px]"
              onClick={() => onSelectSeat(id)}
              disabled={seatsLeft === 0}
            >
              {seatsLeft === 0 ? "Sold Out" : "Select Seat"}
            </Button>
          </div>
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>

        {/* iPad View (md to lg) */}
        <div className="hidden md:block lg:hidden">
          <div className="flex flex-row items-center gap-3">
            <div className="flex items-start gap-2 w-[180px] shrink-0">
              <div className="min-w-0">
                <h3 className="text-xs font-bold text-gray-900 truncate">{operator}</h3>
                <p className="text-[10px] text-gray-500 truncate">{type}</p>
                <div className="flex items-center gap-1 mt-1.5">
                  <Users className="w-3 h-3 text-gray-500" />
                  <span className={`text-[10px] font-medium ${seatInfo.color}`}>{seatInfo.text}</span>
                </div>
              </div>
            </div>

            <div className="flex-1 flex items-center gap-2">
              <div className="text-center min-w-[50px]">
                <p className="text-sm font-bold text-gray-900">{departure}</p>
                <p className="text-[9px] text-gray-500 truncate max-w-[70px]">{departureCity}</p>
              </div>
              <div className="flex-1 flex flex-col items-center px-1">
                <span className="text-[9px] text-gray-500 font-medium whitespace-nowrap">{duration}</span>
                <div className="w-full h-px bg-gray-300 my-1 relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#fd561e] rounded-full" />
                </div>
              </div>
              <div className="text-center min-w-[50px]">
                <p className="text-sm font-bold text-gray-900">{arrival}</p>
                <p className="text-[9px] text-gray-500 truncate max-w-[70px]">{arrivalCity}</p>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
            <button
              onClick={fetchCancellationPolicy}
              disabled={loadingPolicy}
              className="text-[10px] text-[#fd561e] cursor-pointer font-medium flex items-center gap-1 hover:underline transition-all"
            >
              <div className="w-3 h-3 rounded-full border border-[#fd561e] flex items-center justify-center">
                <span className="text-[7px] font-bold">!</span>
              </div>
              {loadingPolicy ? "Loading..." : "Cancellation Policy"}
            </button>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-base font-extrabold mr-1 text-gray-900">₹{price?.toLocaleString("en-IN")}</p>
                <div className="-mt-1">
                <p className="text-[10px] text-gray-500 mt-0.5 italic">(Incl. GST)</p>
              <p className="text-[12px] text-gray-600 -mt-1.5">Onwards</p>
              </div>
              </div>
              <Button
                size="sm"
                className="font-bold cursor-pointer bg-[#fd561e] hover:bg-[#e04a16] text-white px-3 py-1 text-xs min-w-[90px]"
                onClick={() => onSelectSeat(id)}
                disabled={seatsLeft === 0}
              >
                {seatsLeft === 0 ? "Sold Out" : "Select Seat"}
              </Button>
            </div>
          </div>
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>

        {/* Mobile View (below md) */}
        <div className="md:hidden">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h3 className="text-sm font-bold text-gray-900 truncate">{operator}</h3>
              <p className="text-xs text-gray-500 truncate">{type}</p>
              <div className="flex items-center gap-1.5 mt-2">
                <Users className="w-3.5 h-3.5 text-gray-500" />
                <span className={`text-xs font-medium ${seatInfo.color}`}>{seatInfo.text}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[15px] ml-1 font-extrabold text-gray-900">₹{price?.toLocaleString("en-IN")}</p>
              <div className="-mt-1 -mr-1">
              <p className="text-[10px] text-gray-500 mt-0.5 italic ">(Incl. GST)</p>
              <p className="text-[12px] text-gray-600 -mt-1.5">Onwards</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 my-3">
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">{departure}</p>
              <p className="text-[11px] text-gray-500">{departureCity}</p>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <span className="text-[10px] text-gray-500 font-medium">{duration}</span>
              <div className="w-full h-px bg-gray-300 my-1 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-[#fd561e] rounded-full" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">{arrival}</p>
              <p className="text-[11px] text-gray-500">{arrivalCity}</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={fetchCancellationPolicy}
                disabled={loadingPolicy}
                className="text-xs text-[#fd561e] cursor-pointer font-medium flex items-center gap-1.5 hover:underline transition-all whitespace-nowrap"
              >
                <div className="w-3.5 h-3.5 rounded-full border border-[#fd561e] flex items-center justify-center">
                  <span className="text-[8px] font-bold">!</span>
                </div>
                {loadingPolicy ? "Loading..." : "Cancellation Policy"}
              </button>
              <Button
                size="sm"
                className="font-bold cursor-pointer bg-[#fd561e] hover:bg-[#e04a16] text-white px-4 py-1.5 text-sm min-w-[100px]"
                onClick={() => onSelectSeat(id)}
                disabled={seatsLeft === 0}
              >
                {seatsLeft === 0 ? "Sold Out" : "Select Seat"}
              </Button>
            </div>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>
        </div>
      </div>

      {showPolicyModal && <CancellationPolicyModal />}
    </>
  );
};

export default BusResultCard;