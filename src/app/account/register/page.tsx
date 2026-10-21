'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/account';
  const initialStep = searchParams.get('step') === 'verify' ? 'verify' : 'register';
  const initialEmail = searchParams.get('email') || '';

  const { register, verifyCode, resendCode } = useAuth();

  const [step, setStep] = useState<'register' | 'verify'>(initialStep);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newsletter, setNewsletter] = useState(true);

  // Verification OTP State
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [serverCode, setServerCode] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMessage, setResendMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown for resending code
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    const res = await register({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password,
      newsletter,
    });

    setLoading(false);

    if (res.success) {
      if (res.code) {
        setServerCode(res.code);
        setOtp(res.code.split('').slice(0, 6));
      }
      if (res.requires_verification) {
        setStep('verify');
        setResendCooldown(60);
        setSuccessMessage(res.message || 'Verification code sent to your email.');
      } else {
        router.push(redirect);
      }
    } else {
      setError(res.error || 'Registration failed. Email may already be in use.');
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    // Handle paste event or single digit
    if (value.length > 1) {
      const pasted = value.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pasted[i] || '';
      }
      setOtp(newOtp);
      const nextFocus = Math.min(pasted.length, 5);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    newOtp[index] = value;
    setOtp(newOtp);

    // Auto advance focus
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifySubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }

    setLoading(true);
    setError('');

    const res = await verifyCode(email.trim(), code);
    setLoading(false);

    if (res.success) {
      setSuccessMessage('Account verified successfully! Redirecting...');
      setTimeout(() => {
        router.push(redirect);
      }, 1000);
    } else {
      setError(res.error || 'Invalid verification code. Please check and try again.');
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0 || !email) return;

    setLoading(true);
    setError('');
    setResendMessage('');

    const res = await resendCode(email.trim());
    setLoading(false);

    if (res.success) {
      if (res.code) {
        setServerCode(res.code);
        setOtp(res.code.split('').slice(0, 6));
      }
      setResendCooldown(60);
      setResendMessage(res.message || 'A fresh code has been sent to your email.');
    } else {
      setError(res.error || 'Failed to resend code. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 sm:p-10 border border-brand-100 shadow-luxury space-y-6">
      {step === 'register' ? (
        <>
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center mx-auto font-serif font-bold text-xl border border-brand-200">
              B
            </div>
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-charcoal-900">
              Create Customer Account
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-500">
              Join BAGm Beauty Supply for personalized routine tracking, address book, and order history.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 block mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="Akosua"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full text-xs p-3 pl-10 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 block mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Mensah"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 block mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs p-3 pl-10 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 block mb-1">
                Ghana Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  placeholder="024 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs p-3 pl-10 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 block mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs p-3 pl-10 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 block mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <label className="flex items-start gap-2 cursor-pointer select-none pt-1">
              <input
                type="checkbox"
                checked={newsletter}
                onChange={(e) => setNewsletter(e.target.checked)}
                className="mt-0.5 rounded border-gray-300 text-brand-600 focus:ring-0 text-xs"
              />
              <span className="text-xs text-charcoal-600 leading-tight">
                I would like to receive curated beauty guides and store updates.
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              {loading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <span>Create Account &amp; Send Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-gray-100 text-center">
            <p className="text-xs text-charcoal-500">
              Already have an account?{' '}
              <Link
                href={`/account/login?redirect=${encodeURIComponent(redirect)}`}
                className="font-bold text-brand-700 hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </>
      ) : (
        /* OTP 6-Digit Verification Step */
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center mx-auto border border-brand-200 shadow-xs">
              <KeyRound className="w-6 h-6 text-brand-600" />
            </div>
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-charcoal-900">
              Verify Your Email
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-600">
              We&apos;ve sent a 6-digit verification code to:
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-brand-200 text-brand-800 text-xs font-bold">
              <span>{email}</span>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {resendMessage && (
            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{resendMessage}</span>
            </div>
          )}

          {serverCode && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-50 via-rose-50 to-pink-50 border border-brand-200 text-xs flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white border border-brand-200 flex items-center justify-center text-brand-600 shadow-2xs shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-charcoal-500 uppercase tracking-wider">Your 6-Digit Verification Code</p>
                  <p className="font-mono text-xl font-black text-brand-700 tracking-widest leading-tight">{serverCode}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOtp(serverCode.split('').slice(0, 6));
                }}
                className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer text-center"
              >
                Auto-Fill Code
              </button>
            </div>
          )}

          <form onSubmit={handleVerifySubmit} className="space-y-6">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 block text-center mb-3">
                Enter 6-Digit Code
              </label>

              {/* 6 Individual Code Inputs */}
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-11 h-13 sm:w-13 sm:h-15 text-center text-xl sm:text-2xl font-bold font-mono rounded-2xl border-2 border-brand-200 focus:border-brand-600 focus:ring-2 focus:ring-brand-200 outline-none transition-all shadow-xs bg-rose-50/20 text-charcoal-900"
                    placeholder="•"
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otp.join('').length < 6}
              className="w-full py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
            >
              {loading ? (
                <span>Verifying Account...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify &amp; Activate Account</span>
                </>
              )}
            </button>
          </form>

          {/* Resend & Edit Email Controls */}
          <div className="space-y-3 pt-2 text-center text-xs">
            <div className="flex items-center justify-center gap-2 text-charcoal-600">
              <span>Didn&apos;t receive the email code?</span>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendCooldown > 0 || loading}
                className="font-bold text-brand-700 hover:underline disabled:text-charcoal-400 disabled:no-underline"
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
              </button>
            </div>

            <div>
              <button
                type="button"
                onClick={() => {
                  setStep('register');
                  setError('');
                }}
                className="inline-flex items-center gap-1.5 text-charcoal-500 hover:text-charcoal-800 text-[11px] font-medium transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Change email address</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-blush-light flex flex-col">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 py-12 sm:py-20 flex items-center justify-center">
        <div className="max-w-lg w-full mx-auto px-4">
          <Suspense fallback={<div className="p-8 text-center text-xs text-charcoal-400">Loading form...</div>}>
            <RegisterForm />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}
