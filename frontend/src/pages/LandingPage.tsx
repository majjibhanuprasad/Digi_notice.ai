import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Target, 
  AlertTriangle, 
  Search, 
  Bell, 
  BarChart2, 
  MessageSquare, 
  Languages, 
  GraduationCap,
  Menu,
  X
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: <Sparkles className="w-6 h-6 text-purple-500" />,
      title: 'AI Notice Generator',
      desc: 'Create highly professional, formal college notice drafts instantly using brief inputs.'
    },
    {
      icon: <Target className="w-6 h-6 text-emerald-500" />,
      title: 'Smart Targeting',
      desc: 'Automatically targets notices to specific departments, academic years, and student groups.'
    },
    {
      icon: <AlertTriangle className="w-6 h-6 text-red-500" />,
      title: 'Emergency Alerts',
      desc: 'Broadcast critical, high-priority emergency alerts immediately with mandatory acknowledgement.'
    },
    {
      icon: <Search className="w-6 h-6 text-blue-500" />,
      title: 'AI Search',
      desc: 'Ask questions naturally to locate notices by keywords, categories, departments, or deadlines.'
    },
    {
      icon: <Bell className="w-6 h-6 text-amber-500" />,
      title: 'Smart Notifications',
      desc: 'Receive alerts targeted to your curriculum, interests, and notification preferences.'
    },
    {
      icon: <BarChart2 className="w-6 h-6 text-indigo-500" />,
      title: 'Real-time Analytics',
      desc: 'Monitor view rates, query statistics, and emergency acknowledgements through active dashboards.'
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-pink-500" />,
      title: 'AI Q&A Assistant',
      desc: 'Ask notice-specific questions and get instant answers based purely on authorized data.'
    },
    {
      icon: <Languages className="w-6 h-6 text-teal-500" />,
      title: 'Multi-Language Translation',
      desc: 'Translate notices instantly into Telugu, Hindi, Tamil, and Kannada, keeping originals intact.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Responsive Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3.5 sm:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-sm shadow-indigo-500/20">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900">DigiNotice</span>
              <span className="ml-1 text-xs font-extrabold px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">AI</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-4">
            <Link 
              to="/display-mode" 
              className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-indigo-600 transition"
            >
              📺 Kiosk Signage Mode
            </Link>
            <Link 
              to="/login" 
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 transition"
            >
              Sign In
            </Link>
            <Link 
              to="/register" 
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-slate-100 flex flex-col gap-2.5 pb-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <Link 
              to="/display-mode" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition flex items-center gap-2"
            >
              <span>📺</span> Kiosk Signage Mode
            </Link>
            <Link 
              to="/login" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition flex items-center gap-2"
            >
              <span>🔑</span> Sign In
            </Link>
            <Link 
              to="/register" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition flex items-center justify-center shadow-sm"
            >
              Sign Up
            </Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Background blobs */}
        <div className="absolute top-10 left-5 sm:left-10 w-48 sm:w-72 h-48 sm:h-72 bg-indigo-200/50 rounded-full filter blur-3xl opacity-60 pointer-events-none" />
        <div className="absolute bottom-10 right-5 sm:right-10 w-56 sm:w-80 h-56 sm:h-80 bg-purple-200/50 rounded-full filter blur-3xl opacity-60 pointer-events-none" />

        <div className="relative z-10 w-full max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-4 sm:mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Next-Gen Smart Campus Notice Board
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 leading-tight sm:leading-tight">
            Smart Digital Communication <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700">
              for Modern College Campuses
            </span>
          </h1>
          <p className="text-sm sm:text-lg md:text-xl text-slate-600 mt-4 sm:mt-6 max-w-2xl mx-auto leading-relaxed font-normal">
            Deliver the right notice to the right student at the right time. Eliminate paper notice waste and drive instant engagement with personalized student feeds.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 mt-8 sm:mt-10 w-full max-w-md sm:max-w-none mx-auto">
            <Link 
              to="/register?role=student" 
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 text-sm sm:text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg hover:shadow-indigo-500/25 transition text-center"
            >
              Explore as Student
            </Link>
            <Link 
              to="/register?role=faculty" 
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 text-sm sm:text-base font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-sm transition text-center"
            >
              Portal for Faculty & Admins
            </Link>
          </div>
          
          {/* Quick Metrics Chips */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mt-8 sm:mt-10 pt-6 border-t border-slate-200/80">
            <div className="p-3 bg-white border border-slate-200/60 rounded-xl shadow-xs">
              <div className="text-lg sm:text-2xl font-black text-indigo-600">100%</div>
              <div className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase">Paperless</div>
            </div>
            <div className="p-3 bg-white border border-slate-200/60 rounded-xl shadow-xs">
              <div className="text-lg sm:text-2xl font-black text-purple-600">15+</div>
              <div className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase">Branches</div>
            </div>
            <div className="p-3 bg-white border border-slate-200/60 rounded-xl shadow-xs">
              <div className="text-lg sm:text-2xl font-black text-emerald-600">AI</div>
              <div className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase">Summaries</div>
            </div>
            <div className="p-3 bg-white border border-slate-200/60 rounded-xl shadow-xs">
              <div className="text-lg sm:text-2xl font-black text-blue-600">4 Lang</div>
              <div className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase">Translation</div>
            </div>
          </div>
        </div>

        {/* Dashboard Preview Mockup */}
        <div className="relative mt-12 sm:mt-16 border border-slate-200 shadow-2xl rounded-2xl overflow-hidden bg-white max-w-5xl w-full p-1 sm:p-1.5">
          <div className="bg-slate-100 rounded-xl w-full flex flex-col overflow-hidden select-none border border-slate-200 min-h-[260px] sm:min-h-[360px]">
            {/* Mock Dashboard Header */}
            <div className="bg-white border-b border-slate-200 px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-400" />
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-400" />
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-400" />
                <span className="text-[10px] sm:text-xs text-slate-400 ml-2 sm:ml-4 font-mono truncate max-w-[180px] sm:max-w-none">https://diginotice-ai.edu/student/dashboard</span>
              </div>
            </div>
            <div className="flex-1 bg-slate-50 p-6 sm:p-10 flex flex-col items-center justify-center text-center">
              <div className="p-3 sm:p-4 bg-indigo-100 rounded-full text-indigo-600 mb-3 sm:mb-4">
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-800">Explore notice boards in real-time</h3>
              <p className="text-slate-500 text-xs sm:text-sm max-w-md mt-1">
                Access personalized placements, exam alerts, and calendar integrations by logging in.
              </p>
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 mt-5 sm:mt-6 w-full max-w-xs">
                <Link to="/login?role=student" className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-indigo-700 shadow-sm text-center">
                  Try Student View
                </Link>
                <Link to="/login?role=admin" className="px-4 py-2.5 bg-purple-600 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-purple-700 shadow-sm text-center">
                  Try Admin View
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-white border-t border-slate-200 py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900">
              AI-Powered Campus Communication
            </h2>
            <p className="text-sm sm:text-base text-slate-500 mt-2 sm:mt-4 leading-relaxed font-normal">
              Equipped with generative, targeting, safety, and multilingual capabilities tailored for educational notice delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {features.map((feat, index) => (
              <div 
                key={index}
                className="p-6 border border-slate-100 bg-slate-50 hover:bg-white hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 rounded-2xl transition duration-300 group"
              >
                <div className="p-3 bg-white group-hover:bg-indigo-50 rounded-xl w-fit shadow-sm border border-slate-200/50 transition">
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-800 mt-5 group-hover:text-indigo-600 transition">
                  {feat.title}
                </h3>
                <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 py-12 px-6 text-center text-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-white">
            <GraduationCap className="w-5 h-5 text-indigo-500" />
            <span className="font-bold tracking-tight">DigiNotice AI</span>
          </div>
          <div>
            &copy; 2026 DigiNotice AI. Created for Student Education & Hackathon Demonstrations.
          </div>
          <div className="flex gap-6">
            <Link to="/display-mode" className="hover:text-white transition">Kiosk Screen</Link>
            <Link to="/login" className="hover:text-white transition">Portal Access</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
