import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Instagram, Youtube, MessageCircle } from "lucide-react";
import logo from "@/assets/logo1.png";

const Footer = () => {
  // Function to scroll to top when a link is clicked
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Handle link clicks for internal routes
  const handleLinkClick = () => {
    scrollToTop();
  };

  // Open Gmail compose in same browser
 const handleEmailClick = () => {
  const subject = encodeURIComponent("Enquiry - Oak Grove School");
  const body = encodeURIComponent("Hello Oak Grove School,\n\nI would like to enquire about admissions.\n\nThank you.");
  window.open(
    `https://mail.google.com/mail/?view=cm&fs=1&to=oakgroveschool.edu@gmail.com&su=${subject}&body=${body}`,
    '_blank'
  );
};

  return (
    <footer className="gradient-navy text-primary-foreground">
      <div className="container mx-auto section-padding pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={logo} alt="Oak Grove School" className="h-16 w-auto p-1" />
              <div>
                <h3 className="font-heading font-bold text-[18px] text-primary-foreground">Oak Grove International School</h3>
                <p className="text-secondary text-xs tracking-widest uppercase">Nurturing Young Minds</p>
              </div>
            </div>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              A student-centered school in KPHB, Hyderabad, providing quality education
              from Playgroup to Grade 7 with modern teaching methods.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-bold text-lg mb-4 text-accent">Quick Links</h4>
            <div className="flex flex-col gap-2">
              {[
                { to: "/", label: "Home" },
                { to: "/about", label: "About Us" },
                { to: "/academics", label: "Academics" },
                { to: "/activities", label: "Activities & Events" },
                { to: "/contact", label: "Contact & Admissions" },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={handleLinkClick}
                  className="text-primary-foreground/70 hover:text-accent transition-colors text-sm"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-bold text-lg mb-4 text-accent">Contact Us</h4>
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex items-start gap-2 hover:text-accent text-primary-foreground/70">
                <MapPin className="w-4 h-4 mt-1 text-secondary hover:text-accent  shrink-0" />
                <span>Plot No 1006, Netaji Rd, KPHB Phase 9, Hyderabad, Telangana 500085</span>
              </div>
              <a href="tel:9963883881" className="flex items-center gap-2 text-primary-foreground/70 hover:text-accent transition-colors">
                <Phone className="w-4 h-4 text-secondary" />
                9963883881
              </a>
              <div 
                onClick={handleEmailClick}
                className="flex items-center gap-2 text-primary-foreground/70 hover:text-accent transition-colors cursor-pointer group"
              >
                <Mail className="w-4 h-4 text-secondary group-hover:text-accent" />
                <span className="group-hover:text-accent">oakgroveschool.edu@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-heading font-bold text-lg mb-4 text-accent">Follow Us</h4>
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/oak_grove_international_school?igsh=a2VqOGFuYjN1YjB1"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center 
                           text-primary-foreground/70 hover:bg-accent hover:text-accent-foreground transition-all duration-300"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://youtube.com/@oakgroveschool826?si=M3AgBmjr3aEvJKCS"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center 
                           text-primary-foreground/70 hover:bg-accent hover:text-accent-foreground transition-all duration-300"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a
                href="https://whatsapp.com/channel/0029Vb5e3B9HrDZpcaNScg1E"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center 
                           text-primary-foreground/70 hover:bg-accent hover:text-accent-foreground transition-all duration-300"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <div
                onClick={handleEmailClick}
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center 
                           text-primary-foreground/70 hover:bg-accent hover:text-accent-foreground transition-all duration-300 cursor-pointer"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-6 p-4 rounded-lg bg-primary-foreground/5 border border-primary-foreground/10">
              <p className="text-accent font-semibold text-sm">🎓 Admissions Open!</p>
              <p className="text-primary-foreground/60 text-xs mt-1">Playgroup to Grade 7</p>
            </div>
          </div>
        </div>

<div className="border-t border-primary-foreground/10 mt-10 pt-6 text-center text-primary-foreground/50 text-xs">
  © {new Date().getFullYear()} Oak Grove School. All rights reserved. Powered by <a href="https://bobrosone.com" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/50 hover:text-accent  hover:underline transition-colors duration-200">BOBROS</a>
</div>
      </div>
    </footer>
  );
};

export default Footer;