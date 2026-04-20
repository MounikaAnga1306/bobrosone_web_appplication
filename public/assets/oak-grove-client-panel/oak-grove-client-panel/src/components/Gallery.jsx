import { useState } from "react";

const categories = ["All", "Campus", "Classrooms", "Activities", "Events"];

const images = [
   { src: "/dussehra.jpeg", cat: "Events", alt: "Celebration" },
     { src: "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=600&h=400&fit=crop", cat: "Classrooms", alt: "Learning" },
   { src: "/yoga.jpeg", cat: "Activities", alt: "Art activity" },
     { src: "/event.jpeg", cat: "Events", alt: "School event" },
  { src: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&h=400&fit=crop", cat: "Classrooms", alt: "Classroom" },
  { src: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=400&fit=crop", cat: "Activities", alt: "Kids activity" },
  { src: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&h=400&fit=crop", cat: "Campus", alt: "School building" },
    { src: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&h=400&fit=crop", cat: "Campus", alt: "School campus" },

 
];

const Gallery = () => {
  const [active, setActive] = useState("All");
  const filtered = active === "All" ? images : images.filter((img) => img.cat === active);

  return (
    <section className="section-padding gradient-sky">
      <div className="container mx-auto">
        <div className="text-center mb-10">
          <h2 className="section-title">Life at Oak Grove</h2>
          <p className="section-subtitle">Glimpses of our vibrant campus and joyful learning moments.</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                active === cat
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-card text-muted-foreground hover:bg-primary/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((img, i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-xl group cursor-pointer aspect-[3/2]"
            >
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/50 transition-all duration-300 flex items-center justify-center">
                <span className="text-primary-foreground font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {img.cat}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
