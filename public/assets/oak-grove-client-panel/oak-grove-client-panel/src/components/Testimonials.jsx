import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Parent of Grade 3 Student",
    text: "Oak Grove has been an incredible journey for my child. The teachers provide personal attention and the activity-based learning has made my daughter love school!",
  },
  {
    name: "Rajesh Kumar",
    role: "Parent of Nursery Student",
    text: "The nurturing environment at Oak Grove is unmatched. My son looks forward to school every day. The communication skills development is remarkable.",
  },
  {
    name: "Anitha Reddy",
    role: "Parent of Grade 5 Student",
    text: "We chose Oak Grove for its holistic approach to education. The focus on personality development alongside academics has truly shaped our child's confidence.",
  },
];

const Testimonials = () => {
  return (
    <section className="section-padding">
      <div className="container mx-auto">
        <div className="text-center mb-14">
          <h2 className="section-title">What Parents Say</h2>
          <p className="section-subtitle">Hear from the families who trust us with their children's education.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-card rounded-2xl p-8 card-hover border border-border relative">
              <Quote className="w-10 h-10 text-accent/30 absolute top-6 right-6" />
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6 italic">"{t.text}"</p>
              <div>
                <p className="font-heading font-bold text-primary">{t.name}</p>
                <p className="text-muted-foreground text-xs">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
