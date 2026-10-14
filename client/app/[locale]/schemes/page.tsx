'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { schemesApi } from '@/lib/api/schemes';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { Search, Landmark, ArrowRight, ShieldCheck } from 'lucide-react';

interface SchemeItem {
  _id?: string;
  slug: string;
  name: string;
  scope?: string;
  category?: string;
  description?: string;
  benefit?: string;
  targetBeneficiaries?: string;
}

export default function SchemesPage() {
  const t = useTranslations();
  const locale = useLocale();

  const [schemes, setSchemes] = useState<SchemeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedScope, setSelectedScope] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const params: Record<string, unknown> = {};
        if (selectedCategory) params.category = selectedCategory;
        if (selectedScope) params.scope = selectedScope;
        if (searchQuery) params.search = searchQuery;

        const res = await schemesApi.getSchemes(params);
        if (res.success) {
          const list = res.schemes || res.data || [];
          setSchemes(Array.isArray(list) ? list : []);
        } else {
          setSchemes([]);
        }
      } catch (err) {
        console.warn('Backend API fetch failed:', err);
        setSchemes([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedCategory, selectedScope, searchQuery]);

  const categories = [
    'Pension',
    'Agriculture',
    'Health',
    'Education',
    'Disability',
    'Housing',
    'Social Welfare',
  ];

  return (
    <div>
      <Breadcrumbs />

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        {/* Page Header */}
        <div className="bg-white dark:bg-slate-900 p-4 border border-slate-300 dark:border-slate-800 rounded border-l-4 border-l-[#0F3B66] dark:border-l-amber-500 flex items-center justify-between">
          <div className="space-y-0.5">
            <h1 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <Landmark className="w-5 h-5 text-blue-900 dark:text-amber-400" />
              <span>{t('schemes.title')}</span>
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-normal">{t('schemes.subtitle')}</p>
          </div>
          <span className="text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-2 py-1 border border-slate-300 dark:border-slate-700 rounded">
            {schemes.length} Schemes Available
          </span>
        </div>

        {/* Filter & Search Bar */}
        <div className="ux4g-card p-3.5 bg-white dark:bg-slate-900 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className="md:col-span-6 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={t('schemes.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 dark:border-slate-700 text-xs focus:ring-1 focus:ring-amber-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              />
            </div>

            {/* Scope Filter */}
            <div className="md:col-span-3">
              <select
                value={selectedScope}
                onChange={(e) => setSelectedScope(e.target.value)}
                className="w-full py-2 px-3 border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-bold"
              >
                <option value="">{t('schemes.scopeAll')}</option>
                <option value="Central">{t('schemes.centralGov')}</option>
                <option value="State">{t('schemes.stateGov')}</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="md:col-span-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full py-2 px-3 border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-bold"
              >
                <option value="">{t('schemes.categoryAll')}</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Schemes Grid */}
        {loading ? (
          <div className="text-center py-10 text-xs text-slate-500 dark:text-slate-400">Loading government schemes directory...</div>
        ) : schemes.length === 0 ? (
          <div className="ux4g-card p-8 text-center text-slate-600 dark:text-slate-300 text-xs font-semibold">
            {t('schemes.noSchemesFound')}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {schemes.map((scheme) => (
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

                  <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded border border-slate-200 dark:border-slate-800 text-xs space-y-1 mb-2">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 font-semibold">{t('schemes.benefit')}: </span>
                      <span className="font-bold text-emerald-800 dark:text-emerald-400">{scheme.benefit}</span>
                    </div>
                    {scheme.targetBeneficiaries && (
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 font-semibold">{t('schemes.targetGroup')}: </span>
                        <span className="text-slate-800 dark:text-slate-200">{scheme.targetBeneficiaries}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex justify-between items-center">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center space-x-1 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Verified Rules</span>
                  </span>

                  <Link
                    href={`/${locale}/schemes/${scheme.slug}`}
                    className="ux4g-button-primary text-xs py-1.5 px-3 flex items-center space-x-1"
                  >
                    <span>{t('common.viewDetails')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
