'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/store/useAuthStore';
import Alert from '@/components/common/Alert';
import {
  ShieldCheck,
  CheckCircle2,
  Landmark,
  PhoneCall,
  Lock,
  FileCheck2,
  Mail,
  RefreshCw,
  ArrowLeft,
  HelpCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export default function VerifyOtpPage() {
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  const { setUser } = useAuthStore();
  const [email] = useState(emailParam);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [error, setError] = useState('');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Cooldown countdown effect
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Handle digit input focus advance
  const handleDigitChange = (index: number, value: string) => {
    const cleanValue = value.replace(/[^0-9]/g, '');
    const newDigits = [...otpDigits];

    if (cleanValue.length > 1) {
      // User pasted multi-character code
      const pasted = cleanValue.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pasted[i] || '';
      }
      setOtpDigits(newDigits);
      const nextIndex = Math.min(pasted.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    newDigits[index] = cleanValue;
    setOtpDigits(newDigits);

    if (cleanValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace navigation
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle clipboard paste across inputs
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (!pasteData) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasteData[i] || '';
    }
    setOtpDigits(newDigits);
    const focusIdx = Math.min(pasteData.length, 5);
    inputRefs.current[focusIdx]?.focus();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpDigits.join('');
    if (!email || fullOtp.length !== 6) {
      setError('Please enter all 6 digits of the security OTP code.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      toast.loading('Verifying security OTP...', { id: 'verify-otp' });
      const res = await authApi.verifyOtp(email, fullOtp);
      if (res.success && res.user) {
        setUser(res.user);
        toast.success(`Welcome back, ${res.user.name || 'Citizen'}!`, { id: 'verify-otp' });
        router.push(`/${locale}/dashboard`);
      } else {
        const msg = res.message || 'Invalid or expired OTP code.';
        setError(msg);
        toast.error(msg, { id: 'verify-otp' });
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      const msg = errorObj.response?.data?.message || 'Verification failed. Please try again.';
      setError(msg);
      toast.error(msg, { id: 'verify-otp' });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resending || !email) return;

    try {
      setResending(true);
      setError('');
      toast.loading('Resending security OTP...', { id: 'resend-otp' });
      const res = await authApi.sendOtp(email);
      if (res.success) {
        toast.success(`A new OTP has been sent to ${email}`, { id: 'resend-otp' });
        setResendCooldown(60);
        setOtpDigits(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        const msg = res.message || 'Failed to resend OTP. Please try again.';
        setError(msg);
        toast.error(msg, { id: 'resend-otp' });
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      const msg = errorObj.response?.data?.message || 'Failed to resend OTP.';
      setError(msg);
      toast.error(msg, { id: 'resend-otp' });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full bg-slate-100 dark:bg-slate-950 py-8 px-4 min-h-[calc(100vh-140px)]">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Government Portal Header Banner */}
        <div className="bg-slate-900 text-white rounded-t-lg p-4 sm:p-5 border-t-4 border-amber-500 shadow-md flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-amber-500 text-slate-950 rounded flex items-center justify-center font-black shadow shrink-0 border border-amber-400">
              <Landmark className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded-xs">
                  GOVERNMENT SSO PORTAL
                </span>
                <span className="text-[11px] text-slate-300 font-bold hidden sm:inline">
                  Step 2 of 2: OTP Verification
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Citizen Identity Verification (2FA)
              </h1>
            </div>
          </div>

          <div className="hidden lg:flex items-center space-x-3 text-xs bg-slate-800 px-3 py-1.5 rounded border border-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>256-Bit SSL Encrypted Govt Portal</span>
          </div>
        </div>

        {/* Dense 2-Column Portal Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-b-lg shadow-xl p-5 sm:p-6">
          {/* Left Column: Security Guidelines & Helpline Support */}
          <div className="lg:col-span-6 space-y-5 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 pb-5 lg:pb-0 lg:pr-6">
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => router.push(`/${locale}/login`)}
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline mb-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Login / Change Email</span>
              </button>

              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                One-Time Password (OTP) Verification
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                To protect citizen welfare data and prevent unauthorized scheme applications, an official 6-digit One-Time Password (OTP) has been dispatched to your registered email address.
              </p>
            </div>

            {/* Email Target Box */}
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-900/60 rounded-lg flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 overflow-hidden">
                <Mail className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
                <div className="truncate">
                  <span className="text-[10.5px] text-slate-500 dark:text-slate-400 block font-semibold">OTP Dispatched To:</span>
                  <strong className="text-slate-900 dark:text-amber-100 font-bold text-xs truncate block">{email || 'Not Specified'}</strong>
                </div>
              </div>
              <button
                type="button"
                onClick={() => router.push(`/${locale}/login`)}
                className="text-[11px] font-bold text-amber-800 dark:text-amber-300 underline hover:text-amber-900 shrink-0 ml-2"
              >
                Change
              </button>
            </div>

            {/* Security Notice Box */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2.5 text-xs">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-1.5">
                <FileCheck2 className="w-4 h-4 text-amber-600" />
                <span>Official OTP Security Guidelines</span>
              </h3>

              <ul className="space-y-2 text-[11.5px] text-slate-600 dark:text-slate-300">
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span>The OTP code is valid for <strong>10 minutes</strong> from dispatch.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span><strong>Never share</strong> your OTP or password with anyone, including government helpline agents.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span>If you do not see the email in your Inbox, please inspect your <strong>Spam / Junk</strong> folder.</span>
                </li>
              </ul>
            </div>

            {/* Helpline Footer Box */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500">
              <div className="flex items-center space-x-1.5 font-bold text-slate-700 dark:text-slate-300">
                <PhoneCall className="w-3.5 h-3.5 text-amber-600" />
                <span>National Citizen Toll Free Helpline: 1800-111-555</span>
              </div>
              <div className="flex items-center space-x-1">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                <span>helpdesk@schemesetu.gov.in</span>
              </div>
            </div>
          </div>

          {/* Right Column: 6-Digit Verification Box */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-lg border border-slate-300 dark:border-slate-700 shadow-sm space-y-5">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-full bg-slate-900 text-amber-400 mx-auto flex items-center justify-center font-bold shadow-xs">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Enter 6-Digit OTP Code</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Input the authentication code below to access your citizen account
                </p>
              </div>

              {error && (
                <div>
                  <Alert type="error">{error}</Alert>
                </div>
              )}

              <form onSubmit={handleVerify} className="space-y-5">
                {/* 6-Digit Segmented Box Input */}
                <div className="space-y-2">
                  <label className="block text-center font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">
                    Authentication Code
                  </label>
                  <div className="flex justify-center items-center gap-2 sm:gap-3" onPaste={handlePaste}>
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          inputRefs.current[idx] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-black bg-white dark:bg-slate-900 text-slate-900 dark:text-amber-300 border-2 border-slate-300 dark:border-slate-700 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 transition-all outline-none"
                      />
                    ))}
                  </div>
                </div>

                {/* Primary Action Button */}
                <button
                  type="submit"
                  disabled={loading || otpDigits.join('').length !== 6}
                  className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center space-x-2 border border-amber-700"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{loading ? 'Verifying OTP Code...' : 'Verify & Sign In'}</span>
                </button>
              </form>

              {/* Resend Cooldown Section */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Didn&apos;t receive the code?
                </span>

                {resendCooldown > 0 ? (
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 bg-slate-200 dark:bg-slate-700 px-2.5 py-1 rounded">
                    Resend in {resendCooldown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resending}
                    className="inline-flex items-center space-x-1 text-xs font-black text-amber-700 dark:text-amber-400 hover:underline disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                    <span>{resending ? 'Sending...' : 'Resend OTP Code'}</span>
                  </button>
                )}
              </div>

              {/* Security Compliance Footer */}
              <div className="pt-2 text-center">
                <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-center space-x-1 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>ISO 27001 Security Standard & MeitY Guidelines Compliant</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

