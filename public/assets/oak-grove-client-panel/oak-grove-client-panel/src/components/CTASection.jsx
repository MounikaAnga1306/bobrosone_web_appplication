import { Link } from "react-router-dom";
import { ArrowRight, Phone } from "lucide-react";

const CTASection = () => {
  return (
    <section className="gradient-navy section-padding relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-secondary/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="container mx-auto text-center relative z-10">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-primary-foreground mb-4">
          Give Your Child the <span className="text-accent">Best Start</span>
        </h2>
        <p className="text-primary-foreground/70 text-lg max-w-xl mx-auto mb-10">
          Join the Oak Grove family. Admissions are open for Playgroup to Grade 7.
          Schedule a campus visit today!
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/contact" className="btn-accent text-base">
            <ArrowRight className="w-5 h-5" /> Apply Now
          </Link>
          <a href="tel:9963883881" className="btn-outline-white text-base">
            <Phone className="w-5 h-5" /> Call 9963883881
          </a>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
