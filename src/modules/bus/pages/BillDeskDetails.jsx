import { useLocation } from "react-router-dom";

const BillDeskDetails = () => {

  const { state } = useLocation();
  const data = state?.billdeskData;

  if (!data) {
    return <p className="text-center mt-20">No BillDesk data available</p>;
  }

  const merchantId = "HYDBOBROS";

  const bdOrderId = data.bdorderid;
  const authToken = data.authToken;

  const checkoutUrl =
    `https://uat.bobros.co.in/billdesk_checkout.php?merchantId=${merchantId}&bdorderid=${bdOrderId}&authToken=${encodeURIComponent(authToken)}`;

  const launchBillDesk = () => {

    if (!authToken) {
      alert("Auth Token missing");
      return;
    }

    // Redirect to BillDesk checkout page
    window.location.href = checkoutUrl;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white w-[650px] rounded-xl shadow-md p-8">

        <h1 className="text-2xl font-bold text-center text-[#fd561e] mb-6">
          BillDesk Payment
        </h1>

        <p className="mb-2">
          <b>Status:</b> {data.status}
        </p>

        <p className="mb-2">
          <b>BillDesk Order ID:</b> {bdOrderId}
        </p>

        <p className="mb-4">
          <b>Ticket ID:</b> {data.ticketid}
        </p>

        <div className="flex justify-center mt-6">

          <button
            onClick={launchBillDesk}
            className="bg-[#fd561e] text-white px-6 py-3 rounded-full font-semibold hover:opacity-90"
          >
            Launch BillDesk Payment
          </button>

        </div>

      </div>

    </div>
  );
};

export default BillDeskDetails;