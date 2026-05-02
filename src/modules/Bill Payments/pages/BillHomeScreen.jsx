import Services from "../../bus/components/OurServices";
import WhyBobros from "../../bus/components/WhyBobros";
import AppDownload from "../../bus/components/AppDownload";
import PopularBusRoutes from "../../bus/components/PopularBusRoutes";
import Quick_Links from "../../bus/components/Quick_Links";
import BusFAQ from "../../bus/components/BusFAQ";
import BillBookingForm from "../../Bill Payments/components/Billbookingform"; 
import PopularBillers from "../components/PopularBillers";    
import RechargeAndBillsIcons from "../components/Rechargeandbillsicons"; 

function BillHomeScreen() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        {/* Bill Payments Hero Section - NO CONTAINER, FULL WIDTH */}
        <BillBookingForm />
     

        <Services />
        <AppDownload />
        <RechargeAndBillsIcons />
        <WhyBobros />
         <PopularBillers />
  
      </main>
    </div>
  );
}

export default BillHomeScreen;