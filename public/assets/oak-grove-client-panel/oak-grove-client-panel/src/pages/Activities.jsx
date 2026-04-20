import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTASection from "@/components/CTASection";
import Gallery from "@/components/Gallery";
import { Palette, Music, BookOpen, Mic, Users, PartyPopper, Trophy, Flag, Star, Calendar } from "lucide-react";

const coCurricular = [
  { icon: Palette, title: "Art & Craft", desc: "Unleashing creativity through colors, shapes, and imagination." },
  { icon: Music, title: "Music & Dance", desc: "Rhythm and movement that bring joy and discipline." },
  { icon: BookOpen, title: "Story Telling", desc: "Building imagination and language skills through tales." },
  { icon: Mic, title: "Public Speaking", desc: "Developing confidence to express ideas clearly." },
  { icon: Users, title: "Group Activities", desc: "Teamwork and collaboration through group projects." },
];

const events = [
  { icon: PartyPopper, title: "Festivals", desc: "Celebrating cultural diversity with joy." },
  { icon: Star, title: "Annual Day", desc: "Showcasing talent on the grand stage." },
  { icon: Trophy, title: "Sports Day", desc: "Competition, sportsmanship, and fitness." },
  { icon: Flag, title: "Cultural Events", desc: "Embracing traditions and heritage." },
  { icon: Calendar, title: "Themed Days", desc: "Fun learning through themed celebrations." },
  { icon: Users, title: "Assemblies", desc: "Building community spirit and leadership." },
];

const Activities = () => {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Header */}
      <section className="gradient-navy pt-32 pb-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary-foreground mb-4">Activities & Events</h1>
          <p className="text-primary-foreground/70 text-lg max-w-2xl mx-auto">
            Beyond the classroom — a world of exploration, creativity, and celebration.
          </p>
        </div>
      </section>

      {/* Co-Curricular */}
      <section className="section-padding">
        <div className="container mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-title">Co-Curricular Activities</h2>
            <p className="section-subtitle">Developing well-rounded students through diverse experiences.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {coCurricular.map((item, i) => (
              <div key={i} className="p-8 rounded-2xl bg-card border border-border card-hover group">
                <div className="w-14 h-14 rounded-xl bg-sky flex items-center justify-center mb-5
                                group-hover:bg-accent transition-colors duration-300">
                  <item.icon className="w-7 h-7 text-secondary group-hover:text-accent-foreground transition-colors duration-300" />
                </div>
                <h3 className="font-heading font-bold text-lg text-primary mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Activity-Based Learning */}
      <section className="section-padding gradient-sky">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="section-title">Activity-Based Learning</h2>
          <p className="text-muted-foreground text-lg leading-relaxed mb-8">
            At Oak Grove, we believe that children learn best when they are actively engaged. Our
            activity-based learning approach integrates games, experiments, projects, and creative
            exercises into every lesson — transforming abstract concepts into tangible experiences
            that students remember and cherish.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["Learn by Doing", "Creative Projects", "Science Experiments", "Group Discussions"].map((item) => (
              <div key={item} className="bg-card rounded-xl p-4 border border-border text-center">
                <p className="text-primary font-semibold text-sm">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Events */}
      <section className="section-padding">
        <div className="container mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-title">School Events</h2>
            <p className="section-subtitle">Memorable celebrations that build community and lasting memories.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((e, i) => (
              <div key={i} className="flex items-start gap-4 p-6 rounded-2xl bg-card border border-border card-hover">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <e.icon className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-primary mb-1">{e.title}</h3>
                  <p className="text-muted-foreground text-sm">{e.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Gallery />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Activities;
