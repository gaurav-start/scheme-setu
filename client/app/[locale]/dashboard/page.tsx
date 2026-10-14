'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { eligibilityApi } from '@/lib/api/eligibility';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import StatusBadge from '@/components/common/StatusBadge';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { LayoutDashboard, UserCheck, ShieldCheck, History, ArrowRight, Sparkles } from 'lucide-react';

interface AuditHistoryItem {
  _id?: string;
  schemeSlug?: string;
  resultDegree?: string;
  createdAt?: string;
}

export default function DashboardPage() {
  const t = useTranslations();
  const locale = useLocale();
  const { user } = useAuthStore();

  const [history, setHistory] = useState<AuditHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    async function loadAuditHistory() {
      try {
        setLoadingHistory(true);
        const res = await eligibilityApi.getHistory();
        if (res.success && res.history) {
          setHistory(res.history);
        }
      } catch (err) {
        console.error('Failed to load audit history', err);
      } finally {
        setLoadingHistory(false);
      }
    }
    loadAuditHistory();
  }, []);

  const calculateProfileCompletion = () => {
    if (!user) return 0;
    const fields = [
      'name', 'age', 'gender', 'category', 'maritalStatus',
      'disabilityStatus', 'annualIncome', 'occupation', 'employmentStatus',
      'state', 'district', 'block', 'ruralUrban'
    ];
    let filled = 0;
    fields.forEach((f) => {
      if (user[f] !== undefined && user[f] !== null && user[f] !== '') {
        filled++;
      }
    });
    return Math.round((filled / fields.length) * 100);
  };

  const completionPercent = calculateProfileCompletion();

  return (
    <ProtectedRoute>
      <div>
        <Breadcrumbs />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 lg:py-14 space-y-8">
        {/* Welcome Header */}
        <div className="ux4g-card p-6 lg:p-8 bg-white dark:bg-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-l-4 border-l-blue-900">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 flex items-center space-x-3 tracking-tight">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-200 flex items-center justify-center">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <span>{t('dashboard.welcome')}, {user?.name || 'Citizen'}!</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-normal">{t('dashboard.subtitle')}</p>
          </div>

          <div className="flex space-x-3 shrink-0">
            <Link
              href={`/${locale}/eligibility`}
              className="ux4g-button-saffron text-xs sm:text-sm py-3 px-5 font-bold shadow-md flex items-center space-x-2 text-white"
            >
              <ShieldCheck className="w-4 h-4 text-amber-200" />
              <span className="text-white">{t('common.checkEligibility')}</span>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Profile Completion Card */}
          <div className="ux4g-card p-6 lg:p-7 space-y-4 bg-white dark:bg-slate-800">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">{t('dashboard.profileCompletion')}</span>
              <UserCheck className="w-5 h-5 text-blue-900 dark:text-amber-400" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{completionPercent}%</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">13 Core Facts</span>
              </div>

              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-700 to-amber-500 transition-all duration-500"
                  style={{ width: `${completionPercent}%` }}
                ></div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href={`/${locale}/profile`}
                className="text-xs font-bold text-blue-900 dark:text-amber-400 hover:underline flex items-center space-x-1"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Complete Profile with AI →</span>
              </Link>
            </div>
          </div>

          {/* Quick Action: Check Scheme */}
          <div className="ux4g-card p-6 lg:p-7 space-y-4 bg-white dark:bg-slate-800 border-top-saffron">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">{t('dashboard.quickActionTitle')}</span>
              <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('dashboard.quickActionDesc')}
            </p>

            <div className="pt-1">
              <Link
                href={`/${locale}/schemes`}
                className="ux4g-button-primary text-xs py-2.5 px-4 font-bold flex items-center justify-between text-white shadow-xs"
              >
                <span className="text-white font-bold">Browse Scheme Directory</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </Link>
            </div>
          </div>

          {/* Audit Trail Info */}
          <div className="ux4g-card p-6 lg:p-7 space-y-4 bg-white dark:bg-slate-800">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Audit Security</span>
              <History className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Every evaluation is logged deterministically without modifying your profile state.
            </p>

            <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
              ✓ Immutable Engine Verification Logged
            </div>
          </div>
        </div>

        {/* Audit History Table */}
        <div className="ux4g-card p-6 lg:p-8 space-y-6 bg-white dark:bg-slate-800">
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-4">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2.5">
              <History className="w-5 h-5 text-blue-900 dark:text-amber-400" />
              <span>{t('dashboard.recentChecksTitle')}</span>
            </h2>

            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Logged Decisions</span>
          </div>

          {loadingHistory ? (
            <div className="text-center py-8 text-xs text-slate-500 dark:text-slate-400">Loading audit history...</div>
          ) : history.length === 0 ? (
            <div className="text-center py-10 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {t('dashboard.noHistory')}
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item, idx) => (
                <div
                  key={item._id || idx}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 flex flex-wrap justify-between items-center gap-4 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">{item.schemeSlug || 'Government Scheme'}</h4>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Checked on: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recently'}
                    </span>
                  </div>

                  <StatusBadge degree={item.resultDegree || 'unknown'} size="sm" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}
