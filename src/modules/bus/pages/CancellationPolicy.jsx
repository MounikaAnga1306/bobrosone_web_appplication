const CancellationPolicy = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 mt-20 text-gray-800">
      
      {/* Title */}
      <h1 className="text-3xl font-bold text-center text-orange-500 mb-6">
        Cancellation Policy
      </h1>

      {/* Intro */}
      <p className="mb-4 leading-6 text-justify">
        BOBROS Consultancy Services Private Limited (BOBROS), with trade names 
        Humming Wheels or BOBROS or BOBROS Consultancy Services believes in helping 
        its customers as far as possible, and has therefore a liberal cancellation policy.
        Under this policy:
      </p>

      {/* Points */}
      <ul className="list-disc pl-6 space-y-3 mb-8">
        <li>
          Cancellations are strictly subjected to cancellation policies of respective 
          service providers of your bookings and they will be considered only if the 
          request is made before 24 hours of your travel or boarding.
        </li>

        <li>
          There is no cancellation of bookings under the Same Day Travel Bookings category 
          or in Utility Payment Services where the payment is already made to the respective 
          service provider.
        </li>

        <li>
          No cancellations are entertained for those bookings that the BOBROS Consultancy 
          Services Pvt. Ltd., marketing team has obtained on special occasions like Pongal, 
          Diwali, Christmas, Ramadan, Valentine’s Day etc. These are limited occasion offers and therefore cancellations are not possible.
        </li>

        <li>
         In case of receipt of falls bookings and errors in your booking details etc, please report the same to our Customer Service team at{" "}
          <a
            href="mailto:customersupport@bobrosone.com"
            className="text-blue-600 underline"
          >
            customersupport@bobrosone.com
          </a>{" "}
          within 24 hours of your booking or at least 24 hours before the journey / check In or Boarding time. The request will, however, be entertained only after verifying the details that you have given during your bookings.
        </li>

        <li>
         In case you feel that the Billing Details of your bookings are not in proper order as conveyed to you by our Sales Team, you must bring it to the notice of our customer service within 24 hours of receiving the billing details or 24 hours before the travel or departure time on the booking whichever is earlier. The Customer Service Team after looking into your complaint will take an appropriate action / decision.
        </li>
      </ul>

      {/* Refund Title */}
      <h1 className="text-3xl font-bold text-center text-orange-500 mb-6">
        Refund Policy
      </h1>

      {/* Refund Points */}
     <p className="mb-4 leading-6 text-justify">
       When you avail our (BOBROS Consultancy Services Pvt. Ltd.,) services for your Travel, Ticket Bookings, Hotel bookings, Holiday Planning and Utility Payment Services, your bookings and cancellations are subjected to the terms and conditions of the respective service providers. All the refunds are subjected to deduction of a cancellation fee of the service provider along with service fees of Rs. 25.00.
      </p>
      <p>
        Your refund process will start automatically once you cancel your bookings and the refunds are being processed within fifteen (15) days period. By any chance if you have not received any confirmation mail about your refund status within seven (7) days of your cancellation, please kindly contact us at
            <a
            href="mailto:customersupport@bobrosone.com"
            className="text-blue-600 underline"
          >
            customersupport@bobrosone.com
          </a>{" "}
          with your booking and cancellation details within thirty (30) days of your cancellation to process your refund at the earliest.
        </p>
    </div>
  );
};

export default CancellationPolicy;