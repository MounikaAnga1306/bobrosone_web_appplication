import { useState, useEffect } from "react";
import { Bell, Calendar, CalendarDays, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface AnnouncementItem {
  id: number;
  title: string;
  description: string;
  event_date: string;
  image?: string;
  image_url?: string;
  status?: string;
  type?: string;
  created_at?: string;
}

const Notifications = () => {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementItem | null>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://api.oakgroveschoolhyd.in/api/events/announcements');
      const data = await response.json();
      if (Array.isArray(data)) setAnnouncements(data);
      else if (data.success && Array.isArray(data.data)) setAnnouncements(data.data);
      else setAnnouncements([]);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `${diffDays} days away`;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getImageUrl = (item: AnnouncementItem) => {
    const imagePath = item.image || item.image_url;
    if (!imagePath) return null;
    return imagePath.startsWith('http') ? imagePath : `https://api.oakgroveschoolhyd.in/${imagePath}`;
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-32 pb-16 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4">

          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
              <Bell className="w-5 h-5" />
              <span className="font-semibold">Stay Updated</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">Notifications & Announcements</h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Important updates, announcements, and notices from Oak Grove School
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-16">
              <Bell className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">No announcements at the moment.</p>
              <p className="text-gray-400">Check back later for updates!</p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {announcements.map((announcement) => {
                const imageUrl = getImageUrl(announcement);
                return (
                  <div
                    key={announcement.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
                    onClick={() => setSelectedAnnouncement(announcement)}
                  >
                    {/* Image */}
                    <div className="relative h-56 overflow-hidden">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={announcement.title}
                          className="w-full h-full object-container transition-transform duration-300 hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                          <CalendarDays className="h-16 w-16 text-primary/50" />
                        </div>
                      )}
                      {/* Date badge */}
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
                        <p className="text-primary font-semibold text-sm">
                          {formatDate(announcement.event_date)}
                        </p>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                        {announcement.title}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {announcement.description}
                      </p>
                      <button className="text-primary font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                        Read More <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {selectedAnnouncement && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedAnnouncement(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {getImageUrl(selectedAnnouncement) && (
              <img
                src={getImageUrl(selectedAnnouncement)!}
                alt={selectedAnnouncement.title}
                className="w-full h-full object-container transition-transform duration-300 hover:scale-110"
              />
            )}
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                {selectedAnnouncement.title}
              </h2>
              <div className="flex items-center gap-2 text-gray-500 mb-4">
                <Calendar className="w-5 h-5" />
                <span>{formatDate(selectedAnnouncement.event_date)}</span>
              </div>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {selectedAnnouncement.description}
              </p>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="mt-6 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default Notifications;