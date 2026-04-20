import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Phone } from "lucide-react";
import heroBg from "@/assets/school.jpeg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="Oak Grove School Campus" className="w-full h-full object-cover" width={1920} height={1080} />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/40" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="max-w-2xl">
          <div className="inline-block bg-accent/90 text-accent-foreground px-4 py-1.5 rounded-full text-sm font-bold mb-6 animate-fade-in">
            🎓 Admissions Open — Playgroup to Grade 7
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-heading font-bold text-primary-foreground leading-tight mb-6 animate-slide-up">
            Nurturing Young Minds for a{" "}
            <span className="text-accent">Bright Future</span>
          </h1>

          <p className="text-primary-foreground/80 text-lg md:text-xl mb-10 leading-relaxed max-w-xl animate-slide-up">
            Oak Grove School is an CBSE curriculum school focused on communication, confidence, and overall child development.

          </p>

          <div className="flex flex-wrap gap-4" style={{ animationDelay: "0.4s" }}>
            <Link to="/contact" className="btn-accent text-base">
              <ArrowRight className="w-5 h-5" /> Admissions Open
            </Link>
            <Link to="/contact" className="btn-outline-white text-base">
              <Calendar className="w-5 h-5" /> Book a Campus Visit
            </Link>
           
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 50C360 100 720 0 1440 50V100H0V50Z" fill="hsl(210 20% 98%)" />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
