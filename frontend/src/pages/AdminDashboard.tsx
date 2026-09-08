import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, 
  BarChart2, 
  FileText, 
  PlusCircle, 
  CheckSquare, 
  FileLock, 
  HelpCircle, 
  LogOut, 
  Sparkles, 
  Loader2, 
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Calendar,
  AlertOctagon,
  CornerDownRight,
  TrendingUp,
  Award,
  Users
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
  attachments?: { type: 'pdf' | 'image'; name: string; url: string }[];
  status: string;
  publishAt: string;
  expiresAt: string;
  views: number;
  acknowledgements: number;
  createdByName?: string;
  rejectionReason?: string;
  registrationLink?: string;
  eventDate?: string;
  venue?: string;
  targetAudience?: 'STUDENTS' | 'FACULTY' | 'SUPER_ADMIN';
  createdByDepartment?: string;
}

interface AuditLogItem {
  _id: string;
  userName: string;
  userRole: string;
  action: string;
  noticeTitle?: string;
  timestamp: string;
}

interface QueryItem {
  _id: string;
  noticeId: string;
  noticeTitle?: string;
  studentName: string;
  question: string;
  answer?: string;
  answeredByName?: string;
  answeredAt?: string;
  timestamp: string;
  status: string;
}

const AdminDashboard: React.FC = () => {
  const { user, logout, apiFetch } = useAuth();
  const navigate = useNavigate();

  // Navigation state
  const [activeTab, setActiveTab] = useState<'analytics' | 'notices' | 'create' | 'approvals' | 'qa' | 'logs' | 'facultyFeed' | 'superAdminFeed'>('analytics');

  // Backend Data States
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [queries, setQueries] = useState<QueryItem[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form State for creating/editing notice
  const [noticeId, setNoticeId] = useState<string | null>(null); // For edit mode
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formSummary, setFormSummary] = useState('');
  const [formCategory, setFormCategory] = useState('General');
  const [formPriority, setFormPriority] = useState<'CRITICAL' | 'HIGH' | 'NORMAL'>('NORMAL');
  const [formDepartment, setFormDepartment] = useState<string>('All');
  const [formAcademicYears, setFormAcademicYears] = useState<string[]>([]);
  const [formTargetGroups, setFormTargetGroups] = useState<string[]>([]);
  const [formPublishAt, setFormPublishAt] = useState('');
  const [formExpiresAt, setFormExpiresAt] = useState('');
  const [formEventDate, setFormEventDate] = useState('');
  const [formVenue, setFormVenue] = useState('');
  const [formRegistrationLink, setFormRegistrationLink] = useState('');
  const [attachments, setAttachments] = useState<{ type: 'pdf' | 'image'; name: string; url: string }[]>([]);
  const [formTargetAudience, setFormTargetAudience] = useState<'STUDENTS' | 'FACULTY' | 'SUPER_ADMIN'>('STUDENTS');

  // AI Generator Panel state
  const [aiTopic, setAiTopic] = useState('');
  const [aiDescription, setAiDescription] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);

  // AI Content Safety State
  const [safetyScore, setSafetyScore] = useState<number | null>(null);
  const [safetyWarnings, setSafetyWarnings] = useState<string[]>([]);

  // Rejection Dialog state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingNoticeId, setRejectingNoticeId] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // Emergency Confirmation Dialog State
  const [showEmergencyConfirm, setShowEmergencyConfirm] = useState(false);
  const [pendingEmergencyNoticeData, setPendingEmergencyNoticeData] = useState<any>(null);

  // Q&A Respond State
  const [respondingQueryId, setRespondingQueryId] = useState<string | null>(null);
  const [qaAnswerText, setQaAnswerText] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role === 'STUDENT') {
      navigate('/student/dashboard');
      return;
    }
    fetchDashboardData();
  }, [user, activeTab]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Analytics
      const analyticsRes = await apiFetch('/analytics');
      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setAnalyticsData(data);
      }

      // 2. Fetch notices
      const noticesRes = await apiFetch('/notices/admin');
      if (noticesRes.ok) {
        const data = await noticesRes.json();
        setNotices(data);
      }

      // 3. Fetch audit logs (Super Admin only)
      if (user?.role === 'SUPER_ADMIN') {
        const logsRes = await apiFetch('/audit-logs');
        if (logsRes.ok) {
          const data = await logsRes.json();
          setAuditLogs(data);
        }
      }

      // 4. Fetch all notice queries
      const queriesRes = await apiFetch('/queries');
      if (queriesRes.ok) {
        const qData = await queriesRes.json();
        setQueries(qData);
      }
    } catch (e) {
      console.error('Error fetching dashboard details:', e);
    } finally {
      setLoading(false);
    }
  };

  // Perform AI notice generation
  const handleAIGenerate = async () => {
    if (!aiTopic.trim()) {
      alert('Please fill in a topic for the AI generator.');
      return;
    }

    setAiGenerating(true);
    try {
      const res = await apiFetch('/ai/generate-notice', {
        method: 'POST',
        body: JSON.stringify({
          topic: aiTopic,
          description: aiDescription,
          department: formDepartment,
          category: formCategory
        })
      });

      if (res.ok) {
        const data = await res.json();
        setFormTitle(data.title);
        setFormContent(data.content);
        setFormSummary(data.summary);
        setFormCategory(data.category);
        setFormPriority(data.priority);
        
        // Trigger smart recommendations automatically
        handleRecommendTargets(data.content, data.title);
      }
    } catch (e) {
      console.error(e);
      alert('AI generator failed to respond.');
    } finally {
      setAiGenerating(false);
    }
  };

  // Analyze content and recommend targeting
  const handleRecommendTargets = async (content: string, title: string) => {
    try {
      const res = await apiFetch('/ai/target', {
        method: 'POST',
        body: JSON.stringify({ content, title })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.department) setFormDepartment(data.department);
        if (data.academicYears) setFormAcademicYears(data.academicYears);
        if (data.category) setFormCategory(data.category);
        if (data.targetGroups) setFormTargetGroups(data.targetGroups);
      }

      // Automatically run Content Safety Check
      runSafetyCheck(content, title);
    } catch (e) {
      console.error(e);
    }
  };

  // Run content check for score & warnings
  const runSafetyCheck = async (content: string, title: string) => {
    try {
      const res = await apiFetch('/ai/content-check', {
        method: 'POST',
        body: JSON.stringify({ 
          content, 
          title, 
          metadata: { 
            expiresAt: formExpiresAt, 
            eventDate: formEventDate,
            registrationLink: formRegistrationLink
          } 
        })
      });
      if (res.ok) {
        const data = await res.json();
        setSafetyScore(data.score);
        setSafetyWarnings(data.warnings);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Year check toggle helper
  const handleYearToggle = (year: string) => {
    setFormAcademicYears(prev => 
      prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year]
    );
  };

  // Group check toggle helper
  const handleGroupToggle = (group: string) => {
    setFormTargetGroups(prev => 
      prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]
    );
  };

  // Notice form submission (Save Draft or Submit for Approval)
  const handleSubmitForm = async (status: 'Draft' | 'Submitted' | 'Published') => {
    if (!formTitle || !formContent) {
      alert('Title and description are required.');
      return;
    }

    const payload = {
      title: formTitle,
      content: formContent,
      summary: formSummary || `Notice about ${formTitle}`,
      category: formCategory,
      priority: formPriority,
      department: formDepartment === 'All' ? null : formDepartment,
      academicYears: formAcademicYears,
      targetGroups: formTargetGroups,
      publishAt: formPublishAt ? new Date(formPublishAt) : new Date(),
      expiresAt: formExpiresAt ? new Date(formExpiresAt) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      eventDate: formEventDate ? new Date(formEventDate) : undefined,
      venue: formVenue || undefined,
      registrationLink: formRegistrationLink || undefined,
      attachments,
      status: status,
      targetAudience: formTargetAudience
    };

    // If it's a critical safety alert being published, require explicit confirmation
    if (formPriority === 'CRITICAL' && status !== 'Draft' && !showEmergencyConfirm) {
      setPendingEmergencyNoticeData({ payload, id: noticeId });
      setShowEmergencyConfirm(true);
      return;
    }

    try {
      let res;
      if (noticeId) {
        // Edit mode
        res = await apiFetch(`/notices/${noticeId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        // Create mode
        res = await apiFetch('/notices', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        alert(noticeId ? 'Notice updated successfully!' : 'Notice created successfully!');
        resetForm();
        setActiveTab('notices');
      } else {
        const err = await res.json();
        alert(err.message || 'Operation failed.');
      }
    } catch (e) {
      console.error(e);
      alert('Server error occurred.');
    }
  };

  const confirmEmergencyPublish = async () => {
    setShowEmergencyConfirm(false);
    if (!pendingEmergencyNoticeData) return;

    const { payload, id } = pendingEmergencyNoticeData;
    try {
      let res;
      if (id) {
        res = await apiFetch(`/notices/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        res = await apiFetch('/notices', { method: 'POST', body: JSON.stringify(payload) });
      }

      if (res.ok) {
        alert('🚨 EMERGENCY Broadcast published immediately!');
        resetForm();
        setActiveTab('notices');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPendingEmergencyNoticeData(null);
    }
  };

  const handleEditNoticeClick = (notice: NoticeItem) => {
    setNoticeId(notice._id);
    setFormTitle(notice.title);
    setFormContent(notice.content);
    setFormSummary(notice.summary);
    setFormCategory(notice.category);
    setFormPriority(notice.priority);
    setFormDepartment(notice.department || 'All');
    setFormAcademicYears(notice.academicYears || []);
    setFormTargetGroups(notice.targetGroups || []);
    
    // Date formats formatting for datetime-local
    const formatDateTime = (dateStr: string) => {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      return d.toISOString().slice(0, 16);
    };

    setFormPublishAt(formatDateTime(notice.publishAt));
    setFormExpiresAt(formatDateTime(notice.expiresAt));
    setFormEventDate(notice.eventDate ? formatDateTime(notice.eventDate) : '');
    setFormVenue(notice.venue || '');
    setFormRegistrationLink(notice.registrationLink || '');
    setAttachments(notice.attachments || []);
    setFormTargetAudience(notice.targetAudience || 'STUDENTS');
    setActiveTab('create');
  };

  const handleDeleteClick = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this notice?')) return;
    try {
      const res = await apiFetch(`/notices/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Notice deleted successfully.');
        fetchDashboardData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Approve notice workflow
  const handleApprove = async (id: string) => {
    try {
      const res = await apiFetch(`/notices/${id}/approve`, { method: 'POST' });
      if (res.ok) {
        alert('Notice approved & published.');
        fetchDashboardData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Reject notice workflow trigger
  const handleRejectClick = (id: string) => {
    setRejectingNoticeId(id);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const submitRejection = async () => {
    if (!rejectionReason.trim()) {
      alert('Please enter a rejection reason.');
      return;
    }

    try {
      const res = await apiFetch(`/notices/${rejectingNoticeId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason: rejectionReason })
      });
      if (res.ok) {
        alert('Notice rejected and feedback sent.');
        setShowRejectModal(false);
        fetchDashboardData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Query response workflow
  const submitQAAnswer = async (qId: string) => {
    if (!qaAnswerText.trim()) return;

    try {
      const res = await apiFetch(`/queries/${qId}/answer`, {
        method: 'POST',
        body: JSON.stringify({ answer: qaAnswerText })
      });
      if (res.ok) {
        alert('Answer posted successfully.');
        setRespondingQueryId(null);
        setQaAnswerText('');
        fetchDashboardData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const resetForm = () => {
    setNoticeId(null);
    setFormTitle('');
    setFormContent('');
    setFormSummary('');
    setFormCategory('General');
    setFormPriority('NORMAL');
    setFormDepartment('All');
    setFormAcademicYears([]);
    setFormTargetGroups([]);
    setFormPublishAt('');
    setFormExpiresAt('');
    setFormEventDate('');
    setFormVenue('');
    setFormRegistrationLink('');
    setAttachments([]);
    setFormTargetAudience('STUDENTS');
    setAiTopic('');
    setAiDescription('');
    setSafetyScore(null);
    setSafetyWarnings([]);
  };

  // SVG Chart Generators for Analytics
  const renderViewsLineChart = () => {
    if (!analyticsData?.charts?.viewsOverTime) return null;
    const data = analyticsData.charts.viewsOverTime;
    
    // Compile points
    const width = 500;
    const height = 150;
    const maxVal = Math.max(...data.map((d: any) => d.views)) || 100;
    
    const points = data.map((d: any, i: number) => {
      const x = (i / (data.length - 1)) * (width - 40) + 20;
      const y = height - ((d.views / maxVal) * (height - 40) + 20);
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <g className="text-slate-100">
          <line x1="20" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeDasharray="3" />
          <line x1="20" y1="75" x2="480" y2="75" stroke="#f1f5f9" strokeDasharray="3" />
          <line x1="20" y1="130" x2="480" y2="130" stroke="#f1f5f9" strokeDasharray="3" />
        </g>
        <polyline
          fill="none"
          stroke="#4f46e5"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        {data.map((d: any, i: number) => {
          const x = (i / (data.length - 1)) * (width - 40) + 20;
          const y = height - ((d.views / maxVal) * (height - 40) + 20);
          return (
            <g key={i} className="group cursor-pointer">
              <circle cx={x} cy={y} r="5" fill="#4f46e5" stroke="#ffffff" strokeWidth="2" />
              <text x={x} y={height - 5} textAnchor="middle" className="text-[10px] fill-slate-400 font-bold">{d.date}</text>
              <text x={x} y={y - 10} textAnchor="middle" className="text-[9px] fill-indigo-700 font-black opacity-0 group-hover:opacity-100 transition">{d.views}</text>
            </g>
          );
        })}
      </svg>
    );
  };

  const renderCategoryBarChart = () => {
    if (!analyticsData?.charts?.noticesByCategory) return null;
    const data = analyticsData.charts.noticesByCategory;

    const width = 500;
    const height = 150;
    const maxVal = Math.max(...data.map((d: any) => d.value)) || 5;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        {data.map((d: any, i: number) => {
          const barWidth = 30;
          const spacing = (width - 40) / data.length;
          const x = i * spacing + 30;
          const barHeight = (d.value / maxVal) * (height - 50);
          const y = height - barHeight - 25;

          return (
            <g key={i} className="group cursor-pointer">
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill="#3b82f6"
                rx="4"
                className="hover:fill-indigo-650 transition"
              />
              <text x={x + barWidth / 2} y={height - 8} textAnchor="middle" className="text-[9px] fill-slate-500 font-bold">{d.name}</text>
              <text x={x + barWidth / 2} y={y - 5} textAnchor="middle" className="text-[10px] fill-slate-800 font-black">{d.value}</text>
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Navbar Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-purple-600 rounded-lg text-white">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">DigiNotice</span>
            <span className="ml-1 text-xs font-semibold px-1.5 py-0.2 bg-purple-50 text-purple-700 rounded-full">Admin</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full uppercase">
            {user?.role.replace('_', ' ')}: {user?.department || 'System'}
          </span>
          <button 
            onClick={logout}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar Nav */}
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col p-4 shrink-0">
          <div className="space-y-1.5">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-3 ${activeTab === 'analytics' ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <BarChart2 className="w-5 h-5" />
              Dashboard Analytics
            </button>
            
            <button
              onClick={() => setActiveTab('notices')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-3 ${activeTab === 'notices' ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <FileText className="w-5 h-5" />
              Manage Notices
            </button>

            <button
              onClick={() => { resetForm(); setActiveTab('create'); }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-3 ${activeTab === 'create' ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <PlusCircle className="w-5 h-5" />
              Create Notice
            </button>

            <button
              onClick={() => setActiveTab('qa')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-3 ${activeTab === 'qa' ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <HelpCircle className="w-5 h-5" />
              Student Q&A Threads
            </button>

            {user?.role === 'DEPARTMENT_ADMIN' && (
              <button
                onClick={() => setActiveTab('facultyFeed')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-3 ${activeTab === 'facultyFeed' ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Award className="w-5 h-5" />
                Principal's Desk
              </button>
            )}

            {user?.role === 'SUPER_ADMIN' && (
              <button
                onClick={() => setActiveTab('superAdminFeed')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-3 ${activeTab === 'superAdminFeed' ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Users className="w-5 h-5" />
                HOD Communications
              </button>
            )}

            {/* Approvals tab (Super Admin only) */}
            {user?.role === 'SUPER_ADMIN' && (
              <button
                onClick={() => setActiveTab('approvals')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-3 ${activeTab === 'approvals' ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <CheckSquare className="w-5 h-5" />
                Notice Approvals
              </button>
            )}

            {/* Audit Logs tab (Super Admin only) */}
            {user?.role === 'SUPER_ADMIN' && (
              <button
                onClick={() => setActiveTab('logs')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-3 ${activeTab === 'logs' ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <FileLock className="w-5 h-5" />
                System Audit Logs
              </button>
            )}
          </div>
        </aside>

        {/* Dashboard Main Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
              <p className="text-slate-500 text-sm mt-3 font-semibold">Loading portal data...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: ANALYTICS */}
              {activeTab === 'analytics' && analyticsData && (
                <div className="space-y-6">
                  {/* Summary counts cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Total Notices</span>
                        <h4 className="text-2xl font-black text-slate-900 mt-1">{analyticsData.summary.totalNotices}</h4>
                      </div>
                      <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><FileText className="w-6 h-6" /></div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Active Notices</span>
                        <h4 className="text-2xl font-black text-slate-900 mt-1">{analyticsData.summary.activeNotices}</h4>
                      </div>
                      <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle className="w-6 h-6" /></div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Total Views</span>
                        <h4 className="text-2xl font-black text-slate-900 mt-1">{analyticsData.summary.totalViews}</h4>
                      </div>
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Eye className="w-6 h-6" /></div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Critical Ack Rate</span>
                        <h4 className="text-2xl font-black text-slate-900 mt-1">{analyticsData.charts.criticalAckRate}%</h4>
                      </div>
                      <div className="p-3 bg-red-50 text-red-600 rounded-xl"><AlertOctagon className="w-6 h-6" /></div>
                    </div>
                  </div>

                  {/* SVG Charts section */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm">
                      <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-purple-600" /> Notice views over time
                      </h4>
                      <div className="h-44 flex items-center justify-center bg-slate-50/50 p-2 rounded-xl border border-slate-100">
                        {renderViewsLineChart()}
                      </div>
                    </div>
                    <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm">
                      <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-blue-600" /> Notices by category
                      </h4>
                      <div className="h-44 flex items-center justify-center bg-slate-50/50 p-2 rounded-xl border border-slate-100">
                        {renderCategoryBarChart()}
                      </div>
                    </div>
                  </div>

                  {/* Top lists table */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm">
                      <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wider mb-4">🏆 Most Viewed Notices</h4>
                      <div className="space-y-2">
                        {analyticsData.charts.mostViewed.map((n: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-150 rounded-xl text-xs">
                            <span className="font-bold text-slate-800 truncate max-w-xs">{n.title}</span>
                            <span className="font-bold text-indigo-650 bg-indigo-50 px-2 py-0.5 rounded-full">{n.views} views</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm">
                      <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wider mb-4">📝 High Engagement Notices</h4>
                      <div className="space-y-2">
                        {analyticsData.charts.mostAcknowledged.map((n: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-150 rounded-xl text-xs">
                            <span className="font-bold text-slate-800 truncate max-w-xs">{n.title}</span>
                            <span className="font-bold text-emerald-650 bg-emerald-50 px-2 py-0.5 rounded-full">{n.acknowledgements} Acks</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: MANAGE NOTICES LIST */}
              {activeTab === 'notices' && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
                  <h3 className="font-extrabold text-lg text-slate-900 tracking-tight">Active Notices Dashboard</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider bg-slate-50">
                          <th className="py-3 px-4">Title</th>
                          <th className="py-3 px-4">Category</th>
                          <th className="py-3 px-4">Priority</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-center">Views</th>
                          <th className="py-3 px-4 text-center">Acks</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {notices.map((notice) => (
                          <tr key={notice._id} className="border-b border-slate-150 hover:bg-slate-50/50 transition">
                            <td className="py-3 px-4">
                              <div>
                                <span className="font-bold text-slate-800 block">{notice.title}</span>
                                <span className="text-[10px] text-slate-400 font-medium">By {notice.createdByName || 'Faculty'} &bull; Exp: {new Date(notice.expiresAt).toLocaleDateString()}</span>
                              </div>
                              {notice.rejectionReason && (
                                <div className="text-[10px] text-red-600 bg-red-50 p-1.5 rounded mt-1 max-w-md font-semibold">
                                  Rejection feedback: "{notice.rejectionReason}"
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4 font-bold text-slate-500">{notice.category}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${notice.priority === 'CRITICAL' ? 'bg-red-50 text-red-600 border border-red-200' : notice.priority === 'HIGH' ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-blue-50 text-blue-600 border border-blue-200'}`}>
                                {notice.priority}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${notice.status === 'Published' ? 'bg-emerald-50 text-emerald-700' : notice.status === 'Submitted' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                                {notice.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center font-bold text-slate-700">{notice.views}</td>
                            <td className="py-3 px-4 text-center font-bold text-slate-700">{notice.acknowledgements}</td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {user?.role === 'SUPER_ADMIN' && notice.status === 'Submitted' && (
                                  <>
                                    <button
                                      onClick={() => handleApprove(notice._id)}
                                      className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold shadow-sm transition"
                                      title="Approve"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => handleRejectClick(notice._id)}
                                      className="px-2 py-1 border border-red-200 hover:bg-red-50 text-red-650 rounded text-[10px] font-bold transition"
                                      title="Reject"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => handleEditNoticeClick(notice)}
                                  className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded transition"
                                  title="Edit"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(notice._id)}
                                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded transition"
                                  title="Delete"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: CREATE / EDIT NOTICE */}
              {activeTab === 'create' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left: Form Fields */}
                  <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-5">
                    <h3 className="font-extrabold text-lg text-slate-900 tracking-tight">
                      {noticeId ? '⚙️ Edit Announcement details' : '📝 Create Official Notice'}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Notice Title</label>
                        <input
                          type="text"
                          required
                          value={formTitle}
                          onChange={(e) => setFormTitle(e.target.value)}
                          placeholder="E.g. placement drive for CSE students"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-purple-500 focus:bg-white text-xs font-semibold rounded-xl focus:outline-none transition"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Detailed Description</label>
                        <textarea
                          rows={6}
                          required
                          value={formContent}
                          onChange={(e) => setFormContent(e.target.value)}
                          placeholder="Compose official notice text..."
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-purple-500 focus:bg-white text-xs font-semibold rounded-xl focus:outline-none transition"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
                        <select
                          value={formCategory}
                          onChange={(e) => setFormCategory(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-purple-500 focus:bg-white text-xs font-semibold rounded-xl focus:outline-none"
                        >
                          <option value="General">General</option>
                          <option value="Exams">Exams</option>
                          <option value="Placements">Placements</option>
                          <option value="Workshops">Workshops</option>
                          <option value="Sports">Sports</option>
                          <option value="Cultural">Cultural</option>
                          <option value="Emergency">Emergency</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Priority level</label>
                        <select
                          value={formPriority}
                          onChange={(e) => setFormPriority(e.target.value as any)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-purple-500 focus:bg-white text-xs font-semibold rounded-xl focus:outline-none"
                        >
                          <option value="NORMAL">NORMAL (Blue)</option>
                          <option value="HIGH">HIGH (Orange)</option>
                          <option value="CRITICAL">CRITICAL (Red - Safety Alert)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Target Audience</label>
                        <select
                          value={formTargetAudience}
                          onChange={(e) => setFormTargetAudience(e.target.value as any)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-purple-500 focus:bg-white text-xs font-semibold rounded-xl focus:outline-none"
                        >
                          <option value="STUDENTS">Students (General Flow)</option>
                          <option value="FACULTY">Faculty / HODs</option>
                          <option value="SUPER_ADMIN">Super Admin (Principal)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Target Department</label>
                        <select
                          value={formDepartment}
                          onChange={(e) => setFormDepartment(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-purple-500 focus:bg-white text-xs font-semibold rounded-xl focus:outline-none"
                        >
                          <option value="All">All Departments</option>
                          <option value="CSE">CSE</option>
                          <option value="CSM">CSM</option>
                          <option value="CSD">CSD</option>
                          <option value="ECE">ECE</option>
                          <option value="EEE">EEE</option>
                          <option value="Mech">Mech</option>
                          <option value="Civil">Civil</option>
                          <option value="IT">IT</option>
                          <option value="Robotics">Robotics</option>
                          <option value="Chemical Engineering">Chemical Engineering</option>
                          <option value="Cyber Security">Cyber Security</option>
                          <option value="Bio Technology">Bio Technology</option>
                          <option value="Aero Space">Aero Space</option>
                          <option value="Agricultural Engineering">Agricultural Engineering</option>
                          <option value="Mining Engineering">Mining Engineering</option>
                        </select>
                      </div>

                      {formTargetAudience === 'STUDENTS' && (
                        <>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Target Academic Years</label>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {['1st Year', '2nd Year', '3rd Year', '4th Year'].map((year) => (
                                <button
                                  key={year}
                                  type="button"
                                  onClick={() => handleYearToggle(year)}
                                  className={`text-[10px] font-bold px-2 py-1 rounded border transition ${formAcademicYears.includes(year) ? 'bg-purple-600 border-purple-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                                >
                                  {year}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Target Student Clubs (Optional)</label>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {['Coding Club', 'Sports Club', 'Placement Cell', 'Cultural Society'].map((club) => (
                                <button
                                  key={club}
                                  type="button"
                                  onClick={() => handleGroupToggle(club)}
                                  className={`text-[10px] font-bold px-2 py-1 rounded border transition ${formTargetGroups.includes(club) ? 'bg-purple-600 border-purple-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                                >
                                  {club}
                                </button>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Registration Link (URL)</label>
                        <input
                          type="url"
                          value={formRegistrationLink}
                          onChange={(e) => setFormRegistrationLink(e.target.value)}
                          placeholder="https://forms.college.edu/..."
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-purple-500 focus:bg-white text-xs font-semibold rounded-xl focus:outline-none transition"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Event Venue / Location</label>
                        <input
                          type="text"
                          value={formVenue}
                          onChange={(e) => setFormVenue(e.target.value)}
                          placeholder="E.g. Seminar Hall 2, Block A"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-purple-500 focus:bg-white text-xs font-semibold rounded-xl focus:outline-none transition"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Event Scheduled Date</label>
                        <input
                          type="datetime-local"
                          value={formEventDate}
                          onChange={(e) => setFormEventDate(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-purple-500 focus:bg-white text-xs font-semibold rounded-xl focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Publish Scheduled Date</label>
                        <input
                          type="datetime-local"
                          value={formPublishAt}
                          onChange={(e) => setFormPublishAt(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-purple-500 focus:bg-white text-xs font-semibold rounded-xl focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Expiry Date</label>
                        <input
                          type="datetime-local"
                          value={formExpiresAt}
                          onChange={(e) => setFormExpiresAt(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-purple-500 focus:bg-white text-xs font-semibold rounded-xl focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50"
                      >
                        Clear Form
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSubmitForm('Draft')}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                      >
                        Save Draft
                      </button>
                      {user?.role === 'SUPER_ADMIN' ? (
                        <button
                          type="button"
                          onClick={() => handleSubmitForm('Published')}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md transition"
                        >
                          Approve & Publish Immediately
                        </button>
                      ) : formTargetAudience === 'SUPER_ADMIN' ? (
                        <button
                          type="button"
                          onClick={() => handleSubmitForm('Published')}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-md transition"
                        >
                          Send to Principal
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSubmitForm('Submitted')}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md animate-pulse transition"
                        >
                          Submit for Approval
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Right: AI Assist Panel */}
                  <div className="space-y-6">
                    
                    {/* Generative AI notice generator box */}
                    <div className="bg-slate-950 text-white p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col space-y-4">
                      <h4 className="text-xs font-extrabold text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-purple-400 animate-spin-slow" />
                        AI Copilot Assistant
                      </h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                        Enter a short description or phrase below. The notice assistant will formulate a professional title, outline, target groups, and calendar structures.
                      </p>

                      <div className="space-y-3 pt-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Topic</label>
                          <input
                            type="text"
                            value={aiTopic}
                            onChange={(e) => setAiTopic(e.target.value)}
                            placeholder="E.g. Infosys hiringCSE 4th year August 25"
                            className="w-full bg-slate-900 border border-slate-800 text-white text-xs font-medium py-2 px-3 rounded-lg focus:outline-none focus:border-purple-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1">Additional description (optional)</label>
                          <textarea
                            rows={3}
                            value={aiDescription}
                            onChange={(e) => setAiDescription(e.target.value)}
                            placeholder="Additional details, eligibility rules, or coordination contacts..."
                            className="w-full bg-slate-900 border border-slate-800 text-white text-xs font-medium py-2 px-3 rounded-lg focus:outline-none focus:border-purple-500"
                          />
                        </div>

                        <button
                          type="button"
                          disabled={aiGenerating}
                          onClick={handleAIGenerate}
                          className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-650 hover:from-purple-500 hover:to-indigo-550 disabled:bg-slate-800 text-white text-xs font-extrabold rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition"
                        >
                          {aiGenerating ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Improving notice...
                            </>
                          ) : (
                            <>
                              ✨ Generate Notice with AI
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* AI Target Recommendations Panel */}
                    {(formTitle || formContent) && (
                      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4">
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1">
                          <Info className="w-4 h-4 text-purple-600" />
                          AI Target Recommendations
                        </h4>
                        
                        <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                          Based on notice content parsing, the AI recommends targeting the following filters:
                        </p>

                        <div className="space-y-3 pt-2 text-xs">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="font-bold text-slate-400">Department</span>
                            <span className="font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">{formDepartment}</span>
                          </div>
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="font-bold text-slate-400">Category</span>
                            <span className="font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{formCategory}</span>
                          </div>
                          <div className="flex flex-col gap-1.5 border-b border-slate-100 pb-2">
                            <span className="font-bold text-slate-400">Audience Years</span>
                            <div className="flex flex-wrap gap-1">
                              {formAcademicYears.map(y => (
                                <span key={y} className="font-extrabold text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded">{y}</span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRecommendTargets(formContent, formTitle)}
                          className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-600 transition"
                        >
                          🔄 Recalculate suggestions
                        </button>
                      </div>
                    )}

                    {/* AI Safety and Quality Checker panel */}
                    {(formTitle || formContent) && (
                      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                            Content Quality Safety
                          </h4>
                          {safetyScore !== null && (
                            <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${safetyScore >= 80 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                              Score: {safetyScore}%
                            </span>
                          )}
                        </div>

                        {safetyWarnings.length === 0 ? (
                          <div className="text-xs text-slate-550 flex items-center gap-1.5 p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="font-semibold text-emerald-800">Passes validation checks! Document is complete.</span>
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {safetyWarnings.map((warn, i) => (
                              <div key={i} className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-800 flex items-start gap-2 font-medium">
                                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                <div>{warn}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                </div>
              )}

              {/* TAB 4: APPROVALS (Super Admin only) */}
              {activeTab === 'approvals' && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
                  <h3 className="font-extrabold text-lg text-slate-900 tracking-tight">Notice Review & Approvals Queue</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider bg-slate-50">
                          <th className="py-3 px-4">Notice Title</th>
                          <th className="py-3 px-4">Category</th>
                          <th className="py-3 px-4">Created By</th>
                          <th className="py-3 px-4">Priority</th>
                          <th className="py-3 px-4 text-right">Review Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {notices
                          .filter(n => n.status === 'Submitted')
                          .map((notice) => (
                            <tr key={notice._id} className="border-b border-slate-150 hover:bg-slate-50/50 transition">
                              <td className="py-3 px-4">
                                <span className="font-bold text-slate-800 block">{notice.title}</span>
                                <span className="text-[10px] text-slate-400 font-medium">Drafted on {new Date(notice.publishAt).toLocaleDateString()}</span>
                              </td>
                              <td className="py-3 px-4 font-bold text-slate-500">{notice.category}</td>
                              <td className="py-3 px-4">
                                <span className="font-semibold text-slate-700">{notice.createdByName || 'Faculty'}</span>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${notice.priority === 'CRITICAL' ? 'bg-red-50 text-red-650 border border-red-200' : notice.priority === 'HIGH' ? 'bg-amber-50 text-amber-650' : 'bg-blue-50 text-blue-650'}`}>
                                  {notice.priority}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleApprove(notice._id)}
                                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-sm transition"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleRejectClick(notice._id)}
                                    className="px-3 py-1 border border-red-200 hover:bg-red-50 text-red-600 rounded-lg font-bold transition"
                                  >
                                    Reject
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        {notices.filter(n => n.status === 'Submitted').length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                              No notices currently in the review queue.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 5: SYSTEM AUDIT LOGS (Super Admin only) */}
              {activeTab === 'logs' && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
                  <h3 className="font-extrabold text-lg text-slate-900 tracking-tight">Administrative Action Log Trail</h3>
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {auditLogs.map((log) => (
                      <div key={log._id} className="p-3 bg-slate-50 border border-slate-150 rounded-xl text-xs flex items-start gap-3">
                        <span className="font-mono text-slate-400 text-[10px] shrink-0 mt-0.5">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        <div className="flex-1">
                          <span className="font-black text-slate-900">{log.userName}</span>
                          <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full font-bold ml-2 uppercase shrink-0">{log.userRole.replace('_', ' ')}</span>
                          <p className="mt-1 font-bold text-slate-650">
                            {log.action} {log.noticeTitle && <span className="text-indigo-650 font-black">"{log.noticeTitle}"</span>}
                          </p>
                        </div>
                      </div>
                    ))}
                    {auditLogs.length === 0 && (
                      <div className="py-8 text-center text-slate-400 font-medium">No audit activities logged yet.</div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB: STUDENT Q&A THREADS */}
              {activeTab === 'qa' && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-lg text-slate-900 tracking-tight">Student Q&A Threads</h3>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">
                        Answer queries posted by students on campus announcements.
                      </p>
                    </div>
                    <span className="text-xs bg-purple-50 text-purple-700 font-black px-2.5 py-1 rounded-full">
                      {queries.filter(q => q.status === 'Open').length} Open Questions
                    </span>
                  </div>

                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                    {queries.map((q) => (
                      <div key={q._id} className="p-4 border border-slate-250 bg-slate-50/50 hover:bg-slate-50 transition rounded-2xl text-xs space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">{q.studentName}</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                              Notice: {q.noticeTitle}
                            </span>
                          </div>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${q.status === 'Open' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                            {q.status}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <span className="block text-[10px] text-slate-400 font-bold uppercase">Question</span>
                          <p className="text-slate-850 font-bold text-[13px]">{q.question}</p>
                        </div>

                        {q.status === 'Answered' ? (
                          <div className="p-3 bg-emerald-50/50 border border-emerald-150 rounded-xl space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-emerald-800 font-black uppercase">Answered by {q.answeredByName}</span>
                              <span className="text-[9px] text-slate-400 font-semibold">{q.answeredAt ? new Date(q.answeredAt).toLocaleDateString() : ''}</span>
                            </div>
                            <p className="text-slate-700 font-semibold">{q.answer}</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <span className="block text-[10px] text-slate-400 font-bold uppercase">Respond to this question</span>
                            {respondingQueryId === q._id ? (
                              <div className="flex items-end gap-2">
                                <textarea
                                  value={qaAnswerText}
                                  onChange={(e) => setQaAnswerText(e.target.value)}
                                  placeholder="Type your response here..."
                                  className="flex-1 min-h-[70px] p-2.5 bg-white border border-slate-200 focus:border-purple-500 rounded-xl text-xs font-semibold focus:outline-none"
                                />
                                <div className="flex flex-col gap-1 shrink-0">
                                  <button
                                    onClick={() => submitQAAnswer(q._id)}
                                    className="px-3.5 py-2 bg-purple-650 hover:bg-purple-700 text-white rounded-xl text-[10px] font-black uppercase transition"
                                  >
                                    Submit
                                  </button>
                                  <button
                                    onClick={() => { setRespondingQueryId(null); setQaAnswerText(''); }}
                                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-[10px] font-bold uppercase transition"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => { setRespondingQueryId(q._id); setQaAnswerText(''); }}
                                className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-[10px] font-black uppercase transition"
                              >
                                Answer Question
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}

                    {queries.length === 0 && (
                      <div className="py-12 text-center text-slate-400 font-medium">
                        No student questions have been posted on notices yet.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB: PRINCIPAL'S DESK (Faculty Announcements) */}
              {activeTab === 'facultyFeed' && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900 tracking-tight">Principal's Desk</h3>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">
                      Announcements and directives sent by the Principal to the faculty members.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {notices
                      .filter(n => n.targetAudience === 'FACULTY' && n.status === 'Published')
                      .map((notice) => (
                        <div key={notice._id} className="p-5 border border-slate-200 bg-slate-50/55 hover:bg-slate-50 transition rounded-2xl flex flex-col justify-between space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] bg-purple-100 text-purple-800 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                Faculty Announcement
                              </span>
                              <span className="text-[10px] text-slate-400 font-semibold">
                                {new Date(notice.publishAt).toLocaleDateString()}
                              </span>
                            </div>
                            <h4 className="text-[15px] font-black text-slate-800 tracking-tight leading-snug">
                              {notice.title}
                            </h4>
                            <p className="text-xs text-slate-650 leading-relaxed whitespace-pre-line font-medium">
                              {notice.content}
                            </p>
                          </div>
                          <div className="border-t border-slate-200 pt-3 flex items-center gap-2">
                            <div className="w-6.5 h-6.5 rounded-full bg-purple-600 flex items-center justify-center text-white text-[9px] font-black uppercase shrink-0">
                              P
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-slate-700 block">{notice.createdByName}</span>
                              <span className="text-[9px] text-slate-450 block font-semibold">Principal & College Administrator</span>
                            </div>
                          </div>
                        </div>
                      ))}

                    {notices.filter(n => n.targetAudience === 'FACULTY' && n.status === 'Published').length === 0 && (
                      <div className="col-span-full py-12 text-center text-slate-400 font-medium bg-slate-50 rounded-2xl border border-slate-200 border-dashed animate-pulse">
                        No official announcements from the Principal's Desk yet.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB: HOD COMMUNICATIONS (For Principal / SUPER_ADMIN) */}
              {activeTab === 'superAdminFeed' && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900 tracking-tight">HOD Communications Inbox</h3>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">
                      Reports and administrative submissions sent by HODs and faculty to the Principal's desk.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {notices
                      .filter(n => n.targetAudience === 'SUPER_ADMIN')
                      .map((notice) => (
                        <div key={notice._id} className="p-5 border border-slate-200 bg-slate-50/55 hover:bg-slate-50 transition rounded-2xl flex flex-col justify-between space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] bg-indigo-100 text-indigo-800 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                {notice.createdByDepartment} Submission
                              </span>
                              <span className="text-[10px] text-slate-400 font-semibold">
                                {new Date(notice.publishAt).toLocaleDateString()}
                              </span>
                            </div>
                            <h4 className="text-[15px] font-black text-slate-800 tracking-tight leading-snug">
                              {notice.title}
                            </h4>
                            <p className="text-xs text-slate-650 leading-relaxed whitespace-pre-line font-medium">
                              {notice.content}
                            </p>
                          </div>
                          <div className="border-t border-slate-200 pt-3 flex items-center gap-2">
                            <div className="w-6.5 h-6.5 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[9px] font-black uppercase shrink-0">
                              {notice.createdByDepartment?.slice(0, 2)}
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-slate-700 block">{notice.createdByName}</span>
                              <span className="text-[9px] text-slate-450 block font-semibold">Head of Department, {notice.createdByDepartment}</span>
                            </div>
                          </div>
                        </div>
                      ))}

                    {notices.filter(n => n.targetAudience === 'SUPER_ADMIN').length === 0 && (
                      <div className="col-span-full py-12 text-center text-slate-400 font-medium bg-slate-50 rounded-2xl border border-slate-200 border-dashed animate-pulse">
                        No HOD reports or communications received yet.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

        </main>
      </div>

      {/* Emergency Broadcast Confirmation Modal */}
      {showEmergencyConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white max-w-md w-full p-6 rounded-2xl border border-red-200 shadow-2xl space-y-4 text-center">
            <div className="p-4 bg-red-50 border border-red-200 rounded-full w-fit mx-auto text-red-600 animate-bounce">
              <AlertOctagon className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-red-800 tracking-tight">🚨 Confirm Critical Emergency Broadcast?</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              You are about to publish a **CRITICAL** notice. This notice will be highlighted in red at the top of every target student dashboard and will require them to manually press an acknowledgement button before proceeding. 
            </p>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-mono text-left max-h-36 overflow-y-auto">
              <strong>Title:</strong> {pendingEmergencyNoticeData?.payload?.title} <br />
              <strong>Department:</strong> {pendingEmergencyNoticeData?.payload?.department || 'All'} <br />
              <strong>Academic Years:</strong> {pendingEmergencyNoticeData?.payload?.academicYears?.join(', ') || 'All'}
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowEmergencyConfirm(false)}
                className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmEmergencyPublish}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-md"
              >
                Yes, Publish Broadcast
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notice Rejection Comment Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white max-w-md w-full p-6 rounded-2xl border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-slate-900 tracking-tight">Reject notice & provide comments</h3>
            <p className="text-xs text-slate-500">
              Provide feedback to the department admin detailing why the notice was rejected. This reason will display on their dashboard to help them revise it.
            </p>
            <textarea
              rows={4}
              required
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="E.g., missing registration deadline or contains typos. Please fix grammar before resubmitting."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-red-500 focus:bg-white text-xs font-semibold rounded-xl focus:outline-none transition"
            />
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition"
              >
                Close
              </button>
              <button
                onClick={submitRejection}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition"
              >
                Reject Notice
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
