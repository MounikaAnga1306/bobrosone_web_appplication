import { Helmet } from "react-helmet-async";
import Services from "../../bus/components/OurServices";
import WhyBobros from "../../bus/components/WhyBobros";
import AppDownload from "../../bus/components/AppDownload";
import PopularBusRoutes from "../../bus/components/PopularBusRoutes";
import Quick_Links from "../../bus/components/Quick_Links";
import BusFAQ from "../../bus/components/BusFAQ";
import BillBookingForm from "../../Bill Payments/components/Billbookingform";
import PopularBillers from "../components/PopularBillers";
import RechargeAndBillsIcons from "../components/Rechargeandbillsicons";
import BillPaymentFAQ from "../components/BillPaymentFAQ";

function BillHomeScreen() {
  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>BOBROS - Bill Payments</title>
        <meta name="description" content="Pay electricity, water, gas and other bills online easily with BOBROS." />
        <meta name="keywords" content="bill payment, online bill pay, electricity bill, BOBROS bills" />
      </Helmet>

      <main className="flex-grow">
        <BillBookingForm />
        <Services />
        <AppDownload />
        <RechargeAndBillsIcons />
        <WhyBobros />
        <PopularBillers />
        <BillPaymentFAQ />
        
      </main>
    </div>
  );
}

export default BillHomeScreen;