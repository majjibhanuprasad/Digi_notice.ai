import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, 
  Search, 
  Bell, 
  LogOut, 
  Bookmark, 
  CheckCircle, 
  ExternalLink, 
  Calendar, 
  MessageSquare, 
  Globe, 
  ChevronRight, 
  X, 
  Send,
  Loader2,
  FileText,
  AlertOctagon,
  Sparkles,
  Info
} from 'lucide-react';

interface NoticeItem {
  _id: string;
  title: string;
  content: string;
  summary: string;
  category: string;
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL';
  department: string | null;
  academicYears: string[];
  targetGroups: string[];
  attachments: { type: 'pdf' | 'image'; name: string; url: string }[];
  createdBy: string;
  createdByName?: string;
  publishAt: string;
  expiresAt: string;
  views: number;
  acknowledgements: number;
  isBookmarked: boolean;
  isAcknowledged: boolean;
  registrationLink?: string;
  eventDate?: string;
  venue?: string;
}

interface QueryItem {
  _id: string;
  question: string;
  answer?: string;
  studentName: string;
  answeredByName?: string;
  timestamp: string;
  status: 'Open' | 'Answered' | 'Closed';
}

const StudentDashboard: React.FC = () => {
  const { user, logout, apiFetch } = useAuth();
  const navigate = useNavigate();

  // Notices State
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [filteredNotices, setFilteredNotices] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All');
  const [sidebarFilter, setSidebarFilter] = useState('dashboard'); // dashboard, saved, critical, placements, exams, events

  // Notification Banner
  const [notifications, setNotifications] = useState<string[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Selected Notice for detail drawer
  const [selectedNotice, setSelectedNotice] = useState<NoticeItem | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showSummaryOnly, setShowSummaryOnly] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [translatedText, setTranslatedText] = useState('');
  const [translating, setTranslating] = useState(false);

  // Ask AI Chatbot
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiChatHistory, setAiChatHistory] = useState<{ sender: 'user' | 'ai'; text: string }[]>([]);
  const [aiThinking, setAiThinking] = useState(false);

  // Public Q&A Thread
  const [publicQueries, setPublicQueries] = useState<QueryItem[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [postingQuestion, setPostingQuestion] = useState(false);

  const categories = ['All', 'Exams', 'Placements', 'Workshops', 'Sports', 'Cultural', 'General', 'Emergency'];

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchNotices();
  }, [user]);

  // Apply filters whenever filters or notices list changes
  useEffect(() => {
    let result = [...notices];

    // Category Filter
    if (activeCategoryFilter !== 'All') {
      result = result.filter(n => n.category === activeCategoryFilter);
    }

    // Sidebar Category overrides
    if (sidebarFilter === 'saved') {
      result = result.filter(n => n.isBookmarked);
    } else if (sidebarFilter === 'critical') {
      result = result.filter(n => n.priority === 'CRITICAL');
    } else if (sidebarFilter === 'placements') {
      result = result.filter(n => n.category === 'Placements');
    } else if (sidebarFilter === 'exams') {
      result = result.filter(n => n.category === 'Exams');
    } else if (sidebarFilter === 'events') {
      result = result.filter(n => ['Events', 'Workshops', 'Sports', 'Cultural'].includes(n.category));
    }

    setFilteredNotices(result);
  }, [notices, activeCategoryFilter, sidebarFilter]);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/notices');
      if (res.ok) {
        const data = await res.json();
        setNotices(data);
        
        // Populate critical alerts into notification tray
        const criticalAlerts = data
          .filter((n: NoticeItem) => n.priority === 'CRITICAL')
          .map((n: NoticeItem) => n.title);
        setNotifications(criticalAlerts);
      }
    } catch (e) {
      console.error('Error loading notices:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchNotices();
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch(`/notices/search?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setNotices(data);
      }
    } catch (e) {
      console.error('Search failed:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleNoticeClick = async (notice: NoticeItem) => {
    setSelectedNotice(notice);
    setShowSummaryOnly(false);
    setSelectedLanguage('English');
    setTranslatedText('');
    setAiQuestion('');
    setAiChatHistory([
      { sender: 'ai', text: `Hi ${user?.name}! Ask me any questions about the "${notice.title}" announcement. I will only answer using facts from this notice.` }
    ]);
    
    setDetailLoading(true);
    try {
      const res = await apiFetch(`/notices/${notice._id}`);
      if (res.ok) {
        const fullNotice = await res.json();
        setPublicQueries(fullNotice.queries || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDetailLoading(false);
    }
  };

  // Toggle bookmark
  const toggleBookmark = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await apiFetch(`/notices/${id}/bookmark`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setNotices(prev => prev.map(n => n._id === id ? { ...n, isBookmarked: data.bookmarked } : n));
        if (selectedNotice && selectedNotice._id === id) {
          setSelectedNotice(prev => prev ? { ...prev, isBookmarked: data.bookmarked } : null);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Mark notice as read / Acknowledge
  const handleAcknowledge = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await apiFetch(`/notices/${id}/acknowledge`, { method: 'POST' });
      if (res.ok) {
        setNotices(prev => prev.map(n => n._id === id ? { ...n, isAcknowledged: true, acknowledgements: n.acknowledgements + 1 } : n));
        if (selectedNotice && selectedNotice._id === id) {
          setSelectedNotice(prev => prev ? { ...prev, isAcknowledged: true } : null);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Translate notice content
  const handleTranslate = async (lang: string) => {
    setSelectedLanguage(lang);
    if (lang === 'English') {
      setTranslatedText('');
      return;
    }

    setTranslating(true);
    try {
      const res = await apiFetch('/ai/translate', {
        method: 'POST',
        body: JSON.stringify({
          content: selectedNotice?.content,
          targetLanguage: lang
        })
      });
      if (res.ok) {
        const data = await res.json();
        setTranslatedText(data.translation);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTranslating(false);
    }
  };

  // Ask AI Q&A chatbot
  const handleAskAIChat = async (presetQuestion?: string) => {
    const questionText = presetQuestion || aiQuestion;
    if (!questionText.trim()) return;

    if (!presetQuestion) setAiQuestion('');
    
    // Add user message to chat history
    setAiChatHistory(prev => [...prev, { sender: 'user', text: questionText }]);
    setAiThinking(true);

    try {
      const res = await apiFetch('/ai/ask', {
        method: 'POST',
        body: JSON.stringify({
          noticeId: selectedNotice?._id,
          question: questionText
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAiChatHistory(prev => [...prev, { sender: 'ai', text: data.answer }]);
      }
    } catch (e) {
      console.error(e);
      setAiChatHistory(prev => [...prev, { sender: 'ai', text: 'Error fetching AI response. Please try again.' }]);
    } finally {
      setAiThinking(false);
    }
  };

  // Post public question
  const handlePostPublicQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    setPostingQuestion(true);
    try {
      const res = await apiFetch(`/notices/${selectedNotice?._id}/query`, {
        method: 'POST',
        body: JSON.stringify({ question: newQuestion })
      });

      if (res.ok) {
        const createdQuery = await res.json();
        setPublicQueries(prev => [createdQuery, ...prev]);
        setNewQuestion('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPostingQuestion(false);
    }
  };

  // Generate and download ICS calendar event file
  const downloadCalendarEvent = (notice: NoticeItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const eventDateStr = notice.eventDate || notice.publishAt;
    const dateObj = new Date(eventDateStr);
    
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//DigiNotice AI//Notice Board Calendar Event//EN',
      'BEGIN:VEVENT',
      `UID:${notice._id}@college.edu`,
      `DTSTAMP:${year}${month}${day}T090000Z`,
      `DTSTART:${year}${month}${day}T090000Z`,
      `DTEND:${year}${month}${day}T170000Z`,
      `SUMMARY:${notice.title.replace(/[^\w\s-]/g, '')}`,
      `DESCRIPTION:${(notice.summary || notice.title).replace(/\n/g, '\\n')}`,
      `LOCATION:${notice.venue || 'College Campus'}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${notice.category}_Event.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Priority color formatting helper
  const getPriorityClasses = (priority: 'CRITICAL' | 'HIGH' | 'NORMAL') => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'HIGH':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">DigiNotice</span>
            <span className="ml-1 text-xs font-semibold px-1.5 py-0.2 bg-indigo-50 text-indigo-700 rounded-full">AI</span>
          </div>
        </div>

        {/* Global Search form */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notices naturally (e.g. 'CSE midterms')"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-sm font-medium focus:bg-white focus:outline-none focus:border-indigo-500 transition"
          />
        </form>

        <div className="flex items-center gap-4">
          
          {/* Notifications Panel */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 hover:bg-slate-100 rounded-xl relative transition"
            >
              <Bell className="w-5 h-5 text-slate-600" />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-50">
                <h4 className="font-bold text-sm text-slate-900 mb-2.5 flex items-center justify-between">
                  <span>Urgent Notifications</span>
                  <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full">{notifications.length} Active</span>
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="text-slate-400 text-xs py-4 text-center">No new emergency broadcasts.</div>
                  ) : (
                    notifications.map((notif, i) => (
                      <div key={i} className="p-2.5 bg-red-50 border border-red-100 rounded-xl text-xs text-red-800 flex items-start gap-2">
                        <AlertOctagon className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        <div>{notif}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User profile details */}
          <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
            <img 
              src={user?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
              alt="Avatar" 
              className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-50"
            />
            <div className="hidden lg:block text-left">
              <div className="text-sm font-bold text-slate-900 leading-none">{user?.name}</div>
              <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">
                {user?.academicYear} &bull; {user?.department}
              </div>
            </div>
            <button 
              onClick={logout}
              className="p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-xl transition"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col p-4 shrink-0">
          <div className="space-y-1">
            <button
              onClick={() => { setSidebarFilter('dashboard'); setActiveCategoryFilter('All'); }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition flex items-center justify-between ${sidebarFilter === 'dashboard' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <span>Dashboard</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSidebarFilter('saved')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition flex items-center justify-between ${sidebarFilter === 'saved' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <span>Saved Notices</span>
              <Bookmark className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSidebarFilter('critical')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition flex items-center justify-between ${sidebarFilter === 'critical' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <span>Critical Alerts</span>
              <AlertOctagon className="w-4 h-4 text-red-500" />
            </button>
          </div>

          <div className="border-t border-slate-200/80 my-4" />

          {/* Academic Categories filter shortcut */}
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-3.5">Categories</div>
          <div className="space-y-1">
            <button
              onClick={() => setSidebarFilter('placements')}
              className={`w-full text-left px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center justify-between ${sidebarFilter === 'placements' ? 'bg-slate-100 text-indigo-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              Placements
            </button>
            <button
              onClick={() => setSidebarFilter('exams')}
              className={`w-full text-left px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center justify-between ${sidebarFilter === 'exams' ? 'bg-slate-100 text-indigo-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              Exams
            </button>
            <button
              onClick={() => setSidebarFilter('events')}
              className={`w-full text-left px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center justify-between ${sidebarFilter === 'events' ? 'bg-slate-100 text-indigo-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              Events & Sports
            </button>
          </div>

          {/* Student Profile Overview Info box */}
          <div className="mt-auto p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <h5 className="text-xs font-bold text-slate-900">Curriculum Target</h5>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Your notice board is filtered by the administration for:
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">{user?.department}</span>
              <span className="text-[10px] font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">{user?.academicYear}</span>
              {user?.clubs?.map((club, idx) => (
                <span key={idx} className="text-[10px] font-bold bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full truncate max-w-full">{club}</span>
              ))}
            </div>
          </div>
        </aside>

        {/* Notice Board Feed Container */}
        <main className="flex-1 overflow-y-auto p-6">
          
          {/* Welcome section */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-950 tracking-tight">
                Welcome back, {user?.name}! ✨
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Displaying official announcements for {user?.department} &bull; {user?.academicYear}
              </p>
            </div>
            
            {/* Horizontal Categories filter pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {categories.map((cat, i) => (
                <button
                  key={i}
                  onClick={() => { setActiveCategoryFilter(cat); setSidebarFilter('dashboard'); }}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition ${activeCategoryFilter === cat ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Emergency Alert Section Banner */}
          {filteredNotices.some(n => n.priority === 'CRITICAL') && (
            <div className="mb-6 space-y-4">
              {filteredNotices
                .filter(n => n.priority === 'CRITICAL')
                .map((notice) => (
                  <div 
                    key={notice._id}
                    onClick={() => handleNoticeClick(notice)}
                    className="p-5 bg-gradient-to-r from-red-500 to-red-600 hover:shadow-xl text-white rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer transition relative overflow-hidden shadow-lg shadow-red-200"
                  >
                    <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-48 h-48 bg-white/5 rounded-full pointer-events-none" />
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-white/10 rounded-xl shrink-0 mt-1">
                        <AlertOctagon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold tracking-wider uppercase bg-white/20 px-2 py-0.5 rounded-full">College Broadcast</span>
                          <span className="text-[10px] font-black tracking-widest uppercase bg-red-700 px-2.5 py-0.5 rounded-full">CRITICAL SAFETY</span>
                        </div>
                        <h4 className="text-lg font-black tracking-tight mt-1">{notice.title}</h4>
                        <p className="text-red-100 text-sm mt-1 line-clamp-2 max-w-3xl leading-relaxed">{notice.summary || notice.content}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 z-10">
                      {!notice.isAcknowledged ? (
                        <button
                          onClick={(e) => handleAcknowledge(notice._id, e)}
                          className="px-4 py-2.5 bg-white text-red-600 hover:bg-red-50 text-xs font-extrabold rounded-xl transition shadow-md flex items-center gap-1.5"
                        >
                          <CheckCircle className="w-4 h-4" /> Acknowledge Alert
                        </button>
                      ) : (
                        <span className="px-3.5 py-2.5 bg-red-700/60 border border-red-400/20 text-red-200 text-xs font-bold rounded-xl flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4" /> Acknowledged
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Notices Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="text-slate-500 text-sm mt-3 font-semibold">Loading notices feed...</p>
            </div>
          ) : filteredNotices.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-full w-fit mx-auto text-slate-400">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mt-5">No notices found</h3>
              <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
                {searchQuery ? 'We couldn\'t find any match for your search criteria.' : 'There are no active notices matching this category.'}
              </p>
              {searchQuery && (
                <button 
                  onClick={() => { setSearchQuery(''); fetchNotices(); }}
                  className="mt-6 text-sm font-bold text-indigo-600 hover:text-indigo-800"
                >
                  Clear search query
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNotices
                .filter(n => n.priority !== 'CRITICAL') // Safety alerts already pinned on top
                .map((notice) => (
                  <div
                    key={notice._id}
                    onClick={() => handleNoticeClick(notice)}
                    className="bg-white border border-slate-200/80 hover:border-indigo-150 hover:shadow-xl hover:-translate-y-0.5 rounded-2xl p-5 flex flex-col justify-between cursor-pointer transition duration-300 relative group"
                  >
                    <div>
                      {/* Notice Header Tags */}
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 border rounded-full uppercase tracking-wider ${getPriorityClasses(notice.priority)}`}>
                          {notice.priority}
                        </span>
                        
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => toggleBookmark(notice._id, e)}
                            className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-amber-500 rounded-lg transition"
                          >
                            <Bookmark className={`w-4 h-4 ${notice.isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
                          </button>
                        </div>
                      </div>

                      {/* Title & Metadata */}
                      <h3 className="font-bold text-slate-900 text-base leading-snug mt-3 group-hover:text-indigo-600 transition duration-200 line-clamp-2">
                        {notice.title}
                      </h3>
                      
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold tracking-wide mt-2 uppercase">
                        <span>{notice.category}</span>
                        <span>&bull;</span>
                        <span>{notice.department || 'All'}</span>
                        <span>&bull;</span>
                        <span>{new Date(notice.publishAt).toLocaleDateString()}</span>
                      </div>

                      {/* AI Summary Banner */}
                      {notice.summary && (
                        <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3 mt-4 text-xs text-indigo-900 leading-relaxed font-medium">
                          <div className="flex items-center gap-1 font-bold text-indigo-700 text-[10px] uppercase tracking-wider mb-0.5">
                            <Sparkles className="w-3.5 h-3.5" /> AI Summary
                          </div>
                          {notice.summary.replace('🧠 AI Summary:', '').trim()}
                        </div>
                      )}
                    </div>

                    {/* Notice Card Footer Actions */}
                    <div className="mt-5 border-t border-slate-100 pt-3.5 flex items-center justify-between text-xs font-semibold text-slate-600">
                      
                      {/* Left: Attachment & Calendar Indicators */}
                      <div className="flex items-center gap-2">
                        {notice.attachments && notice.attachments.length > 0 && (
                          <span className="flex items-center gap-0.5 text-slate-400" title="PDF Attachment">
                            <FileText className="w-4 h-4" />
                          </span>
                        )}
                        {notice.eventDate && (
                          <button
                            onClick={(e) => downloadCalendarEvent(notice, e)}
                            className="flex items-center gap-1 text-slate-500 hover:text-indigo-600 transition"
                            title="Add to Calendar (ICS)"
                          >
                            <Calendar className="w-4 h-4" />
                            <span className="text-[10px]">Add Event</span>
                          </button>
                        )}
                      </div>

                      {/* Right: Read Acknowledge Indicator */}
                      <div>
                        {notice.priority !== 'NORMAL' ? (
                          notice.isAcknowledged ? (
                            <span className="text-emerald-600 flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" /> Read
                            </span>
                          ) : (
                            <button
                              onClick={(e) => handleAcknowledge(notice._id, e)}
                              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition"
                            >
                              Mark as Read
                            </button>
                          )
                        ) : (
                          <span className="text-slate-400 group-hover:text-indigo-600 transition font-bold flex items-center gap-0.5">
                            Read Full <ChevronRight className="w-3.5 h-3.5 mt-0.5" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </main>
      </div>

      {/* Notice Detail Drawer */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end">
          
          <div className="w-full max-w-3xl bg-white h-full flex flex-col justify-between shadow-2xl relative animate-slide-in">
            
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {selectedNotice.category} Notice
                </span>
                <h3 className="font-extrabold text-lg text-slate-900 leading-snug mt-1.5 pr-8">
                  {selectedNotice.title}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedNotice(null)}
                className="p-2 hover:bg-slate-200 text-slate-500 hover:text-slate-900 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Toolbar: Toggle Summary, Translate Language */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-bold text-slate-600">
                
                {/* Summary / Full Toggle */}
                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 w-fit">
                  <button
                    onClick={() => setShowSummaryOnly(false)}
                    className={`px-3 py-1 rounded-md transition ${!showSummaryOnly ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    Show Full Notice
                  </button>
                  <button
                    onClick={() => setShowSummaryOnly(true)}
                    className={`px-3 py-1 rounded-md transition ${showSummaryOnly ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    Show AI Summary
                  </button>
                </div>

                {/* Language translation Selector */}
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span className="text-slate-500">Translate:</span>
                  <select 
                    value={selectedLanguage}
                    onChange={(e) => handleTranslate(e.target.value)}
                    className="bg-white border border-slate-200 text-xs font-bold py-1 px-2.5 rounded-lg focus:outline-none focus:border-indigo-500"
                  >
                    <option value="English">Original (English)</option>
                    <option value="Telugu">తెలుగు (Telugu)</option>
                    <option value="Hindi">हिन्दी (Hindi)</option>
                    <option value="Tamil">தமிழ் (Tamil)</option>
                    <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
                  </select>
                </div>
              </div>

              {/* Notice Body */}
              <div className="prose prose-slate max-w-none">
                {translating ? (
                  <div className="flex items-center gap-2 text-indigo-600 py-6 text-sm font-semibold">
                    <Loader2 className="w-4 h-4 animate-spin" /> Fetching translation...
                  </div>
                ) : showSummaryOnly ? (
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 text-indigo-950 font-medium leading-relaxed">
                    <div className="flex items-center gap-1.5 font-extrabold text-indigo-700 text-xs uppercase tracking-wider mb-2">
                      <Sparkles className="w-4.5 h-4.5" /> AI Executive Summary
                    </div>
                    {selectedNotice.summary || 'Summary unavailable.'}
                  </div>
                ) : (
                  <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-inner whitespace-pre-wrap text-sm text-slate-800 leading-relaxed font-medium">
                    {translatedText || selectedNotice.content}
                  </div>
                )}
              </div>

              {/* Action Banner: Event Dates, Register link, Download attachment */}
              {(selectedNotice.registrationLink || selectedNotice.eventDate || (selectedNotice.attachments && selectedNotice.attachments.length > 0)) && (
                <div className="bg-indigo-50/50 border border-indigo-100 p-5 rounded-2xl space-y-3.5">
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Notice resources</h4>
                  
                  {selectedNotice.eventDate && (
                    <div className="flex items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4.5 h-4.5 text-indigo-600" />
                        <div>
                          <span className="font-bold block">Event Date</span>
                          <span className="text-slate-500 font-semibold">{new Date(selectedNotice.eventDate).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => downloadCalendarEvent(selectedNotice, e)}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-sm"
                      >
                        Add to Calendar
                      </button>
                    </div>
                  )}

                  {selectedNotice.registrationLink && (
                    <div className="flex items-center justify-between gap-4 text-xs pt-2 border-t border-indigo-100">
                      <div className="flex items-center gap-2">
                        <ExternalLink className="w-4.5 h-4.5 text-indigo-600" />
                        <div>
                          <span className="font-bold block">Action Link</span>
                          <span className="text-indigo-700 underline truncate max-w-xs block font-semibold">{selectedNotice.registrationLink}</span>
                        </div>
                      </div>
                      <a
                        href={selectedNotice.registrationLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-1.5 bg-white text-indigo-700 hover:bg-indigo-50 border border-indigo-200 rounded-lg font-bold"
                      >
                        Register Now
                      </a>
                    </div>
                  )}

                  {selectedNotice.attachments && selectedNotice.attachments.length > 0 && (
                    <div className="flex flex-col gap-2 pt-2 border-t border-indigo-100 text-xs">
                      <span className="font-bold text-slate-700 block">Attachments</span>
                      {selectedNotice.attachments.map((file, i) => (
                        <a
                          key={i}
                          href={file.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 p-2 bg-white border border-indigo-100 hover:border-indigo-300 rounded-xl transition text-slate-700 font-bold"
                        >
                          <FileText className="w-4.5 h-4.5 text-red-500" />
                          <span>{file.name} ({file.type.toUpperCase()})</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* public Q&A Thread (Faculty Answers) */}
              <div className="border-t border-slate-200 pt-6">
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <Info className="w-4.5 h-4.5 text-indigo-500" />
                  Public Q&A Forum
                </h4>

                <form onSubmit={handlePostPublicQuestion} className="flex gap-2 mb-6">
                  <input
                    type="text"
                    required
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Ask a general question under this notice..."
                    className="flex-1 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white text-xs font-semibold py-2 px-3.5 rounded-xl focus:outline-none transition"
                  />
                  <button
                    type="submit"
                    disabled={postingQuestion}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                  >
                    {postingQuestion ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Post'}
                  </button>
                </form>

                <div className="space-y-4">
                  {publicQueries.length === 0 ? (
                    <div className="text-slate-400 text-xs text-center py-6">No public questions posted yet. Be the first to ask!</div>
                  ) : (
                    publicQueries.map((query) => (
                      <div key={query._id} className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">{query.studentName}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">{new Date(query.timestamp).toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-650 font-medium">Q: {query.question}</p>
                        
                        {query.answer ? (
                          <div className="bg-emerald-50/50 border border-emerald-100 p-2.5 rounded-xl text-emerald-900 mt-2">
                            <span className="font-extrabold text-[10px] text-emerald-800 uppercase tracking-wide block">Response from {query.answeredByName || 'Faculty'}</span>
                            <p className="mt-0.5 leading-relaxed font-semibold">A: {query.answer}</p>
                          </div>
                        ) : (
                          <div className="text-[10px] text-amber-600 font-bold bg-amber-50 border border-amber-100 px-2 py-0.5 rounded w-fit">
                            Awaiting response
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Sidebar Chat panel: Ask Notice AI */}
            <div className="w-full border-t border-slate-200 p-4 bg-slate-950 text-white flex flex-col">
              <div className="flex items-center justify-between mb-3 text-xs font-extrabold tracking-wider text-slate-400 uppercase">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                  Ask AI Notice Assistant
                </span>
                <span className="text-[10px] font-bold text-emerald-400">Contextual Only</span>
              </div>

              {/* Chat Messages */}
              <div className="h-40 overflow-y-auto space-y-2.5 p-1 bg-slate-900 rounded-xl mb-3 scrollbar-thin">
                {aiChatHistory.map((chat, idx) => (
                  <div 
                    key={idx} 
                    className={`p-2.5 rounded-xl text-xs max-w-[85%] leading-relaxed ${chat.sender === 'user' ? 'bg-indigo-650 text-white ml-auto' : 'bg-slate-800 text-slate-100 mr-auto'}`}
                  >
                    {chat.text}
                  </div>
                ))}
                {aiThinking && (
                  <div className="bg-slate-800 text-slate-300 mr-auto p-2.5 rounded-xl text-xs flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin text-purple-400" /> Thinking...
                  </div>
                )}
              </div>

              {/* Suggested Questions */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                <button
                  onClick={() => handleAskAIChat('Who is eligible?')}
                  className="text-[10px] font-bold bg-slate-900 hover:bg-slate-850 text-slate-350 py-1 px-2.5 border border-slate-800 rounded-lg transition"
                >
                  Who is eligible?
                </button>
                <button
                  onClick={() => handleAskAIChat('What is the deadline?')}
                  className="text-[10px] font-bold bg-slate-900 hover:bg-slate-850 text-slate-350 py-1 px-2.5 border border-slate-800 rounded-lg transition"
                >
                  What is the deadline?
                </button>
                <button
                  onClick={() => handleAskAIChat('Where is the event?')}
                  className="text-[10px] font-bold bg-slate-900 hover:bg-slate-850 text-slate-350 py-1 px-2.5 border border-slate-800 rounded-lg transition"
                >
                  Where is the event?
                </button>
              </div>

              {/* Chat Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  placeholder="Ask a specific detail (e.g. 'What room is this drive held in?')"
                  onKeyDown={(e) => e.key === 'Enter' && handleAskAIChat()}
                  className="flex-1 bg-slate-900 border border-slate-800 focus:border-purple-500 text-xs font-semibold py-2.5 px-3.5 rounded-xl focus:outline-none transition text-white placeholder-slate-500"
                />
                <button
                  onClick={() => handleAskAIChat()}
                  className="p-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition flex items-center justify-center shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default StudentDashboard;
