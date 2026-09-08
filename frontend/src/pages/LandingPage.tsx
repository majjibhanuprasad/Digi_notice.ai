import React from 'react';
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
  GraduationCap 
} from 'lucide-react';

const LandingPage: React.FC = () => {
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
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-600 rounded-lg text-white">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-900">DigiNotice</span>
            <span className="ml-1 text-sm font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">AI</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            to="/display-mode" 
            className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition"
          >
            📺 Kiosk Signage Mode
          </Link>
          <Link 
            to="/login?role=student" 
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition"
          >
            Student Panel
          </Link>
          <Link 
            to="/login?role=admin" 
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition"
          >
            Administrator Login
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Background blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-200/50 rounded-full filter blur-3xl opacity-60 animate-pulse pointer-events-none" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-200/50 rounded-full filter blur-3xl opacity-60 animate-pulse pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold uppercase tracking-wide mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Next-Gen Notice Board
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-950 max-w-4xl mx-auto leading-tight md:leading-none">
            Smart Digital Communication <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              for Modern College Campuses
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mt-6 max-w-2xl mx-auto leading-relaxed">
            Deliver the right notice to the right student at the right time. Eliminate paper waste and drive student engagement with personalized notice streams.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Link 
              to="/login?role=student" 
              className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg hover:shadow-indigo-500/20 transition-all text-center"
            >
              Explore as Student
            </Link>
            <Link 
              to="/login?role=admin" 
              className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-sm transition text-center"
            >
              Portal for Faculty & Admins
            </Link>
          </div>
          
          <div className="mt-4 text-xs text-slate-500">
            Hackathon demonstration mode with pre-seeded demo accounts
          </div>
        </div>

        {/* Dashboard Preview Mockup */}
        <div className="relative mt-16 border border-slate-200 shadow-2xl rounded-2xl overflow-hidden bg-white max-w-5xl w-full aspect-video p-1.5">
          <div className="bg-slate-100 rounded-xl w-full h-full flex flex-col overflow-hidden select-none border border-slate-200">
            {/* Mock Dashboard Header */}
            <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="w-3 h-3 rounded-full bg-green-400" />
                <span className="text-xs text-slate-400 ml-4 font-mono">https://diginotice-ai.edu/student/dashboard</span>
              </div>
            </div>
            <div className="flex-1 bg-slate-50 p-6 flex flex-col items-center justify-center text-center">
              <div className="p-4 bg-indigo-100 rounded-full text-indigo-600 mb-4 animate-bounce">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Explore notice boards in real-time</h3>
              <p className="text-slate-500 text-sm max-w-md mt-1">
                Access personalized placements, exam alerts, and calendar integrations by logging in.
              </p>
              <div className="flex gap-3 mt-6">
                <Link to="/login?role=student" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-750">
                  Try Student View
                </Link>
                <Link to="/login?role=admin" className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-705">
                  Try Admin View
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-white border-t border-slate-200 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
              AI-Powered Campus Communication
            </h2>
            <p className="text-lg text-slate-500 mt-4 leading-relaxed">
              Equipped with generative, targeting, safety, and multilingual capabilities tailored for educational notice delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feat, index) => (
              <div 
                key={index}
                className="p-6 border border-slate-100 bg-slate-50 hover:bg-white hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 rounded-2xl transition duration-300 group"
              >
                <div className="p-3 bg-white group-hover:bg-indigo-50 rounded-xl w-fit shadow-sm border border-slate-200/50 transition">
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-850 mt-5 group-hover:text-indigo-600 transition">
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
