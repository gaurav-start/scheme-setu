'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { schemesApi } from '@/lib/api/schemes';
import { ShieldCheck, CheckCircle2, ArrowRight, UserPlus, Search, Calendar, FileText, PhoneCall, Sparkles } from 'lucide-react';

interface SchemeItem {
  _id?: string;
  slug: string;
  name: string;
  scope?: string;
  category?: string;
  description?: string;
  benefit?: string;
}

export default function HomePage() {
  const t = useTranslations();
  const locale = useLocale();
  const [featuredSchemes, setFeaturedSchemes] = useState<SchemeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSchemes() {
      try {
        const res = await schemesApi.getSchemes();
        if (res.success) {
          const list = res.schemes || res.data || [];
          setFeaturedSchemes(Array.isArray(list) ? list.slice(0, 3) : []);
        } else {
          setFeaturedSchemes([]);
        }
      } catch (err) {
        console.warn('Backend API fetch failed:', err);
        setFeaturedSchemes([]);
      } finally {
        setLoading(false);
      }
    }
    loadSchemes();
  }, []);

  return (
    <div className="space-y-6 pb-6">
      {/* Hero Section */}
      <section className="bg-slate-900 text-white border-b-4 border-amber-600 py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center space-x-2 bg-amber-500/20 text-amber-300 text-[11px] font-bold px-2.5 py-1 rounded border border-amber-500/40">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>SIH 2026 National Public Citizen Service</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight text-white">
              {t('home.heroTitle')}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed font-normal">
              {t('home.heroSubtitle')}
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <Link
                href={`/${locale}/eligibility`}
                className="ux4g-button-saffron flex items-center space-x-2 text-xs py-2.5 px-4 shadow font-bold"
              >
                <span>{t('common.checkEligibility')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href={`/${locale}/schemes`}
                className="ux4g-button-secondary bg-slate-800 text-white border-slate-700 hover:bg-slate-700 text-xs py-2.5 px-4 font-semibold"
              >
                {t('common.exploreSchemes')}
              </Link>
              <Link
                href={`/${locale}/profile`}
                className="py-2.5 px-4 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow flex items-center space-x-1.5 border border-emerald-800"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{t('common.fillUsingAI')}</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-4 bg-slate-800/90 p-4 sm:p-5 rounded border border-slate-700 text-slate-200 shadow">
            <h3 className="text-xs font-bold text-amber-400 border-b border-slate-700 pb-2 mb-3 tracking-wide uppercase flex items-center justify-between">
              <span>Citizen Quick Verification</span>
              <span className="text-[10px] bg-emerald-700 text-white px-1.5 py-0.5 rounded">100% ONLINE</span>
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>100% Deterministic Rule Engine evaluation.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Instant document requirements checklist.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>AI Profile Filling with Hinglish support.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* How Scheme Setu Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white dark:bg-slate-900 p-4 border border-slate-300 dark:border-slate-800 rounded mb-4 flex items-center justify-between shadow-xs">
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {t('home.howItWorksTitle')}
          </h2>
          <span className="text-xs font-bold text-blue-900 dark:text-amber-400">4-Step Citizen Process</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="ux4g-card p-4 space-y-2">
            <div className="w-9 h-9 rounded bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 flex items-center justify-center font-bold">
              <UserPlus className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">{t('home.step1Title')}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{t('home.step1Desc')}</p>
          </div>

          <div className="ux4g-card p-4 space-y-2">
            <div className="w-9 h-9 rounded bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 flex items-center justify-center font-bold">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">{t('home.step2Title')}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{t('home.step2Desc')}</p>
          </div>

          <div className="ux4g-card p-4 space-y-2">
            <div className="w-9 h-9 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">{t('home.step3Title')}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{t('home.step3Desc')}</p>
          </div>

          <div className="ux4g-card p-4 space-y-2">
            <div className="w-9 h-9 rounded bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-300 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">{t('home.step4Title')}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{t('home.step4Desc')}</p>
          </div>
        </div>
      </section>

      {/* Featured Schemes Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white dark:bg-slate-900 p-3 border border-slate-300 dark:border-slate-800 rounded flex justify-between items-center mb-4 shadow-xs">
          <h2 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-wide">{t('home.popularSchemesTitle')}</h2>
          <Link
            href={`/${locale}/schemes`}
            className="text-xs font-bold text-blue-900 dark:text-amber-400 hover:text-blue-700 dark:hover:text-amber-300 flex items-center space-x-1"
          >
            <span>{t('home.viewAllSchemes')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8 text-xs text-slate-500 dark:text-slate-400">Loading government schemes...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredSchemes.map((scheme) => (
              <div key={scheme._id || scheme.slug} className="ux4g-card p-4 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 rounded border border-transparent dark:border-blue-800">
                      {scheme.scope || 'Central Government'}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      {scheme.category}
                    </span>
                  </div>

                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 mb-1.5">
                    {scheme.name}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-3">
                    {scheme.description}
                  </p>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex justify-between items-center gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold">Benefit</span>
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400">{scheme.benefit}</span>
                  </div>

                  <Link
                    href={`/${locale}/schemes/${scheme.slug}`}
                    className="ux4g-button-primary text-xs py-1.5 px-3 shrink-0"
                  >
                    {t('common.viewDetails')}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Citizen Assistance Help Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="ux4g-card p-4 bg-slate-900 text-white flex flex-col md:flex-row justify-between items-center gap-4 border-l-4 border-l-amber-500">
          <div className="space-y-1">
            <h3 className="text-sm font-bold flex items-center space-x-2">
              <PhoneCall className="w-4 h-4 text-amber-400" />
              <span>{t('home.needHelpTitle')}</span>
            </h3>
            <p className="text-xs text-slate-300 max-w-xl leading-normal">
              {t('home.helpDesc')}
            </p>
          </div>

          <div className="flex space-x-2 shrink-0">
            <a
              href="tel:1800111555"
              className="ux4g-button-saffron text-xs py-2 px-4 font-bold shadow"
            >
              Call 1800-111-555
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
