import { useRef } from "react";
import { Star, MapPin, ChevronLeft, ChevronRight } from "lucide-react";

// Real hotel/building photos (Unsplash). Swap these img URLs with your own
// assets or API data whenever you have real listings.
const hotels = [
  {
    name: "Taj Lands End Mumbai",
    city: "Mumbai",
    price: "8,499",
    rating: "5.0",
    img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=720&q=80&auto=format&fit=crop",
  },
  {
    name: "The Leela Palace Bengaluru",
    city: "Bengaluru",
    price: "11,200",
    rating: "5.0",
    img: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=720&q=80&auto=format&fit=crop",
  },
  {
    name: "Radisson Blu Hyderabad",
    city: "Hyderabad",
    price: "4,850",
    rating: "4.8",
    img: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=720&q=80&auto=format&fit=crop",
  },
  {
    name: "ITC Grand Goa Resort",
    city: "Goa",
    price: "9,150",
    rating: "5.0",
    img: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=720&q=80&auto=format&fit=crop",
  },
  {
    name: "Novotel Pune Nagar Road",
    city: "Pune",
    price: "5,640",
    rating: "4.7",
    img: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=720&q=80&auto=format&fit=crop",
  },
];

const FALLBACK_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='720' height='460'>
       <rect width='100%' height='100%' fill='#e5e7eb'/>
       <text x='50%' y='50%' font-family='sans-serif' font-size='30'
             fill='#9ca3af' text-anchor='middle' dy='.3em'>Hotel Image</text>
     </svg>`
  );

function HotelCard({ hotel, index }) {
  return (
    <div
      className="rh-card group w-[22rem] flex-none snap-start cursor-pointer overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-2 hover:border-blue-100 hover:shadow-2xl sm:w-[24rem]"
      style={{ animationDelay: `${index * 90}ms` }}
    >
      {/* Image with zoom-on-hover */}
      <div className="relative h-60 w-full overflow-hidden sm:h-64">
        <img
          src={hotel.img}
          alt={hotel.name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = FALLBACK_IMG;
          }}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        {/* Soft gradient that fades in on hover */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        {/* Rating chip that lifts in on hover */}
        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-sm font-semibold text-gray-800 shadow-sm backdrop-blur-sm opacity-0 -translate-y-1 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          {hotel.rating}
        </div>
      </div>

      <div className="px-6 pb-6 pt-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate text-2xl font-semibold text-gray-900 transition-colors duration-300 group-hover:text-blue-600">
            {hotel.name}
          </h3>
          <span className="flex flex-shrink-0 items-center gap-1 text-lg font-semibold text-gray-800">
            <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
            {hotel.rating}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="flex items-center gap-1 text-base font-semibold text-blue-500">
            <MapPin className="h-4 w-4 fill-blue-500 text-blue-500" />
            {hotel.city}
          </span>
          <span className="text-2xl font-bold text-gray-900">₹{hotel.price}</span>
        </div>
      </div>
    </div>
  );
}

export default function RecommendedHotels() {
  const railRef = useRef(null);

  const scroll = (dir) => {
    railRef.current?.scrollBy({ left: dir * 404, behavior: "smooth" });
  };

  return (
    // px here = the little gap on the page corners. Increase/decrease to taste.
    <section className="w-full px-4 py-6 sm:px-6 lg:px-8">
      {/* Component-scoped keyframes (works without touching tailwind.config) */}
      <style>{`
        @keyframes rhFadeUp {
          from { opacity: 0; transform: translateY(28px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        .rh-card {
          opacity: 0;
          animation: rhFadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .rh-card { animation: none; opacity: 1; }
        }
      `}</style>

      {/* Full-width panel (no max-width, just the corner spacing from the section) */}
      <div className="w-full rounded-3xl bg-white p-7 shadow-lg sm:p-9">
        {/* Header */}
        <div className="mb-7 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Recommended Hotels
          </h2>
          <div className="flex gap-2.5">
            <button
              onClick={() => scroll(-1)}
              aria-label="Previous"
              className="grid h-11 w-11 place-items-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition-all duration-200 hover:scale-110 hover:border-blue-500 hover:bg-blue-500 hover:text-white active:scale-95"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll(1)}
              aria-label="Next"
              className="grid h-11 w-11 place-items-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition-all duration-200 hover:scale-110 hover:border-blue-500 hover:bg-blue-500 hover:text-white active:scale-95"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Rail */}
        <div
          ref={railRef}
          className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-1 pb-2 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {hotels.map((hotel, i) => (
            <HotelCard key={hotel.name} hotel={hotel} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}