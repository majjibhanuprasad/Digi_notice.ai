import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { GraduationCap, CheckCircle2, AlertCircle, ArrowRight, Loader2, RefreshCw, Mail, ExternalLink } from 'lucide-react';
import { API_URL } from '../config/api';

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const token = searchParams.get('token');
  const initialEmail = searchParams.get('email') || '';

  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(!!token);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState('');
  const [newActivationUrl, setNewActivationUrl] = useState('');

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const doVerifyToken = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/verify-email?token=${encodeURIComponent(token)}`);
        const data = await res.json();

        if (res.ok) {
          setSuccess(true);
          if (data.email) setEmail(data.email);
        } else {
          setErrorMsg(data.message || 'Activation link is invalid or has expired.');
        }
      } catch {
        setErrorMsg('Could not connect to server to verify account.');
      } finally {
        setLoading(false);
      }
    };

    doVerifyToken();
  }, [token]);

  const handleResendLink = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!email.trim()) {
      setErrorMsg('Please enter your registered college email address.');
      return;
    }

    setResending(true);
    setResendMsg('');
    setErrorMsg('');
    setNewActivationUrl('');

    try {
      const res = await fetch(`${API_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        setResendMsg('A fresh activation link has been sent to your email!');
        if (data.activationUrl) {
          setNewActivationUrl(data.activationUrl);
        }
      } else {
        setErrorMsg(data.message || 'Failed to resend activation link.');
      }
    } catch {
      setErrorMsg('Network error resending activation link.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full bg-white p-5 sm:p-8 rounded-2xl shadow-xl border border-slate-200 text-center space-y-6">
        
        {/* Branding */}
        <div className="flex flex-col items-center">
          <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-md shadow-indigo-200 mb-3">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            DigiNotice <span className="text-indigo-600">AI</span>
          </h2>
        </div>

        {/* Token Verification Loading State */}
        {loading && (
          <div className="py-8 space-y-4">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-700">Verifying activation link & creating account...</p>
            <p className="text-xs text-slate-400">Please wait a moment while your profile is activated.</p>
          </div>
        )}

        {/* Success State */}
        {!loading && success && (
          <div className="space-y-6 py-2">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">Email Verified & Account Created! 🎉</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Your account details have been saved and your profile is now active. You can now sign in with your credentials.
              </p>
            </div>

            <button
              onClick={() => navigate(`/login?verified=true${email ? `&email=${encodeURIComponent(email)}` : ''}`)}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 transition"
            >
              Sign In Now <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Invalid Token / Resend Link State */}
        {!loading && !success && (
          <div className="space-y-6 py-2 text-left">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto text-amber-600 shadow-sm mb-3">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">Account Activation</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {errorMsg ? errorMsg : 'Please check your email and click the activation link to complete your registration.'}
              </p>
            </div>

            {errorMsg && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {resendMsg && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{resendMsg}</span>
              </div>
            )}

            {/* Form to Resend Activation Link */}
            <form onSubmit={handleResendLink} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="verify-email-input">
                  Your College Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    id="verify-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@college.edu"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl text-slate-900 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={resending}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 transition"
              >
                {resending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Sending Link...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" /> Send Fresh Activation Link
                  </>
                )}
              </button>
            </form>

            {/* Direct Activation Link if available */}
            {newActivationUrl && (
              <div className="p-4 bg-indigo-50/90 border border-indigo-200 rounded-2xl text-left space-y-2.5 shadow-sm">
                <span className="text-xs font-extrabold text-indigo-950 uppercase tracking-wider block">
                  ⚡ Direct Activation Link (Local Dev)
                </span>
                <p className="text-xs text-indigo-800">
                  Click the link below to activate your account immediately:
                </p>
                <a
                  href={newActivationUrl}
                  className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition text-center shadow-xs"
                >
                  <span>Activate Account Directly</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            <div className="pt-2 text-center border-t border-slate-100">
              <Link
                to="/login"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default VerifyEmailPage;
