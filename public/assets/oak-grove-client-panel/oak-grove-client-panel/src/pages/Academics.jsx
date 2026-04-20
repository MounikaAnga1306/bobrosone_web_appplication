import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTASection from "@/components/CTASection";
import { BookOpen, GraduationCap, Lightbulb, MessageSquare, Users, Brain, Heart, Sparkles, Award } from "lucide-react";

const grades = [
  { name: "Playgroup",  color: "bg-accent/10 text-accent" },
  { name: "Nursery", color: "bg-secondary/10 text-secondary" },
  { name: "Kindergarten 1",  color: "bg-accent/10 text-accent" },
   { name: "Kindergarten 2",  color: "bg-accent/10 text-accent" },
  { name: "Grade 1",color: "bg-secondary/10 text-secondary" },
  { name: "Grade 2",  color: "bg-accent/10 text-accent" },
  { name: "Grade 3",  color: "bg-secondary/10 text-secondary" },
  { name: "Grade 4",  color: "bg-accent/10 text-accent" },
  { name: "Grade 5",  color: "bg-secondary/10 text-secondary" },
  { name: "Grade 6", color: "bg-accent/10 text-accent" },
  { name: "Grade 7",  color: "bg-secondary/10 text-secondary" },
];

const approaches = [
  { icon: Lightbulb, title: "Activity-Based Learning" },
  { icon: Brain, title: "Experiential Learning" },
  { icon: Users, title: "Interactive Classes" },
  { icon: MessageSquare, title: "Communication Skills" },
  { icon: BookOpen, title: "Personalized Mentoring" },
];

const development = [
  { icon: Award, title: "Academic Excellence", desc: "Strong foundation in core subjects with conceptual clarity." },
  { icon: Users, title: "Social Skills", desc: "Building teamwork, empathy, and collaboration." },
  { icon: Heart, title: "Emotional Growth", desc: "Nurturing emotional intelligence and resilience." },
  { icon: Sparkles, title: "Confidence", desc: "Empowering students to express themselves boldly." },
  { icon: Lightbulb, title: "Creativity", desc: "Encouraging innovative thinking and imagination." },
];

const Academics = () => {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Header */}
      <section className="gradient-navy pt-32 pb-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary-foreground mb-4">Academics</h1>
          <p className="text-primary-foreground/70 text-lg max-w-2xl mx-auto">
            A comprehensive curriculum designed to ignite curiosity and build strong foundations.
          </p>
        </div>
      </section>

      {/* Curriculum */}
      <section className="section-padding">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-10">
            <h2 className="section-title">Our Curriculum</h2>
          </div>
          <div className="bg-card rounded-2xl p-10 border border-border card-hover">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center">
                <GraduationCap className="w-7 h-7 text-accent" />
              </div>
              <h3 className="font-heading font-bold text-2xl text-primary">CBSE</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Our CBSE curriculum combines the best of national standards with global
              perspectives. We employ modern teaching methods that focus on conceptual understanding
              rather than rote memorization, preparing students for academic excellence and real-world challenges.
            </p>
            <div className="flex flex-wrap gap-3">
              {["Concept-Based Learning", "Modern Methods", "Global Standards", "Critical Thinking"].map((tag) => (
                <span key={tag} className="bg-sky text-secondary text-xs font-semibold px-3 py-1.5 rounded-full">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Grades */}
      <section className="section-padding gradient-sky">
        <div className="container mx-auto">
          <div className="text-center mb-10">
            <h2 className="section-title">Grades Offered</h2>
            <p className="section-subtitle">From the first steps of learning to building a strong academic foundation.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {grades.map((g) => (
              <div key={g.name} className="bg-card rounded-2xl p-6 text-center card-hover border border-border">
                <div className={`w-12 h-12 rounded-full ${g.color} flex items-center justify-center mx-auto mb-3`}>
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-bold text-primary text-sm">{g.name}</h3>
                <p className="text-muted-foreground text-xs mt-1">{g.age}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Approach */}
      <section className="section-padding">
        <div className="container mx-auto">
          <div className="text-center mb-10">
            <h2 className="section-title">Learning Approach</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {approaches.map((a, i) => (
              <div key={i} className="text-center p-6 rounded-2xl bg-card border border-border card-hover group">
                <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4
                                group-hover:bg-accent transition-colors duration-300">
                  <a.icon className="w-7 h-7 text-accent group-hover:text-accent-foreground transition-colors duration-300" />
                </div>
                <h3 className="font-heading font-bold text-primary text-sm">{a.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Student Development */}
      <section className="section-padding gradient-sky">
        <div className="container mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-title">Student Development</h2>
            <p className="section-subtitle">Nurturing every dimension of a child's growth.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {development.map((d, i) => (
              <div key={i} className="flex items-start gap-4 p-6 rounded-2xl bg-card border border-border card-hover">
                <div className="w-12 h-12 rounded-xl bg-sky flex items-center justify-center shrink-0">
                  <d.icon className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-primary mb-1">{d.title}</h3>
                  <p className="text-muted-foreground text-sm">{d.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
      <Footer />
    </div>
  );
};

export default Academics;
