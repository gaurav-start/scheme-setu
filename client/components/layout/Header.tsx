'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { toast } from 'sonner';
import {
  Landmark,
  UserCheck,
  Shield,
  PhoneCall,
  LogOut,
  BellRing,
  Search,
  MapPin,
  CheckCircle2,
  FileText,
  User
} from 'lucide-react';

export default function Header() {
  const t = useTranslations();
  const locale = useLocale();
  const { user, isAuthenticated, fetchUser, logout } = useAuthStore();
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <header className="w-full shadow-md border-b border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100">
      {/* 1. Top Utility Accessibility Bar (Government Portal Standard) */}
      <div className="bg-slate-900 text-slate-200 border-b border-slate-800 text-[10px] sm:text-[11px] py-0.5 px-3">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-1.5">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center space-x-1 font-bold text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              <span>भारत सरकार | Govt of India</span>
            </span>
            <span className="hidden lg:inline text-slate-400">| Ministry of Social Justice & Empowerment</span>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Accessibility Controls */}
            <div className="hidden sm:flex items-center space-x-1 border-r border-slate-700 pr-2">
              <span className="text-[10px] text-slate-400 uppercase tracking-tighter">Text:</span>
              <button
                onClick={() => setFontSize('sm')}
                className={`px-1 py-0.5 text-[10px] font-bold rounded ${fontSize === 'sm' ? 'bg-amber-500 text-slate-950' : 'hover:bg-slate-800'}`}
                title="Decrease font size"
              >
                A-
              </button>
              <button
                onClick={() => setFontSize('md')}
                className={`px-1 py-0.5 text-[10px] font-bold rounded ${fontSize === 'md' ? 'bg-amber-500 text-slate-950' : 'hover:bg-slate-800'}`}
                title="Normal font size"
              >
                A
              </button>
              <button
                onClick={() => setFontSize('lg')}
                className={`px-1 py-0.5 text-[10px] font-bold rounded ${fontSize === 'lg' ? 'bg-amber-500 text-slate-950' : 'hover:bg-slate-800'}`}
                title="Increase font size"
              >
                A+
              </button>
            </div>

            <div className="flex items-center space-x-1 text-amber-400 font-bold">
              <PhoneCall className="w-3 h-3" />
              <span>Toll Free: 1800-111-555</span>
            </div>

            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* 2. Main Government Branding Banner */}
      <div className="bg-slate-950 text-white px-4 py-2 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-3">
          <Link href={`/${locale}`} className="flex items-center space-x-3 group">
            {/* Emblem Badge */}
            <div className="w-10 h-10 rounded bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-md border border-amber-400 shrink-0">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-black tracking-tight text-white group-hover:text-amber-300 transition-colors">
                  {t('common.appName')}
                </h1>
                <span className="text-[9px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded-xs shadow-xs">
                  National SIH Portal
                </span>
              </div>
              <p className="text-[10.5px] text-slate-300 font-normal hidden sm:block">
                Unified Citizen Scheme Discovery & Rule Engine Platform
              </p>
            </div>
          </Link>

          {/* Quick Search & Status Indicators */}
          <div className="hidden lg:flex items-center space-x-3 text-xs">
            <div className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-300 flex items-center space-x-1.5">
              <Search className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px]">Direct Benefit Transfer (DBT) Enabled</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Compact High-Density Government Menu Bar */}
      <nav className="bg-slate-900 text-white text-xs border-b border-slate-800 px-3 py-1">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-1">
          <div className="flex flex-wrap items-center space-x-0.5 sm:space-x-1 font-bold">
            <Link
              href={`/${locale}`}
              className="px-2.5 py-1 rounded text-slate-200 hover:bg-slate-800 hover:text-amber-300 transition-all flex items-center space-x-1 text-[11.5px]"
            >
              <span>{t('nav.home')}</span>
            </Link>

            <Link
              href={`/${locale}/schemes`}
              className="px-2.5 py-1 rounded text-slate-200 hover:bg-slate-800 hover:text-amber-300 transition-all flex items-center space-x-1 text-[11.5px]"
            >
              <FileText className="w-3 h-3 text-amber-400" />
              <span>{t('nav.schemes')} Directory</span>
            </Link>

            <Link
              href={`/${locale}/eligibility`}
              className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-extrabold transition-all shadow-xs border border-amber-700 flex items-center space-x-1 text-[11.5px]"
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Check Eligibility</span>
            </Link>

            <Link
              href={`/${locale}/schemes?category=Agriculture`}
              className="hidden md:flex px-2 py-1 rounded text-slate-300 hover:bg-slate-800 hover:text-amber-300 transition-all text-[11.5px]"
            >
              <span>Farmer Services</span>
            </Link>

            <Link
              href={`/${locale}/schemes?category=Education`}
              className="hidden lg:flex px-2 py-1 rounded text-slate-300 hover:bg-slate-800 hover:text-amber-300 transition-all text-[11.5px]"
            >
              <span>Scholarships</span>
            </Link>

            <Link
              href={`/${locale}/csc`}
              className="px-2.5 py-1 rounded text-slate-300 hover:bg-slate-800 hover:text-amber-300 transition-all flex items-center space-x-1 text-[11.5px]"
            >
              <MapPin className="w-3 h-3 text-emerald-400" />
              <span>CSC Locator</span>
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  href={`/${locale}/dashboard`}
                  className="px-2.5 py-1 rounded text-slate-200 hover:bg-slate-800 hover:text-amber-300 transition-all text-[11.5px]"
                >
                  My Applications
                </Link>
                <Link
                  href={`/${locale}/profile`}
                  className="px-2.5 py-1 rounded text-slate-200 hover:bg-slate-800 hover:text-amber-300 transition-all text-[11.5px]"
                >
                  My Profile
                </Link>
              </>
            )}

            {user?.role === 'csc_operator' && (
              <Link
                href={`/${locale}/csc`}
                className="px-2.5 py-1 rounded bg-blue-700 hover:bg-blue-800 text-white transition-all flex items-center space-x-1 text-[11.5px]"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>CSC Portal</span>
              </Link>
            )}

            {user?.role === 'admin' && (
              <Link
                href={`/${locale}/admin`}
                className="px-2.5 py-1 rounded bg-red-700 hover:bg-red-800 text-white transition-all flex items-center space-x-1 text-[11.5px]"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Portal</span>
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link
                  href={`/${locale}/profile`}
                  className="flex items-center space-x-1.5 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-100 transition-all border border-slate-700 text-[11.5px]"
                >
                  {user?.avatar ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={user.avatar}
                      alt={user.name || 'User'}
                      className="w-4 h-4 rounded-full object-cover border border-amber-400 shrink-0"
                    />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] flex items-center justify-center shrink-0">
                      {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="font-bold max-w-[120px] truncate">{user?.name || user?.email?.split('@')[0]}</span>
                </Link>

                <button
                  onClick={async () => {
                    await logout();
                    toast.info('Logged out successfully.');
                  }}
                  className="px-2 py-1 rounded text-slate-300 hover:bg-slate-800 hover:text-white transition-all flex items-center space-x-1 text-[11.5px]"
                  title={t('nav.logout')}
                >
                  <LogOut className="w-3.5 h-3.5 text-red-400" />
                  <span className="hidden sm:inline">{t('nav.logout')}</span>
                </button>
              </div>
            ) : (
              <Link
                href={`/${locale}/login`}
                className="px-3 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-xs transition-all flex items-center space-x-1 text-[11.5px]"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In / Register</span>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* 4. Official Notice & Announcement Ticker Strip */}
      <div className="bg-amber-50 dark:bg-slate-900 border-b border-amber-200 dark:border-slate-800 px-3 py-0.5 text-amber-900 dark:text-amber-200 text-[10.5px]">
        <div className="max-w-7xl mx-auto flex items-center space-x-2 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="bg-amber-600 text-white px-1.5 py-0.2 rounded text-[9px] uppercase font-black shrink-0 flex items-center space-x-1">
            <BellRing className="w-2.5 h-2.5 inline" />
            <span>PORTAL BULLETIN</span>
          </span>
          <span className="font-medium">
            ★ SIH 2026 National Portal • AI Citizen Profile Filling & Rule Engine Active • Direct Benefit Transfer (DBT) Instant Verification • Emergency Helpline: 1800-111-555
          </span>
        </div>
      </div>
    </header>
  );
}
