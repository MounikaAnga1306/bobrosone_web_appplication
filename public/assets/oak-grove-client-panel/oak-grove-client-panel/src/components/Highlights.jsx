import { BookOpen, GraduationCap, Lightbulb, Users, MessageSquare, Smile } from "lucide-react";

const highlights = [
  { icon: BookOpen, title: "CBSE Curriculum", desc: "World-class syllabus aligned with global education standards." },
  { icon: GraduationCap, title: "Playgroup to Grade 7", desc: "Complete primary education journey under one nurturing roof." },
  { icon: Lightbulb, title: "Activity-Based Learning", desc: "Hands-on experiences that make learning joyful and lasting." },
  { icon: Users, title: "One-to-One Personal Attention", desc: "Personalized mentoring ensuring every child thrives." },
  { icon: MessageSquare, title: "Communication & Confidence Building", desc: "Building confident communicators from an early age." },
  { icon: Smile, title: "Fun and Engaging Learning Environment", desc: "Creative, playful environment that sparks curiosity." },
];

const Highlights = () => {
  return (
    <section className="section-padding">
      <div className="container mx-auto">
        <div className="text-center mb-14">
          <h2 className="section-title">Why Oak Grove?</h2>
          <p className="section-subtitle">We provide a holistic education experience that shapes future leaders.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {highlights.map((item, i) => (
            <div
              key={i}
              className="bg-card rounded-2xl p-8 card-hover border border-border group cursor-default"
            >
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
  );
};

export default Highlights;
