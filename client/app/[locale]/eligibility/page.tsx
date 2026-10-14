'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { schemesApi } from '@/lib/api/schemes';
import { eligibilityApi } from '@/lib/api/eligibility';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import StatusBadge from '@/components/common/StatusBadge';
import Alert from '@/components/common/Alert';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { ShieldCheck, FileText, CheckCircle2, XCircle, HelpCircle, Search } from 'lucide-react';

interface SchemeItem {
  slug: string;
  name: string;
  scope?: string;
  state?: string;
  description?: string;
  benefit?: string;
  metadata?: {
    benefits?: string;
    [key: string]: unknown;
  };
}

interface TreeChild {
  result?: string;
  field?: string;
  operator?: string;
  expected?: unknown;
  actual?: unknown;
}

interface EvalResult {
  status?: string;
  eligibilityDegree?: string;
  resultDegree?: string;
  matchPercentage?: number;
  matchedCriteriaPercent?: number;
  missingInformation?: string[];
  missingFields?: string[];
  details?: {
    rootRuleResult?: {
      type?: string;
      operator?: string;
      result?: string;
      children?: TreeChild[];
    };
    [key: string]: unknown;
  };
  tree?: {
    children?: TreeChild[];
  };
}

export default function EligibilityPage() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const defaultScheme = searchParams.get('scheme') || '';

  const { user } = useAuthStore();
  const [schemes, setSchemes] = useState<SchemeItem[]>([]);
  const [selectedSlug, setSelectedSlug] = useState(defaultScheme);
  const [loadingSchemes, setLoadingSchemes] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [evaluating, setEvaluating] = useState(false);
  const [evalError, setEvalError] = useState('');
  const [evalResult, setEvalResult] = useState<EvalResult | null>(null);

  const userFacts: Record<string, unknown> = {};
  if (user) {
    const keys = ['age', 'gender', 'category', 'maritalStatus', 'disabilityStatus', 'annualIncome', 'occupation', 'employmentStatus', 'state', 'district', 'block', 'ruralUrban'];
    keys.forEach((k) => {
      if (user[k] !== undefined && user[k] !== null && user[k] !== '') {
        userFacts[k] = user[k];
      }
    });
  }

  useEffect(() => {
    async function loadSchemes() {
      try {
        setLoadingSchemes(true);
        const res = await schemesApi.getSchemes();
        const list = Array.isArray(res.schemes) ? res.schemes : Array.isArray(res.data) ? res.data : [];
        setSchemes(list);
        if (list.length > 0 && !selectedSlug) {
          setSelectedSlug(list[0].slug);
        }
      } catch (err) {
        console.error('Failed to load schemes', err);
      } finally {
        setLoadingSchemes(false);
      }
    }
    loadSchemes();
  }, [selectedSlug]);

  const handleEvaluate = async () => {
    if (!selectedSlug) return;
    try {
      setEvaluating(true);
      setEvalError('');
      setEvalResult(null);

      const res = await eligibilityApi.checkEligibility(selectedSlug, userFacts);
      const evalData = res.evaluation || res.result || res.data;
      if (res.success && evalData) {
        setEvalResult(evalData);
      } else {
        setEvalError(res.message || 'Eligibility check failed.');
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      setEvalError(errorObj.response?.data?.message || 'Server error running rule engine.');
    } finally {
      setEvaluating(false);
    }
  };

  const filteredSchemes = schemes.filter((s) => {
    if (!searchQuery) return true;
    const term = searchQuery.toLowerCase().trim();
    return (
      s.name.toLowerCase().includes(term) ||
      (s.state && s.state.toLowerCase().includes(term)) ||
      (s.slug && s.slug.toLowerCase().includes(term))
    );
  });

  const currentScheme = schemes.find((s) => s.slug === selectedSlug);

  const degree = evalResult?.eligibilityDegree || evalResult?.resultDegree || evalResult?.status || 'unknown';
  const matchPercent = evalResult?.matchPercentage ?? evalResult?.matchedCriteriaPercent ?? 100;
  const missingList = evalResult?.missingInformation || evalResult?.missingFields || [];
  const treeChildren = evalResult?.tree?.children || evalResult?.details?.rootRuleResult?.children || [];

  return (
    <ProtectedRoute>
      <div>
        <Breadcrumbs />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 lg:py-14 space-y-8">
          {/* Header */}
          <div className="ux4g-card p-6 lg:p-8 bg-white dark:bg-slate-900 border-l-4 border-l-amber-600 space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 flex items-center space-x-3 tracking-tight">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-blue-900 dark:text-amber-400" />
              </div>
              <span>{t('eligibility.title')}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-normal leading-relaxed">{t('eligibility.subtitle')}</p>
          </div>

          {/* Scheme Selector Card */}
          <div className="ux4g-card p-6 lg:p-8 bg-white dark:bg-slate-900 space-y-6">
            <div className="w-full max-w-2xl space-y-3">
              <label className="block font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                {t('eligibility.selectSchemeLabel')}
              </label>

              {/* Search Filter Box */}
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Type to search schemes by name or state (e.g. Pension, Puducherry)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs sm:text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              {loadingSchemes ? (
                <div className="text-xs text-slate-500 dark:text-slate-400">Loading government schemes...</div>
              ) : (
                <div className="w-full min-w-0 max-w-full overflow-hidden">
                  <select
                    value={selectedSlug}
                    onChange={(e) => {
                      setSelectedSlug(e.target.value);
                      setEvalResult(null);
                    }}
                    className="w-full max-w-full truncate p-3 border border-slate-300 dark:border-slate-700 rounded-lg text-xs sm:text-sm bg-white dark:bg-slate-950 font-semibold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-amber-500/20"
                  >
                    {filteredSchemes.length === 0 ? (
                      <option value="">No matching schemes found</option>
                    ) : (
                      filteredSchemes.map((s) => {
                        const rawText = `${s.name} (${s.state || s.scope || 'All India'})`;
                        const truncatedText = rawText.length > 75 ? `${rawText.slice(0, 75)}...` : rawText;
                        return (
                          <option key={s.slug} value={s.slug} title={s.name}>
                            {truncatedText}
                          </option>
                        );
                      })
                    )}
                  </select>
                  {searchQuery && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 font-medium">
                      Showing {filteredSchemes.length} of {schemes.length} schemes
                    </div>
                  )}
                </div>
              )}
            </div>

            {currentScheme && (
              <div className="bg-slate-50/80 dark:bg-slate-950 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">{currentScheme.name}</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">{currentScheme.description}</p>
                <div className="pt-2">
                  <span className="font-extrabold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-md border border-emerald-200 dark:border-emerald-800">
                    Benefit: {currentScheme.benefit || (currentScheme as { metadata?: { benefits?: string } }).metadata?.benefits || 'Financial & Subsidy Welfare Support'}
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={handleEvaluate}
                disabled={evaluating || !selectedSlug}
                className="ux4g-button-saffron text-xs sm:text-sm py-3 px-6 flex items-center space-x-2.5 shadow-lg font-bold"
              >
                <ShieldCheck className="w-5 h-5 text-amber-200" />
                <span>{evaluating ? t('eligibility.evaluating') : t('eligibility.buttonEvaluate')}</span>
              </button>
            </div>
          </div>

          {evalError && <Alert type="error">{evalError}</Alert>}

          {/* Evaluation Result View */}
          {evalResult && (
            <div className="space-y-8 animate-in fade-in duration-200">
              {/* Primary Result Banner */}
              <div className="ux4g-card p-6 lg:p-8 bg-white dark:bg-slate-900">
                <div className="flex flex-wrap justify-between items-center gap-6">
                  <div className="space-y-3">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">Deterministic Engine Status</span>
                    <StatusBadge degree={degree} size="lg" />

                    <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 pt-1">
                      {t('eligibility.matchedPercent')}: <span className="font-black text-slate-900 dark:text-slate-100">{matchPercent}%</span>
                    </div>
                  </div>

                  {(degree === 'needs_more_info' || missingList.length > 0) && (
                    <div className="bg-blue-50/80 dark:bg-blue-950 p-4 rounded-xl border border-blue-200 dark:border-blue-800 text-xs sm:text-sm text-blue-900 dark:text-blue-200 max-w-sm">
                      <span className="font-bold block mb-1">Missing Attributes Required:</span>
                      <p className="text-xs">{missingList.join(', ') || 'Income, Residency'}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Explanation Tree */}
              <div className="ux4g-card p-6 lg:p-8 bg-white dark:bg-slate-900">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-4 mb-6 flex items-center space-x-2.5">
                  <FileText className="w-5 h-5 text-blue-900 dark:text-amber-400" />
                  <span>{t('eligibility.explanationTitle')}</span>
                </h2>

                <div className="space-y-3 text-xs sm:text-sm">
                  {treeChildren.length > 0 ? (
                    treeChildren.map((child: TreeChild, idx: number) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border flex items-start space-x-3.5 ${
                          child.result === 'passed'
                            ? 'bg-emerald-50/70 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                            : child.result === 'failed'
                            ? 'bg-red-50/70 dark:bg-red-950/80 border-red-200 dark:border-red-800 text-red-950 dark:text-red-200'
                            : 'bg-blue-50/70 dark:bg-blue-950/80 border-blue-200 dark:border-blue-800 text-blue-950 dark:text-blue-200'
                        }`}
                      >
                        {child.result === 'passed' && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />}
                        {child.result === 'failed' && <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />}
                        {child.result === 'unknown' && <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />}

                        <div>
                          <span className="font-bold capitalize">{child.field || 'Condition'}: </span>
                          <span>
                            Required {child.operator || 'clause'} {String(child.expected ?? '')}. Your profile: {String(child.actual ?? 'Not set')}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-semibold">
                      ✓ All mandatory scheme eligibility criteria satisfied.
                    </div>
                  )}
                </div>
              </div>

              {/* Required Documents Checklist */}
              <div className="ux4g-card p-6 lg:p-8 bg-white dark:bg-slate-900">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-4 mb-6 flex items-center space-x-2.5">
                  <FileText className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                  <span>{t('eligibility.requiredDocsTitle')}</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div className="p-4 bg-slate-50/80 dark:bg-slate-950 rounded-xl border border-slate-200/80 dark:border-slate-800 font-medium text-slate-800 dark:text-slate-200 flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Aadhaar Card (Identification)</span>
                  </div>
                  <div className="p-4 bg-slate-50/80 dark:bg-slate-950 rounded-xl border border-slate-200/80 dark:border-slate-800 font-medium text-slate-800 dark:text-slate-200 flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Income Certificate</span>
                  </div>
                  <div className="p-4 bg-slate-50/80 dark:bg-slate-950 rounded-xl border border-slate-200/80 dark:border-slate-800 font-medium text-slate-800 dark:text-slate-200 flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Bank Account Details</span>
                  </div>
                  <div className="p-4 bg-slate-50/80 dark:bg-slate-950 rounded-xl border border-slate-200/80 dark:border-slate-800 font-medium text-slate-800 dark:text-slate-200 flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Residence Proof</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
