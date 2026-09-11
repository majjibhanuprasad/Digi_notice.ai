import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  GraduationCap, 
  ArrowRight, 
  ArrowLeft, 
  Lock, 
  Mail, 
  KeyRound, 
  Loader2, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Send, 
  RotateCcw,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Multi-step states: 'REQUEST_CODE' | 'ENTER_CODE_AND_PASSWORD' | 'SUCCESS'
  const [step, setStep] = useState<'REQUEST_CODE' | 'ENTER_CODE_AND_PASSWORD' | 'SUCCESS'>('REQUEST_CODE');

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  // Fallback info for development / preview if SMTP encounters issues
  const [devCode, setDevCode] = useState('');
  const [etherealUrl, setEtherealUrl] = useState('');

  // Pre-fill email from query param if available
  useEffect(() => {
    const paramEmail = searchParams.get('email');
    if (paramEmail) {
      setEmail(paramEmail);
    }
  }, [searchParams]);

  // Step 1: Send verification code to user's email
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your college email address.');
      return;
    }

    setLoading(true);
    setError('');
    setInfoMessage('');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to send verification code.');
      }

      setInfoMessage(data.message || 'Verification code sent to your email.');
      if (data.devCode) setDevCode(data.devCode);
      if (data.etherealUrl) setEtherealUrl(data.etherealUrl);

      setStep('ENTER_CODE_AND_PASSWORD');
    } catch (err: any) {
      setError(err.message || 'Error requesting password reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend code action
  const handleResendCode = async () => {
    if (!email.trim() || resending) return;

    setResending(true);
    setError('');
    setInfoMessage('');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to resend verification code.');
      }

      setInfoMessage('Fresh verification code sent! Please check your email.');
      if (data.devCode) setDevCode(data.devCode);
      if (data.etherealUrl) setEtherealUrl(data.etherealUrl);
    } catch (err: any) {
      setError(err.message || 'Could not resend code.');
    } finally {
      setResending(false);
    }
  };

  // Step 2: Verify code & reset password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      setError('Please enter the 6-digit verification code sent to your email.');
      return;
    }

    if (!newPassword) {
      setError('Please enter a new password.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          code: code.trim(),
          newPassword
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to reset password.');
      }

      setStep('SUCCESS');
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please check your code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full bg-white p-5 sm:p-8 rounded-2xl shadow-xl border border-slate-200 space-y-6">
        
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center">
          <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-md shadow-indigo-200 mb-3">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            DigiNotice <span className="text-indigo-600">AI</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Account Security & Password Recovery
          </p>
        </div>

        {/* STEP 1: Enter Email to Receive Code */}
        {step === 'REQUEST_CODE' && (
          <div className="space-y-5">
            <div className="text-center space-y-1">
              <h3 className="text-xl font-bold text-slate-900">Forgot Password?</h3>
              <p className="text-xs text-slate-600">
                Enter your registered college email and we will send you a 6-digit verification code to reset your password.
              </p>
            </div>

            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRequestCode} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="email">
                  College Email Address
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-100 hover:shadow-indigo-500/10 flex items-center justify-center gap-2 transition"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Sending Code...
                  </>
                ) : (
                  <>
                    Send Verification Code <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <Link
                to="/login"
                className="font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
              <Link
                to="/register"
                className="font-bold text-indigo-600 hover:text-indigo-800 transition"
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}

        {/* STEP 2: Enter 6-Digit Code & Set New Password */}
        {step === 'ENTER_CODE_AND_PASSWORD' && (
          <div className="space-y-5">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center justify-center p-2.5 bg-indigo-50 rounded-xl text-indigo-600 mb-1">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Enter Verification Code</h3>
              <p className="text-xs text-slate-600">
                A 6-digit code was sent to <strong className="text-indigo-600">{email}</strong>
              </p>
            </div>

            {infoMessage && (
              <div className="p-3 bg-indigo-50/80 border border-indigo-200 text-indigo-900 text-xs font-medium rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>{infoMessage}</span>
              </div>
            )}

            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Dev Fallback Helper */}
            {devCode && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between">
                <span>⚡ Dev Preview Code: <strong>{devCode}</strong></span>
                <button
                  type="button"
                  onClick={() => setCode(devCode)}
                  className="text-[11px] font-bold bg-amber-200 hover:bg-amber-300 text-amber-900 px-2 py-0.5 rounded transition"
                >
                  Auto Fill
                </button>
              </div>
            )}

            {etherealUrl && (
              <div className="text-center">
                <a
                  href={etherealUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-indigo-600 hover:underline font-semibold"
                >
                  📨 View Ethereal Email Preview
                </a>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              {/* 6-Digit Code */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="code">
                  6-Digit Verification Code
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    id="code"
                    type="text"
                    required
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 482910"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl text-slate-900 text-base font-mono tracking-widest text-center transition focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="newPassword">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
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

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="confirmPassword">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl text-slate-900 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-100 hover:shadow-indigo-500/10 flex items-center justify-center gap-2 transition"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Resetting Password...
                  </>
                ) : (
                  <>
                    Set New Password <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setStep('REQUEST_CODE')}
                className="font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Change Email
              </button>

              <button
                type="button"
                onClick={handleResendCode}
                disabled={resending}
                className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition disabled:opacity-50"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                {resending ? 'Sending...' : 'Resend Code'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Success Screen */}
        {step === 'SUCCESS' && (
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <ShieldCheck className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-extrabold text-slate-900">Password Reset Successful! 🎉</h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                Your DigiNotice AI account password has been updated. You can now sign in with your new password.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate(`/login?email=${encodeURIComponent(email)}`)}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 transition"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ForgotPasswordPage;
