import React from "react";
import { User } from "lucide-react";

const values = [
  {
    title: "Integrity",
    desc: "We believe in being honest and having strong moral principles.",
    img: "/assets/int2.png",
  },
  {
    title: "Innovation",
    desc: "We are ethical in our words and all our actions.",
    img: "/assets/innovation.png",
  },
  {
    title: "Inclusiveness",
    desc:
      'We believe in "One Planet – One Family" and strive to create greater future for everyone.',
    img: "/assets/inclu.png",
  },
  {
    title: "Team Work",
    desc:
      "We believe that cohesive and collaborative efforts boost innovation and strengthen team bonding.",
    img: "/assets/team.jpg",
  },
];

const team = [
  {
    name: "Mr. OGURI NARASIMHA RAO",
    role: "Director",
    email: "ir@bobroscapital.com",
    img: "/images/profile.jpg",
  },
  {
    name: "Mr. OGURI VENU GOPAL",
    role: "Director",
    email: "venu.oguri@bobrosone.com",
    img: "/images/profile.jpg",
  },
  {
    name: "Mr. GHAN SAIDA",
    role: "Manager",
    email: "ghan.saida@bobrosone.com",
    img: "/images/profile.jpg",
  },
];

export default function AboutUs() {
  return (
    <div className="bg-gray-50  mt-20 min-h-screen">

      {/* 🔥 HERO SECTION WITH BUS IMAGE */}
      <div
        className="relative h-[400px] flex items-center justify-center text-white"
        style={{
          backgroundImage: "url('/assets/About_bus.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
    <div className="absolute inset-0 bg-black/50 "></div>

        <div className="relative text-center -mt-16">
          <h1 className="text-4xl font-bold">About Us</h1>
          <p className="mt-2 text-lg opacity-90">
            Powering Travel & Digital Innovation
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* DESCRIPTION */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12 -mt-30 relative z-10">
          <p className="text-gray-700 leading-7 text-justify">
            BOBROS Consultancy Services Private Limited [Erst while Humming Wheels Private Limited] is incorporated in India as a tech start up in the year 2010. The company is trading in the names of BOBROS, BOBROS ONE, BOBROS Consultancy. BOBROS has been working on IT Consulting, Travel and Innovative Digital payment solutions serving individuals and SME's. BOBROS has been instrumental in providing innovative and value added solutions for the travel needs of Individuals and Corporates through an integrated online portal. BOBROS currently offering online Bus Ticketing services through its website bobrosone.com and the mobile application - BOBROS. BOBROS has consistently added value for its customers through its innovative and cost saving methods.
            <br /><br />
            BOBROS is also involved in research and development activities in IT applications to deliver cost effective global payment and booking solutions. BOBROS has been working with an objective to deliver innovative solution to the planet earth supporting the motto of Vasudhaiva Kutumbakam - One Earth - One Family - One Future.
          </p>
        </div>

        {/* MISSION */}
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold">Our Mission</h2>
          <div className="w-16 h-1 bg-[#FD561E] mx-auto my-3 rounded"></div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            To support people and businesses achieve their goals by making finance and technology innovations accessible and affordable.
          </p>
        </div>

        {/* VALUES */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold">Our Values</h2>
          <div className="w-16 h-1 bg-[#FD561E] mx-auto my-3 rounded"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {values.map((val, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition duration-300 p-6 text-center hover:-translate-y-2"
            >
              <img
                src={val.img}
                alt={val.title}
                className="w-16 h-16 mx-auto mb-4"
              />
              <h3 className="font-semibold text-lg">{val.title}</h3>
              <p className="text-gray-500 text-sm mt-2">{val.desc}</p>
            </div>
          ))}
        </div>

      {/* TEAM */}
<div className="bg-[#F8F9FE] rounded-2xl p-10 shadow-md">
  <h2 className="text-3xl font-bold text-center mb-10">Our Team</h2>

  <div className="flex flex-wrap justify-center gap-10">
    {team.map((member, i) => (
      <div
        key={i}
        className="bg-white rounded-xl p-6 w-64 text-center shadow hover:shadow-xl transition hover:-translate-y-2"
      >
        {/* ICON AVATAR */}
        <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center  border-2">
          <User size={70} className="text-black" />
        </div>

        <h3 className="font-semibold">{member.name}</h3>
        <p className="text-[#FD561E] text-sm">{member.role}</p>
        <p className="text-gray-500 text-sm mt-2 break-words">
          {member.email}
        </p>
      </div>
    ))}
  </div>
</div>

      </div>
    </div>
  );
}