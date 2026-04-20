import { Megaphone } from "lucide-react";

const announcements = [
  "🎓 Admissions Open for 2025-26 — Playgroup to Grade 7",
  "📅 Annual Day Celebrations — March 28, 2026",
  "🏆 Sports Day Coming Soon!",
  "📝 Parent-Teacher Meeting — April 5, 2026",
  "🎨 Art & Craft Exhibition — April 12, 2026",
];

const AnnouncementBar = () => {
  return (
    <div className="bg-accent overflow-hidden py-3">
      <div className="flex items-center">
        <div className="shrink-0 bg-accent-foreground/10 px-4 py-1 flex items-center gap-2 rounded-r-full">
          <Megaphone className="w-4 h-4 text-accent-foreground" />
          <span className="font-bold text-accent-foreground text-sm">Updates</span>
        </div>
        <div className="overflow-hidden whitespace-nowrap flex-1 ml-4">
          <div className="animate-marquee inline-flex gap-16">
            {[...announcements, ...announcements].map((a, i) => (
              <span key={i} className="text-accent-foreground/90 text-sm font-medium">
                {a}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBar;
