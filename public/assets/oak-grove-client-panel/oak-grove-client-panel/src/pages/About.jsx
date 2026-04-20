import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTASection from "@/components/CTASection";
import { Eye, Target, BookOpen, Smile, Users, Lightbulb, Star, Heart, Award, GraduationCap } from "lucide-react";

const philosophies = [
  { icon: Lightbulb, title: "Activity-Based Learning", desc: "Hands-on experiences that make concepts come alive." },
  { icon: Smile, title: "Fun Learning", desc: "Joyful classrooms where curiosity is celebrated." },
  { icon: Users, title: "One-to-One Interaction", desc: "Personalized attention for every student." },
  { icon: Heart, title: "Child-Centered Education", desc: "Programs designed around each child's needs." },
  { icon: BookOpen, title: "Exploration Learning", desc: "Encouraging discovery and critical thinking." },
];

const whyChoose = [
  { icon: Award, title: "Experienced Faculty", desc: "Trained, passionate educators committed to excellence." },
  { icon: GraduationCap, title: "CBSE Curriculum", desc: "International standards with a modern approach." },
  { icon: Star, title: "Holistic Development", desc: "Academic, social, emotional, and creative growth." },
  { icon: Users, title: "Small Class Sizes", desc: "Ensuring individual attention for every child." },
  { icon: Lightbulb, title: "Modern Facilities", desc: "State-of-the-art classrooms and learning resources." },
  { icon: Heart, title: "Safe Environment", desc: "A secure, nurturing space for children to thrive." },
];

const About = () => {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Page Header */}
      <section className="gradient-navy pt-32 pb-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary-foreground mb-4">About Oak Grove</h1>
          <p className="text-primary-foreground/70 text-lg max-w-2xl mx-auto">
            A student-centered school dedicated to nurturing young minds with modern teaching methodologies.
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="section-padding">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="text-lg text-muted-foreground leading-relaxed">
           Oak Grove School is an CBSE curriculum institution offering quality education from Playgroup to Grade 7. We create a supportive and engaging learning environment that encourages curiosity, creativity, and confidence.

          </p>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="section-padding gradient-sky">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-card rounded-2xl p-10 card-hover border border-border">
              <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-5">
                <Eye className="w-7 h-7 text-accent" />
              </div>
              <h3 className="section-title text-2xl">Our Vision</h3>
              <p className="text-muted-foreground leading-relaxed">
                To be a leading educational institution that inspires a love for learning, fosters
                creativity, and prepares students to become responsible global citizens with strong
                moral values and a commitment to excellence.
              </p>
            </div>
            <div className="bg-card rounded-2xl p-10 card-hover border border-border">
              <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-5">
                <Target className="w-7 h-7 text-secondary" />
              </div>
              <h3 className="section-title text-2xl">Our Mission</h3>
              <ul className="text-muted-foreground space-y-2">
                <li className="flex items-start gap-2"><span className="text-accent mt-1">•</span> Provide quality education through innovative methods</li>
                <li className="flex items-start gap-2"><span className="text-accent mt-1">•</span> Foster holistic development of every child</li>
                <li className="flex items-start gap-2"><span className="text-accent mt-1">•</span> Build communication and leadership skills</li>
                <li className="flex items-start gap-2"><span className="text-accent mt-1">•</span> Create a safe, inclusive, and joyful learning environment</li>
                <li className="flex items-start gap-2"><span className="text-accent mt-1">•</span> Partner with parents in each child's educational journey</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Teaching Philosophy */}
      <section className="section-padding">
        <div className="container mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-title">Our Teaching Philosophy</h2>
            <p className="section-subtitle">Innovative approaches that make learning meaningful and lasting.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {philosophies.map((p, i) => (
              <div key={i} className="flex items-start gap-4 p-6 rounded-2xl bg-card border border-border card-hover">
                <div className="w-12 h-12 rounded-xl bg-sky flex items-center justify-center shrink-0">
                  <p.icon className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-primary mb-1">{p.title}</h3>
                  <p className="text-muted-foreground text-sm">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section-padding gradient-sky">
        <div className="container mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-title">Why Choose Oak Grove?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyChoose.map((item, i) => (
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

      <CTASection />
      <Footer />
    </div>
  );
};

export default About;
