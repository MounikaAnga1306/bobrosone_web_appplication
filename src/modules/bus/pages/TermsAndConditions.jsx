import React from "react";

const SectionHeading = ({ children }) => (
  <h2 className="mt-6 mb-2 text-[20px] font-semibold text-gray-900">
    {children}
  </h2>
);

const SubSectionHeading = ({ children }) => (
  <h3 className="mt-4 mb-1 text-[16.5px] font-semibold text-[#fd561e]">
    {children}
  </h3>
);

const SectionText = ({ children }) => (
  <p className="text-[18px] leading-[1.6] text-gray-700 mb-2">
    {children}
  </p>
);

const BulletPoint = ({ children }) => (
  <div className="flex items-start mb-2 pl-3">
    <span className="mr-2">•</span>
    <p className="text-[18px] leading-[1.6] text-gray-700">{children}</p>
  </div>
);

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen p-4 max-w-5xl mx-auto mt-25">

      {/* MAIN HEADING */}
      <h1 className="text-3xl text-[#fd561e] font-semibold text-center mb-4">
        Terms & Conditions
      </h1>

      <SectionText>
        Welcome to <span className="text-blue-800 font-semibold">www.bobrosone.com</span> website. If you continue to browse and use this website you are agreeing to comply with and be bound by the following terms and conditions of use, which together with our privacy policy and Cancellation Policy govern M/s BOBROS Consultancy Services Private Limited's relationship with you in relation to this website <span className="text-blue-800 font-semibold">www.bobrosone.com</span>
      </SectionText>

      <SectionText>
        The term ‘BOBROS’ or ‘BOBROS Consultancy Services Pvt. Ltd.,’ or ‘Humming wheels’ or 'us' or 'we' refers to the owner of the website whose registered office is at 1- 232, Mulakaluru, Narasaraopet, Andhra Pradesh, India - 522601.
      </SectionText>

      <SectionText>
        We are registered in India under the companies act, our company registration number is U60231AP2010PTC069485. The term 'you' refers to the user or viewer of our website.
      </SectionText>

      <SectionHeading>
        The use of this website is subject to the following terms of use:
      </SectionHeading>

      <BulletPoint>
        The content on the pages of this website is for your general information and use only. It is subject to change without notice.
      </BulletPoint>

      <BulletPoint>
        Neither we nor any third parties provide any warranty or guarantee as to the accuracy, timeliness, performance, completeness or suitability of the information and materials found or offered on this website for any particular purpose. You acknowledge that such information and materials may contain inaccuracies or errors and we expressly exclude liability for any such inaccuracies or errors to the fullest extent permitted by law
      </BulletPoint>

      <BulletPoint>
        Your use of any information or materials on this website is entirely at your own risk, for which we shall not be liable. It shall be your own responsibility to ensure that any products, services or information available through this website meet your specific requirements.
      </BulletPoint>

      <BulletPoint>
       This website contains material which is owned by or licensed to us. This material includes, but is not limited to, the design, layout, look, appearance and graphics. Reproduction is prohibited other than in accordance with the copyright notice, which forms part of these terms and conditions.
      </BulletPoint>

      <BulletPoint>
        All trademarks reproduced in this website which are not the property of, or licensed to, the operator is acknowledged on the website.
      </BulletPoint>
      

      <BulletPoint>
        Unauthorised use of this website may give rise to a claim for damages and/or be a criminal offence.
      </BulletPoint>
      <BulletPoint>
        From time to time this website may also include links to other websites. These links are provided for your convenience to provide further information. They do not signify that we endorse the website(s). We have no responsibility for the content of the linked website(s).
      </BulletPoint>
      <BulletPoint>
        You may not create a link to this website from another website or document without BOBROS Consultancy Services Private Limited's prior written consent.
      </BulletPoint>
      <BulletPoint>
       When you become a registered user on our website by signing up, we reserve the right to contact you on your registered mobile number, registered email address and the postal address provided to us with reference to your user account related purposes and the information provided to you in any of the one above mode to be treated as delivered to you.
      </BulletPoint>

      <BulletPoint>
       You are responsible for providing your correct contact details and safe keeping of your mobile device and access to your mail and post box, we may provide your BOBROS registered user account sensitive information on your registered mobile, registered email and the postal address provided to us in your user sign up form.
      </BulletPoint>

    
      <BulletPoint>
        From time to time, we may require making changes to our website in order to comply with applicable laws and regulations, in this case we may not be able to provide any prior notice to you.
      </BulletPoint>

      <BulletPoint>
       Our website www.bobrosone.com uses API’s from various external third parties to provide you the information and services for travel and ticket booking, while making any ticket bookings through our website you are required to ensure that you have received all the information i.e. required for you to take an informed decision on your booking which includes but not limited to the information on cancellation charges. The terms and conditions of any external service provider whose services are booked through our website apply to you in addition to these terms and conditions.
      </BulletPoint>

      <BulletPoint>
       In case of ticket cancellations from the time less than 48 hours from the Boarding time of your travel, you are required to make cancellations either online on our website or contact the service provider / Bus Operator directly.
      </BulletPoint>

      <SectionHeading>
        BOBROS FREQUENT TRAVELER REWARD PROGRAM:
      </SectionHeading>

      <BulletPoint>
        We may sometime offer Frequent Traveler Reward Points on your ticket or travel bookings with us, we call this the BOBROS Frequent Traveler Reward Program, we reserve all rights in running this program.
      </BulletPoint>

      <BulletPoint>
       We can make changes to the BOBROS Frequent Traveler Reward Program including but not limited to the offer period and the number of BOBROS Frequent Traveler Reward Points (henceforth referred as reward points) that we offer any time without any prior notice
      </BulletPoint>

      <BulletPoint>
        Only registered users on our website are eligible to participate in this frequent travel reward program.
      </BulletPoint>

      <BulletPoint>
       If we are running the BOBROS Frequent Traveler Reward Program, you can see the eligible reward points on your ticket booking before you make the booking, up on successful completion of your ticket booking the eligible reward points will be credited to your frequent traveler user account with us
      </BulletPoint>

      <BulletPoint>
        In case of cancellations, the reward points received if any on the booking will be debited from your reward points balance or from your refund amount on the booking at a rate of one reward point equals to one rupee of your ticket booking amount.
      </BulletPoint>

      <BulletPoint>
        Each BOBROS frequent travel reward point can be used to get one rupee discount on your future bookings, you can use your reward points to make a full or partial payment on your ticket bookings with BOBROS and you cannot redeem these points for any other purposes or claim refund.
      </BulletPoint>

      
      <BulletPoint>
        Sometimes BOBROS may credit your eligible cancellation refund into your Frequent Traveler Reward Balance, in these cases you can use the reward balance for your future bookings or receive refund.
      </BulletPoint>

      

      <SectionHeading>How you can contact us:</SectionHeading>

      <SubSectionHeading>By Post:</SubSectionHeading>
      <SectionText>
        BOBROS Consultancy Services Private Limited, 1-232, Mulakaluru, Narasaraopet, Andhra Pradesh, India – 522601.
      </SectionText>

      <SubSectionHeading>By Email:</SubSectionHeading>
      <SectionText><span className="text-blue-900 font-semibold">customersupport@bobrosone.com</span></SectionText>

      <SubSectionHeading>By Telephone:</SubSectionHeading>
      <SectionText><span className="text-black font-semibold">91-9133 133 456</span></SectionText>

      <SectionText>
        (Between 9:30AM to 7:30PM from Monday to Saturday except Holidays)
      </SectionText>

      <SectionText>
        Your use of this website and any dispute arising out of such use of the website is subject to the laws of India or other regulatory authorities of India Terms & Conditions BOBROS Consultancy Services Pvt. Ltd., and comes under the jurisdiction of Narasaraopet, Palanadu District in Andhra Pradesh, India - 522601.
      </SectionText>

      <SectionText>
        <span className="text-[#fd561e]">BOBROS Consultancy Services Private Limited (Erstwhile Humming Wheels Private Limited) is registered in India under the companies act, 1956 (CIN: U60231AP2010PTC069485) and having its Registered Office at 1-232, Mulakaluru, Narasaraopet, Andhra Pradesh – 522 601, India.</span>
      </SectionText>

    </div>
  );
};

export default TermsAndConditions;