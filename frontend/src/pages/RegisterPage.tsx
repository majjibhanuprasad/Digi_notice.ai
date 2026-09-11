import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  GraduationCap, 
  ArrowRight, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Building2, 
  Calendar, 
  Eye, 
  EyeOff, 
  Loader2,
  ShieldCheck,
  UserCheck,
  Award,
  CheckCircle2,
  Send
} from 'lucide-react';

const DEPARTMENTS = [
  { code: 'CSE', name: 'Computer Science & Engineering' },
  { code: 'CSM', name: 'CSE (AI & Machine Learning)' },
  { code: 'CSD', name: 'CSE (Data Science)' },
  { code: 'ECE', name: 'Electronics & Communication Engg' },
  { code: 'EEE', name: 'Electrical & Electronics Engg' },
  { code: 'IT', name: 'Information Technology' },
  { code: 'Mech', name: 'Mechanical Engineering' },
  { code: 'Civil', name: 'Civil Engineering' },
  { code: 'Robotics', name: 'Robotics & Automation' },
  { code: 'Chemical', name: 'Chemical Engineering' },
  { code: 'Cyber Security', name: 'Cyber Security' },
  { code: 'Biotech', name: 'Biotechnology' },
  { code: 'Aerospace', name: 'Aerospace Engineering' },
  { code: 'Agri', name: 'Agricultural Engineering' },
  { code: 'Mining', name: 'Mining Engineering' }
];

const ACADEMIC_YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

const RegisterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'STUDENT' | 'DEPARTMENT_ADMIN' | 'SUPER_ADMIN'>('STUDENT');
  const [department, setDepartment] = useState('CSE');
  const [academicYear, setAcademicYear] = useState('3rd Year');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const roleParam = searchParams.get('role')?.toLowerCase();
    if (roleParam === 'faculty' || roleParam === 'admin' || roleParam === 'hod' || roleParam === 'department_admin') {
      setRole('DEPARTMENT_ADMIN');
    } else if (roleParam === 'superadmin' || roleParam === 'super_admin') {
      setRole('SUPER_ADMIN');
    } else if (roleParam === 'student') {
      setRole('STUDENT');
    }
  }, [searchParams]);

  const [error, setError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Verification link state
  const [registeredSuccess, setRegisteredSuccess] = useState(false);
  const [activationUrl, setActivationUrl] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendError, setResendError] = useState('');

  const handleResendLink = async () => {
    setResendLoading(true);
    setResendMessage('');
    setResendError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to resend activation link.');
      }
      setResendMessage('A fresh activation link has been sent to your email!');
      if (data.activationUrl) {
        setActivationUrl(data.activationUrl);
      }
    } catch (err: any) {
      setResendError(err.message || 'Failed to resend activation link.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setAuthLoading(true);
    setError('');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
          department: role === 'SUPER_ADMIN' ? 'General Administration' : department,
          academicYear: role === 'STUDENT' ? academicYear : null,
          clubs: role === 'STUDENT' ? ['Technical Society', 'Coding Club'] : []
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Registration failed.');
      }

      setRegisteredSuccess(true);
      if (data.activationUrl) {
        setActivationUrl(data.activationUrl);
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-lg w-full bg-white p-5 sm:p-8 rounded-2xl shadow-xl border border-slate-200 space-y-5 sm:space-y-6">
        
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center">
          <div className="p-2.5 sm:p-3 bg-indigo-600 rounded-2xl text-white shadow-md shadow-indigo-200 mb-3">
            <GraduationCap className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            DigiNotice <span className="text-indigo-600">AI</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Create your account to access personalized campus announcements
          </p>
        </div>

        {/* Success / Check Email Activation Screen */}
        {registeredSuccess ? (
          <div className="space-y-6 text-center py-4">
            
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto text-indigo-600 shadow-sm">
              <Mail className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-extrabold text-slate-900">Check Your Email 📩</h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                We have sent an activation link to <strong className="text-indigo-600 font-semibold">{email}</strong>.
              </p>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 text-left font-medium leading-relaxed">
                ℹ️ <strong>Account Activation Notice:</strong> Your account will only be created and activated once you click the link inside your email.
              </div>
            </div>

            {resendMessage && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{resendMessage}</span>
              </div>
            )}

            {resendError && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-2">
                <span>⚠️</span>
                <span>{resendError}</span>
              </div>
            )}

            {/* Direct Activation Link for Local Dev / Instant Access */}
            {activationUrl && (
              <div className="p-4 bg-indigo-50/90 border border-indigo-200 rounded-2xl text-left space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                    ⚡ Direct Activation Link (Local Dev)
                  </span>
                  <span className="text-[10px] bg-indigo-200 text-indigo-800 font-bold px-2 py-0.5 rounded-full">
                    Instant Link
                  </span>
                </div>

                <p className="text-xs text-indigo-800 leading-relaxed">
                  Click the button below to verify your email and activate your account immediately:
                </p>

                <a
                  href={activationUrl}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition shadow-md hover:shadow-indigo-500/20 text-center"
                >
                  <span>Verify Email & Activate Account</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            )}

            <div className="pt-2 space-y-3">
              <button
                type="button"
                onClick={handleResendLink}
                disabled={resendLoading}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{resendLoading ? 'Resending Link...' : 'Resend Activation Link'}</span>
              </button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  Already verified? Proceed to Sign In &rarr;
                </Link>
              </div>
            </div>

          </div>
        ) : (
          <>
            {/* Tab Switcher: Sign In vs Sign Up */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-bold">
              <Link
                to={role === 'DEPARTMENT_ADMIN' || role === 'SUPER_ADMIN' ? '/login?role=admin' : '/login?role=student'}
                className="py-2.5 text-center text-slate-600 hover:text-slate-900 rounded-lg transition flex items-center justify-center"
              >
                Sign In
              </Link>
              <div className="py-2.5 text-center bg-white text-indigo-600 rounded-lg shadow-sm font-extrabold flex items-center justify-center">
                Sign Up
              </div>
            </div>

            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl font-medium flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Account Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('STUDENT')}
                    className={`p-3 rounded-xl border text-left transition flex flex-col items-center text-center gap-1.5 ${
                      role === 'STUDENT'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                    }`}
                  >
                    <UserCheck className={`w-5 h-5 ${role === 'STUDENT' ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span className="text-xs font-bold">Student</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('DEPARTMENT_ADMIN')}
                    className={`p-3 rounded-xl border text-left transition flex flex-col items-center text-center gap-1.5 ${
                      role === 'DEPARTMENT_ADMIN'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                    }`}
                  >
                    <Award className={`w-5 h-5 ${role === 'DEPARTMENT_ADMIN' ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span className="text-xs font-bold">Faculty / HOD</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('SUPER_ADMIN')}
                    className={`p-3 rounded-xl border text-left transition flex flex-col items-center text-center gap-1.5 ${
                      role === 'SUPER_ADMIN'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                    }`}
                  >
                    <ShieldCheck className={`w-5 h-5 ${role === 'SUPER_ADMIN' ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span className="text-xs font-bold">Super Admin</span>
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="name">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ananya Sharma"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl text-slate-900 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              {/* Email */}
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

              {/* Department & Academic Year Row */}
              {role !== 'SUPER_ADMIN' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="department">
                      Department
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                      <select
                        id="department"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl text-slate-900 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-indigo-100 appearance-none"
                      >
                        {DEPARTMENTS.map((dept) => (
                          <option key={dept.code} value={dept.code}>
                            {dept.code} - {dept.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {role === 'STUDENT' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="academicYear">
                        Academic Year
                      </label>
                      <div className="relative">
                        <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                        <select
                          id="academicYear"
                          value={academicYear}
                          onChange={(e) => setAcademicYear(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl text-slate-900 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-indigo-100 appearance-none"
                        >
                          {ACADEMIC_YEARS.map((yr) => (
                            <option key={yr} value={yr}>
                              {yr}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Password */}
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
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl text-slate-900 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              {/* Terms indicator */}
              <div className="flex items-center gap-2 pt-1 text-xs text-slate-500">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>By registering, an activation link will be sent to your email.</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-100 hover:shadow-indigo-500/10 flex items-center justify-center gap-2 transition"
              >
                {authLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Creating Account...
                  </>
                ) : (
                  <>
                    Create Account & Send Link <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Already have an account?{' '}
                <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-800">
                  Sign In here
                </Link>
              </p>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default RegisterPage;
