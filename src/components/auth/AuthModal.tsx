import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  KeyRound,
  RotateCw,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useTheme, AccentColor } from '../../context/ThemeContext.js';

const COUNTRY_CODES = [
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+1', country: 'United States / Canada', flag: '🇺🇸' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+971', country: 'United Arab Emirates', flag: '🇦🇪' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
];

const ACCENT_BTN_CLASSES: Record<AccentColor, string> = {
  indigo: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20',
  blue: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20',
  emerald: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20',
  violet: 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-600/20',
  slate: 'bg-slate-800 hover:bg-slate-900 text-white shadow-slate-800/20',
};

const ACCENT_TEXT_CLASSES: Record<AccentColor, string> = {
  indigo: 'text-indigo-600 dark:text-indigo-400',
  blue: 'text-blue-600 dark:text-blue-400',
  emerald: 'text-emerald-600 dark:text-emerald-400',
  violet: 'text-violet-600 dark:text-violet-400',
  slate: 'text-slate-800 dark:text-slate-200',
};

export function AuthModal() {
  const {
    isAuthModalOpen,
    authModalMode,
    openAuthModal,
    closeAuthModal,
    signInWithGoogle,
    signUpWithEmail,
    signInWithEmail,
    sendPhoneOtp,
    verifyPhoneOtp,
    resendPhoneOtp,
    resetPassword,
    otpSent,
    otpCountdown,
    phoneTarget,
    authError,
    clearAuthError,
  } = useAuth();

  const { accentColor } = useTheme();
  const accentBtnClass = ACCENT_BTN_CLASSES[accentColor] || ACCENT_BTN_CLASSES.indigo;
  const accentTextClass = ACCENT_TEXT_CLASSES[accentColor] || ACCENT_TEXT_CLASSES.indigo;

  // Active method sub-tab in Login/Register ('email' | 'phone')
  const [activeMethod, setActiveMethod] = useState<'email' | 'phone'>('email');

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Phone State
  const [selectedCountryCode, setSelectedCountryCode] = useState('+91');
  const [rawPhoneNumber, setRawPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');

  // Processing state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localValidationErr, setLocalValidationErr] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const currentError = localValidationErr || authError;

  const resetFormState = () => {
    setFullName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setRawPhoneNumber('');
    setOtpCode('');
    setLocalValidationErr(null);
    clearAuthError();
  };

  const handleGoogleAuth = async () => {
    setIsSubmitting(true);
    setLocalValidationErr(null);
    try {
      await signInWithGoogle();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalValidationErr(null);

    if (authModalMode === 'forgot') {
      if (!email.trim() || !email.includes('@')) {
        setLocalValidationErr('Please enter a valid email address.');
        return;
      }
      setIsSubmitting(true);
      try {
        await resetPassword(email);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (authModalMode === 'register') {
      if (!fullName.trim()) {
        setLocalValidationErr('Please enter your full name.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setLocalValidationErr('Please enter a valid email address.');
        return;
      }
      if (password.length < 6) {
        setLocalValidationErr('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setLocalValidationErr('Passwords do not match. Please re-check.');
        return;
      }
      if (!termsAccepted) {
        setLocalValidationErr('Please accept the Terms of Service & Privacy Policy.');
        return;
      }

      setIsSubmitting(true);
      try {
        await signUpWithEmail(email, password, fullName);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Login
      if (!email.trim() || !password) {
        setLocalValidationErr('Please enter both email and password.');
        return;
      }

      setIsSubmitting(true);
      try {
        await signInWithEmail(email, password);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleSendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalValidationErr(null);

    const cleanNum = rawPhoneNumber.replace(/\D/g, '');
    if (cleanNum.length < 7 || cleanNum.length > 15) {
      setLocalValidationErr('Please enter a valid phone number (7-15 digits).');
      return;
    }

    const fullInternationalPhone = `${selectedCountryCode}${cleanNum}`;
    setIsSubmitting(true);
    try {
      await sendPhoneOtp(fullInternationalPhone);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalValidationErr(null);

    if (otpCode.trim().length !== 6) {
      setLocalValidationErr('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsSubmitting(true);
    try {
      await verifyPhoneOtp(otpCode, fullName.trim() || undefined);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={closeAuthModal}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Branding */}
        <div className="relative px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 text-center">
          <button
            type="button"
            onClick={closeAuthModal}
            className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Logo Brand Header */}
          <div className="flex flex-col items-center justify-center mb-2.5">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md p-1.5 mb-2 flex items-center justify-center">
              <img
                src="/jobhub-logo.png"
                alt="JobHub Pro — AI Career Suite"
                className="w-full h-full object-contain"
                loading="eager"
              />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/80">
              <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                JobHub Pro
              </span>
              <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400">
                • AI Career Suite
              </span>
            </div>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {authModalMode === 'register' && 'Welcome to JobHub Pro'}
            {authModalMode === 'login' && 'Welcome Back to JobHub Pro'}
            {authModalMode === 'forgot' && 'Reset Your Password'}
          </h2>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {authModalMode === 'register' && 'Your career journey starts here.'}
            {authModalMode === 'login' && 'Sign in to access your jobs, resumes, and interview prep.'}
            {authModalMode === 'forgot' && 'Enter your verified email to receive a recovery link.'}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Error Banner */}
          {currentError && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <div className="flex-1 font-medium leading-relaxed">{currentError}</div>
              <button
                type="button"
                onClick={() => {
                  setLocalValidationErr(null);
                  clearAuthError();
                }}
                className="text-rose-400 hover:text-rose-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {authModalMode !== 'forgot' && (
            <>
              {/* Option A — Continue with Google */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-white dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs hover:shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {/* Official Google 4-Color Logo */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Separator */}
              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
                <span className="bg-white dark:bg-slate-900 px-3 text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  or continue with
                </span>
              </div>

              {/* Method Switcher Tabs (Email vs Phone OTP) */}
              <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
                <button
                  type="button"
                  onClick={() => {
                    setActiveMethod('email');
                    setLocalValidationErr(null);
                  }}
                  className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                    activeMethod === 'email'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveMethod('phone');
                    setLocalValidationErr(null);
                  }}
                  className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                    activeMethod === 'phone'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Phone OTP</span>
                </button>
              </div>
            </>
          )}

          {/* Option B — Phone Number + OTP Flow */}
          {activeMethod === 'phone' && authModalMode !== 'forgot' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              {!otpSent ? (
                <form onSubmit={handleSendPhoneOtp} className="space-y-3">
                  {authModalMode === 'register' && (
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Alex Morgan"
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Phone Number
                    </label>
                    <div className="flex gap-2">
                      {/* Country Code Selector (India +91 Default) */}
                      <select
                        value={selectedCountryCode}
                        onChange={(e) => setSelectedCountryCode(e.target.value)}
                        className="py-2 px-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 font-mono shrink-0 cursor-pointer"
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.flag} {c.code} ({c.country.split(' ')[0]})
                          </option>
                        ))}
                      </select>

                      <div className="relative flex-1">
                        <Phone className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                        <input
                          type="tel"
                          required
                          value={rawPhoneNumber}
                          onChange={(e) => setRawPhoneNumber(e.target.value)}
                          placeholder="98765 43210"
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-mono"
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                      Defaulted to India (+91). SMS provider standard rate limits apply.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !rawPhoneNumber.trim()}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition shadow-md cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2 ${accentBtnClass}`}
                  >
                    {isSubmitting ? (
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5" />
                    )}
                    <span>{isSubmitting ? 'Requesting OTP...' : 'Send OTP via SMS'}</span>
                  </button>
                </form>
              ) : (
                /* OTP Verification Screen */
                <form onSubmit={handleVerifyPhoneOtp} className="space-y-3.5">
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300">
                    <p className="font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>OTP Sent Successfully</span>
                    </p>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5 font-mono">
                      Sent to: {phoneTarget}
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Enter 6-Digit Verification Code
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        maxLength={6}
                        required
                        autoFocus
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="123456"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm tracking-widest text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-mono text-center font-bold"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">
                      {otpCountdown > 0
                        ? `Resend available in ${otpCountdown}s`
                        : 'Did not receive code?'}
                    </span>
                    <button
                      type="button"
                      disabled={otpCountdown > 0 || isSubmitting}
                      onClick={resendPhoneOtp}
                      className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 disabled:opacity-40 transition cursor-pointer"
                    >
                      Resend OTP
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || otpCode.length !== 6}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition shadow-md cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2 ${accentBtnClass}`}
                  >
                    {isSubmitting ? (
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <ShieldCheck className="w-3.5 h-3.5" />
                    )}
                    <span>{isSubmitting ? 'Verifying OTP...' : 'Verify OTP & Continue'}</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Option C — Email & Password Flow */}
          {(activeMethod === 'email' || authModalMode === 'forgot') && (
            <form onSubmit={handleEmailSubmit} className="space-y-3">
              {authModalMode === 'register' && (
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {authModalMode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    {authModalMode === 'login' && (
                      <button
                        type="button"
                        onClick={() => openAuthModal('forgot')}
                        className="text-[10px] font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 transition cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-9 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              )}

              {authModalMode === 'register' && (
                <>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-9 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Terms & Privacy Acknowledgement */}
                  <div className="flex items-start gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="terms-checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <label
                      htmlFor="terms-checkbox"
                      className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal"
                    >
                      I agree to the <span className="underline font-medium">Terms of Service</span> and{' '}
                      <span className="underline font-medium">Privacy Policy</span>.
                    </label>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition shadow-md cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2 mt-2 ${accentBtnClass}`}
              >
                {isSubmitting ? (
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ArrowRight className="w-3.5 h-3.5" />
                )}
                <span>
                  {isSubmitting
                    ? 'Processing...'
                    : authModalMode === 'register'
                    ? 'Create Account'
                    : authModalMode === 'login'
                    ? 'Sign In to Dashboard'
                    : 'Send Password Reset Link'}
                </span>
              </button>
            </form>
          )}

          {/* Mode Switcher Links */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center text-xs">
            {authModalMode === 'register' && (
              <p className="text-slate-500 dark:text-slate-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    openAuthModal('login');
                    resetFormState();
                  }}
                  className={`font-semibold hover:underline cursor-pointer ${accentTextClass}`}
                >
                  Sign In
                </button>
              </p>
            )}

            {authModalMode === 'login' && (
              <p className="text-slate-500 dark:text-slate-400">
                Don&apos;t have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    openAuthModal('register');
                    resetFormState();
                  }}
                  className={`font-semibold hover:underline cursor-pointer ${accentTextClass}`}
                >
                  Create Account
                </button>
              </p>
            )}

            {authModalMode === 'forgot' && (
              <p className="text-slate-500 dark:text-slate-400">
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={() => {
                    openAuthModal('login');
                    resetFormState();
                  }}
                  className={`font-semibold hover:underline cursor-pointer ${accentTextClass}`}
                >
                  Back to Sign In
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
