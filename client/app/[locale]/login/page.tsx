'use client';

import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/store/useAuthStore';
import Alert from '@/components/common/Alert';
import {
  Mail,
  ArrowRight,
  ShieldCheck,
  Landmark,
  PhoneCall,
  Lock,
  FileCheck2,
  UserCheck,
  HelpCircle
} from 'lucide-react';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (parent: HTMLElement | null, options: Record<string, unknown>) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export default function LoginPage() {
  const locale = useLocale();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, fetchUser, setUser } = useAuthStore();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      router.replace(`/${locale}/dashboard`);
    }
  }, [isLoading, isAuthenticated, user, locale, router]);

  useEffect(() => {
    const handleCredentialResponse = async (response: { credential: string }) => {
      try {
        setLoading(true);
        setError('');
        toast.loading('Signing in with Google...', { id: 'google-auth' });
        const res = await authApi.googleLogin(response.credential);
        if (res.success && res.user) {
          setUser(res.user);
          toast.success(`Welcome, ${res.user.name || 'Citizen'}!`, { id: 'google-auth' });
          router.push(`/${locale}/dashboard`);
        } else {
          setError(res.message || 'Google Sign-In failed.');
          toast.error(res.message || 'Google Sign-In failed.', { id: 'google-auth' });
        }
      } catch (err: unknown) {
        const errorObj = err as { response?: { data?: { message?: string } } };
        const msg = errorObj.response?.data?.message || 'Google Sign-In failed. Please try again.';
        setError(msg);
        toast.error(msg, { id: 'google-auth' });
      } finally {
        setLoading(false);
      }
    };

    const initGoogleBtn = () => {
      if (window.google?.accounts?.id && clientId) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
            ux_mode: 'popup',
          });

          const btnDiv = document.getElementById('googleSignInBtn');
          if (btnDiv) {
            btnDiv.innerHTML = '';
            window.google.accounts.id.renderButton(btnDiv, {
              type: 'standard',
              theme: 'outline',
              size: 'large',
              text: 'signin_with',
              shape: 'rectangular',
              logo_alignment: 'left',
              width: 320,
            });
          }

          // Trigger One Tap prompt as a non-popup fallback
          window.google.accounts.id.prompt();
        } catch (e) {
          console.error('[GIS] Error initializing Google Sign-In:', e);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGoogleBtn();
    } else {
      const scriptId = 'google-gis-script';
      let script = document.getElementById(scriptId) as HTMLScriptElement | null;

      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = initGoogleBtn;
        document.body.appendChild(script);
      } else {
        script.addEventListener('load', initGoogleBtn);
        // Fallback check if script already loaded before listener attached
        if (window.google?.accounts?.id) {
          initGoogleBtn();
        }
      }
    }
  }, [clientId, locale, router, setUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      setError('');
      toast.loading('Sending verification OTP...', { id: 'send-otp' });
      const res = await authApi.sendOtp(email);
      if (res.success) {
        toast.success(`OTP sent to ${email}`, { id: 'send-otp' });
        router.push(`/${locale}/login/verify-otp?email=${encodeURIComponent(email)}`);
      } else {
        const msg = res.message || 'Failed to send OTP. Please check your email.';
        setError(msg);
        toast.error(msg, { id: 'send-otp' });
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      const msg = errorObj.response?.data?.message || 'Server error sending OTP.';
      setError(msg);
      toast.error(msg, { id: 'send-otp' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-slate-100 dark:bg-slate-950 py-8 px-4 min-h-[calc(100vh-140px)]">
      <div className="max-w-6xl mx-auto space-y-4">
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
                  National Scheme Setu Authentication
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Citizen & Operator Single Sign-On (SSO)
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
          {/* Left Column: Official Government Notices & Portal Information */}
          <div className="lg:col-span-7 space-y-5 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 pb-5 lg:pb-0 lg:pr-6">
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                Official Access Portal
              </span>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Access 500+ Central & State Welfare Schemes
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                Single Sign-On (SSO) empowers citizens, Common Service Centre (CSC) operators, and welfare administrators to evaluate scheme eligibility, manage profile attributes, and track Direct Benefit Transfers (DBT).
              </p>
            </div>

            {/* 4-Step Portal Guidance Box */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-lg border border-slate-200 dark:border-slate-700 space-y-3">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-1.5">
                <FileCheck2 className="w-4 h-4 text-amber-600" />
                <span>4-Step Citizen Process</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 flex items-start space-x-2">
                  <span className="w-5 h-5 bg-amber-500 text-slate-950 rounded-full font-black text-[11px] flex items-center justify-center shrink-0">1</span>
                  <div>
                    <strong className="block text-slate-900 dark:text-white text-[11.5px]">Authenticate</strong>
                    <span className="text-[10.5px] text-slate-500 dark:text-slate-400">Sign in with Google OAuth or Email Security OTP code.</span>
                  </div>
                </div>

                <div className="p-2.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 flex items-start space-x-2">
                  <span className="w-5 h-5 bg-amber-500 text-slate-950 rounded-full font-black text-[11px] flex items-center justify-center shrink-0">2</span>
                  <div>
                    <strong className="block text-slate-900 dark:text-white text-[11.5px]">AI Profile Extraction</strong>
                    <span className="text-[10.5px] text-slate-500 dark:text-slate-400">Autofill demographic details using Google Gemini AI.</span>
                  </div>
                </div>

                <div className="p-2.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 flex items-start space-x-2">
                  <span className="w-5 h-5 bg-amber-500 text-slate-950 rounded-full font-black text-[11px] flex items-center justify-center shrink-0">3</span>
                  <div>
                    <strong className="block text-slate-900 dark:text-white text-[11.5px]">Rule Evaluation</strong>
                    <span className="text-[10.5px] text-slate-500 dark:text-slate-400">Check eligibility using 100% deterministic decision logic.</span>
                  </div>
                </div>

                <div className="p-2.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 flex items-start space-x-2">
                  <span className="w-5 h-5 bg-amber-500 text-slate-950 rounded-full font-black text-[11px] flex items-center justify-center shrink-0">4</span>
                  <div>
                    <strong className="block text-slate-900 dark:text-white text-[11.5px]">Direct Benefit Transfer</strong>
                    <span className="text-[10.5px] text-slate-500 dark:text-slate-400">Receive government welfare & subsidies seamlessly.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CSC Operator / Admin Notice Card */}
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-lg flex items-center justify-between text-xs text-amber-950 dark:text-amber-200">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-4 h-4 text-amber-700 shrink-0" />
                <span className="font-semibold text-[11px]">CSC Operator or Administrator? Use standard portal credentials to sign in.</span>
              </div>
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

          {/* Right Column: Authentication Card Box */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-lg border border-slate-300 dark:border-slate-700 shadow-sm space-y-4">
              <div className="text-center space-y-1">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-amber-400 mx-auto flex items-center justify-center font-bold shadow-xs">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Secure Portal Sign In</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Choose your preferred login method below</p>
              </div>

              {error && (
                <div>
                  <Alert type="error">{error}</Alert>
                </div>
              )}

              {/* Google OAuth GIS Container */}
              <div className="space-y-2">
                <span className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 text-center">
                  Fast Single Sign-On (SSO)
                </span>
                <div className="flex justify-center min-h-[44px]">
                  <div id="googleSignInBtn" className="w-full flex justify-center">
                    <div className="w-[320px] h-11 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded flex items-center justify-center text-xs text-slate-500 animate-pulse">
                      Loading Google Sign-In...
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-slate-300 dark:border-slate-700 w-full"></div>
                <span className="bg-slate-50 dark:bg-slate-800 px-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider absolute">
                  Or via Email Security OTP
                </span>
              </div>

              {/* Email Security OTP Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label htmlFor="email" className="block font-bold text-slate-800 dark:text-slate-200 text-[11.5px]">
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      id="email"
                      type="email"
                      required
                      placeholder="citizen@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2.5 rounded font-black text-xs shadow transition-all flex items-center justify-center space-x-2 border border-amber-700"
                >
                  <span>{loading ? 'Generating Security OTP...' : 'Send OTP Security Code'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 text-center">
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
