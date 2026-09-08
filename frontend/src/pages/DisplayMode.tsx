import React, { useState, useEffect } from 'react';
import { GraduationCap, Clock, Calendar, QrCode, AlertTriangle, Sparkles, Volume2, Loader2 } from 'lucide-react';

interface NoticeItem {
  _id: string;
  title: string;
  content: string;
  summary: string;
  category: string;
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL';
  department: string | null;
  publishAt: string;
  expiresAt: string;
  eventDate?: string;
  venue?: string;
}

const DisplayMode: React.FC = () => {
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    // 1. Digital Clock Ticker
    const clockTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // 2. Fetch notices initially & set interval to refresh every 30s
    fetchKioskNotices();
    const noticesTimer = setInterval(fetchKioskNotices, 30000);

    return () => {
      clearInterval(clockTimer);
      clearInterval(noticesTimer);
    };
  }, []);

  // 3. Slide Carousel timer (switches slide every 10 seconds)
  useEffect(() => {
    if (notices.length <= 1) return;
    
    const carouselTimer = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % notices.length);
    }, 10000);

    return () => clearInterval(carouselTimer);
  }, [notices]);

  const fetchKioskNotices = async () => {
    try {
      const res = await fetch(`${API_URL}/notices/kiosk`);
      if (res.ok) {
        const data = await res.json();
        setNotices(data);
      }
    } catch (e) {
      console.error('Failed to load kiosk notices:', e);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-red-650 text-white';
      case 'HIGH':
        return 'bg-amber-600 text-white';
      default:
        return 'bg-indigo-600 text-white';
    }
  };

  // Build simulated public notice url for QR Code scanning
  const activeNotice = notices[activeIndex];
  const publicNoticeUrl = activeNotice
    ? `${window.location.origin}/login?noticeId=${activeNotice._id}`
    : window.location.origin;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(publicNoticeUrl)}`;

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col justify-between overflow-hidden p-6 select-none">
      
      {/* Top Banner (Header) */}
      <header className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-500/20">
            <GraduationCap className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <span className="text-2xl font-black tracking-tight text-white block">DIGINOTICE AI</span>
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block">Digital Signage Network</span>
          </div>
        </div>

        {/* Live Clock Panel */}
        <div className="flex items-center gap-6 text-slate-400">
          <div className="flex items-center gap-2 border-r border-slate-800 pr-6 text-sm font-bold uppercase tracking-wide">
            <Calendar className="w-5 h-5 text-indigo-500" />
            <span>{currentTime.toLocaleDateString(undefined, { dateStyle: 'full' })}</span>
          </div>
          <div className="flex items-center gap-2 text-2xl font-black text-white font-mono">
            <Clock className="w-6 h-6 text-indigo-500 animate-spin-slow" />
            <span>{currentTime.toLocaleTimeString()}</span>
          </div>
        </div>
      </header>

      {/* Main Notice Slot Display */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
          <p className="text-slate-500 text-sm mt-3 font-semibold tracking-wide">Connecting to board display feeds...</p>
        </div>
      ) : notices.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
          <div className="p-5 bg-slate-900 border border-slate-800 text-slate-500 rounded-full mb-6">
            <QrCode className="w-16 h-16" />
          </div>
          <h2 className="text-3xl font-black tracking-tight">No active announcements</h2>
          <p className="text-slate-500 text-sm mt-2 max-w-md">
            The notice board is currently clear. Administrative circulars will automatically appear here once approved by HODs.
          </p>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8 py-8 items-stretch">
          
          {/* Left 3 cols: Notice Content Display */}
          <div className="lg:col-span-3 bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden backdrop-blur-xl">
            
            {/* Background design accents */}
            <div className="absolute right-0 top-0 translate-x-20 -translate-y-20 w-96 h-96 bg-indigo-500/5 rounded-full pointer-events-none filter blur-2xl" />

            <div>
              {/* Category & priority badges */}
              <div className="flex items-center gap-3">
                <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-wider uppercase ${getPriorityColor(activeNotice.priority)}`}>
                  {activeNotice.priority} Notice
                </span>
                <span className="text-slate-500 font-extrabold text-sm uppercase tracking-widest">
                  Category: {activeNotice.category}
                </span>
                {activeNotice.department && (
                  <span className="bg-slate-800 text-indigo-400 border border-indigo-900/30 px-3 py-1 rounded-full text-xs font-bold uppercase">
                    Target: {activeNotice.department}
                  </span>
                )}
              </div>

              {/* Title */}
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight mt-6">
                {activeNotice.title}
              </h2>

              {/* Content body */}
              <div className="text-slate-350 text-base md:text-lg mt-8 leading-relaxed font-semibold max-h-[300px] overflow-hidden relative">
                <p className="whitespace-pre-line">{activeNotice.content}</p>
                {/* Fade effect at bottom if long */}
                <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
              </div>
            </div>

            {/* AI Summary Banner at bottom */}
            {activeNotice.summary && (
              <div className="bg-indigo-950/40 border border-indigo-850/40 p-5 rounded-2xl flex items-start gap-4 shadow-lg shadow-black/10 mt-6">
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl shrink-0 mt-0.5">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">🧠 AI Digest</h5>
                  <p className="text-slate-300 text-sm font-medium mt-1 leading-relaxed">
                    {activeNotice.summary.replace('🧠 AI Summary:', '').trim()}
                  </p>
                </div>
              </div>
            )}

          </div>

          {/* Right 1 col: Scan QR Code Kiosk instructions */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between items-center text-center shadow-2xl relative">
            <div>
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block">Student Action</span>
              <h4 className="text-lg font-black text-white mt-1.5">Scan Notice Details</h4>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed font-semibold">
                Use your smartphone camera to scan this QR code. It will open this notice directly on your personalized feed, allowing you to ask the AI assistant questions or download calendar events.
              </p>
            </div>

            {/* QR Image Slot */}
            <div className="bg-white p-3.5 rounded-2xl shadow-xl w-44 h-44 flex items-center justify-center ring-4 ring-indigo-500/10 my-6">
              <img 
                src={qrImageUrl} 
                alt="Scan Notice QR Code"
                className="w-full h-full object-contain" 
              />
            </div>

            <div className="text-[10px] font-bold text-slate-500 tracking-wider">
              Slide {activeIndex + 1} of {notices.length} &bull; Autoplays
            </div>
          </div>

        </div>
      )}

      {/* Footer ticker */}
      <footer className="border-t border-slate-800 pt-4 flex items-center justify-between text-xs text-slate-600 font-bold uppercase tracking-wider">
        <div>
          🛡️ Emergency broadcasts automatically bypass normal queue
        </div>
        <div>
          DigiNotice AI &bull; Smart Campus Signage
        </div>
      </footer>
    </div>
  );
};

export default DisplayMode;
