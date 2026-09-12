import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { API_URL } from '../config/api';
import { GraduationCap, ArrowRight, Lock, Mail, Loader2, Eye, EyeOff, CheckCircle2, KeyRound } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [resendStatus, setResendStatus] = useState('');

  const isJustRegistered = searchParams.get('registered') === 'true';
  const paramEmail = searchParams.get('email');

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (paramEmail) {
      setEmail(paramEmail);
    } else if (roleParam === 'admin' || roleParam === 'superadmin') {
      setEmail('superadmin@college.edu');
      setPassword('admin123');
    } else if (roleParam === 'student') {
      setEmail('student1@college.edu');
      setPassword('password123');
    }
  }, [paramEmail, searchParams]);

  const handleResendLink = async () => {
    const targetEmail = unverifiedEmail || email;
    if (!targetEmail) return;

    setResendStatus('Sending fresh activation link...');
    try {
      const res = await fetch(`${API_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setResendStatus('✅ Fresh activation link sent! Please check your email.');
      } else {
        setResendStatus(`⚠️ ${data.message || 'Failed to resend activation link.'}`);
      }
    } catch {
      setResendStatus('⚠️ Network error resending link.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setAuthLoading(true);
    setError('');
    setUnverifiedEmail('');
    setResendStatus('');

    try {
      const loggedUser = await login(email, password);
      // Redirect based on user role
      if (loggedUser.role === 'SUPER_ADMIN') {
        navigate('/super-admin/dashboard');
      } else if (loggedUser.role === 'DEPARTMENT_ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
      if (err.message && err.message.includes('not activated yet')) {
        setUnverifiedEmail(email);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-6 bg-white p-5 sm:p-8 rounded-2xl shadow-xl border border-slate-200">
        
        {/* Branding header */}
        <div className="flex flex-col items-center text-center">
          <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-md shadow-indigo-200 mb-3">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            DigiNotice <span className="text-indigo-600">AI</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Smart Digital Notice Board for College Campuses
          </p>
        </div>

        {/* Tab Switcher: Sign In vs Sign Up */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-bold">
          <div className="py-2.5 text-center bg-white text-indigo-600 rounded-lg shadow-sm font-extrabold flex items-center justify-center">
            Sign In
          </div>
          <Link
            to={searchParams.get('role') ? `/register?role=${encodeURIComponent(searchParams.get('role')!)}` : '/register'}
            className="py-2.5 text-center text-slate-600 hover:text-slate-900 rounded-lg transition flex items-center justify-center"
          >
            Sign Up
          </Link>
        </div>

        {isJustRegistered && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Account created successfully! Please sign in with your credentials.</span>
          </div>
        )}

        {error && (
          <div className="space-y-2">
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-xl flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
            {unverifiedEmail && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleResendLink}
                  className="w-full py-2.5 px-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 rounded-xl text-xs font-bold transition text-center flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>📩 Resend Email Activation Link</span>
                </button>
              </div>
            )}
            {resendStatus && (
              <p className="text-xs text-indigo-600 font-bold text-center bg-indigo-50 p-2 rounded-lg border border-indigo-100">
                {resendStatus}
              </p>
            )}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="email">
              College Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@college.edu"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl text-slate-900 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl text-slate-900 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-400 font-normal">Trouble signing in?</span>
            <Link
              to={email ? `/forgot-password?email=${encodeURIComponent(email)}` : '/forgot-password'}
              className="font-bold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1.5 hover:underline"
            >
              <KeyRound className="w-3.5 h-3.5" /> Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={authLoading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-100 hover:shadow-indigo-500/10 flex items-center justify-center gap-2 transition"
          >
            {authLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
              </>
            ) : (
              <>
                Sign In <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 space-y-1.5">
          <p className="text-xs text-slate-500">
            Forgot your password?{' '}
            <Link 
              to={email ? `/forgot-password?email=${encodeURIComponent(email)}` : '/forgot-password'}
              className="font-bold text-indigo-600 hover:text-indigo-800"
            >
              Reset with Email Code
            </Link>
          </p>
          <p className="text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-800">
              Sign Up here
            </Link>
          </p>
        </div>

        {/* Quick Demo Access Buttons */}
        <div className="pt-3 border-t border-slate-100">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>⚡ Quick Demo Credentials</span>
            <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-bold">1-Click Fill</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => { setEmail('superadmin@college.edu'); setPassword('admin123'); setError(''); }}
              className="p-2 border border-purple-200 bg-purple-50/60 hover:bg-purple-100/70 rounded-xl text-left transition"
            >
              <span className="block text-[11px] font-extrabold text-purple-950">Super Admin</span>
              <span className="block text-[9px] text-purple-700 font-semibold truncate">Dr. Alok Verma</span>
            </button>
            <button
              type="button"
              onClick={() => { setEmail('cse.faculty@college.edu'); setPassword('admin123'); setError(''); }}
              className="p-2 border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100/70 rounded-xl text-left transition"
            >
              <span className="block text-[11px] font-extrabold text-indigo-950">CSE HOD</span>
              <span className="block text-[9px] text-indigo-700 font-semibold truncate">Prof. Ramesh</span>
            </button>
            <button
              type="button"
              onClick={() => { setEmail('student1@college.edu'); setPassword('password123'); setError(''); }}
              className="p-2 border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70 rounded-xl text-left transition"
            >
              <span className="block text-[11px] font-extrabold text-emerald-950">Student</span>
              <span className="block text-[9px] text-emerald-700 font-semibold truncate">Abhinav Sharma</span>
            </button>
          </div>
        </div>
        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-slate-200 w-full" />
          <span className="absolute bg-white px-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
            Or connect with SSO
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => alert('Google Workspace login configured. Will link with college domain.')}
            className="py-2.5 px-3 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5.04c1.67 0 3.19.57 4.38 1.69l3.27-3.27C17.67 1.61 14.98 1 12 1 7.35 1 3.4 3.65 1.49 7.54l3.85 2.99C6.26 7.42 8.91 5.04 12 5.04z" />
              <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.76 2.91c2.2-2.03 3.67-5.01 3.67-8.64z" />
              <path fill="#FBBC05" d="M5.34 14.53c-.24-.72-.38-1.49-.38-2.28s.14-1.56.38-2.28L1.49 6.98C.54 8.89 0 11.02 0 13.25c0 2.23.54 4.36 1.49 6.27l3.85-2.99z" />
              <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.76-2.91c-1.11.75-2.53 1.19-4.2 1.19-3.09 0-5.74-2.38-6.66-5.49L1.49 15.87C3.4 19.76 7.35 23 12 23z" />
            </svg>
            Google Workspace
          </button>
          <button
            type="button"
            onClick={() => alert('Microsoft 365 login configured. Will link with student email registry.')}
            className="py-2.5 px-3 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
          >
            <svg className="w-4 h-4" viewBox="0 0 23 23" fill="none">
              <path d="M0 0h11v11H0z" fill="#F25022"/>
              <path d="M12 0h11v11H12z" fill="#7FBA00"/>
              <path d="M0 12h11v11H0z" fill="#00A4EF"/>
              <path d="M12 12h11v11H12z" fill="#FFB900"/>
            </svg>
            Microsoft 365
          </button>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
