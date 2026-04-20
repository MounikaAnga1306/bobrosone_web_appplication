import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import AnnouncementBar from "@/components/AnnouncementBar";
import Highlights from "@/components/Highlights";
import Gallery from "@/components/Gallery";
import Testimonials from "@/components/Testimonials";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { MessageSquare, Users, Lightbulb, BookOpen } from "lucide-react";

const focusAreas = [
  { icon: MessageSquare, title: "Communication Development", desc: "Building strong verbal and written communication skills." },
  { icon: Users, title: "Personality Development", desc: "Nurturing confidence, leadership, and social skills." },
  { icon: Lightbulb, title: "Experiential Learning", desc: "Learning by doing — real-world connections in every lesson." },
  { icon: BookOpen, title: "Personal Interaction", desc: "One-to-one mentoring that values each child's uniqueness." },
];

const Home = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <AnnouncementBar />
      <Highlights />

      {/* About Preview */}
      <section className="section-padding gradient-sky">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="section-title">Welcome to Oak Grove School</h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Located in the heart of KPHB, Hyderabad, Oak Grove School is a student-centered
              institution dedicated to modern teaching methodologies. We believe every child is
              unique and deserves an education that nurtures their individual strengths, building
              a strong foundation for lifelong learning.
            </p>
            <Link to="/about" className="btn-primary">
              Learn More About Us
            </Link>
          </div>
        </div>
      </section>

      {/* Focus Areas */}
      <section className="section-padding">
        <div className="container mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-title">Our Focus Areas</h2>
            <p className="section-subtitle">Building well-rounded individuals through holistic development.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {focusAreas.map((item, i) => (
              <div key={i} className="text-center p-8 rounded-2xl bg-card border border-border card-hover group">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-5
                                group-hover:bg-accent transition-colors duration-300">
                  <item.icon className="w-8 h-8 text-accent group-hover:text-accent-foreground transition-colors duration-300" />
                </div>
                <h3 className="font-heading font-bold text-primary mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Gallery />
      <Testimonials />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Home;
