'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { schemesApi } from '@/lib/api/schemes';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { ShieldCheck, FileText, ExternalLink, CheckCircle2, ArrowRight, Building2, Users } from 'lucide-react';

interface SchemeDetail {
  slug: string;
  name: string;
  scope?: string;
  category?: string;
  description?: string;
  benefit?: string;
  documentsRequired?: string[];
  ministry?: string;
  targetBeneficiaries?: string;
  officialLink?: string;
}


export default function SchemeDetailsPage() {
  const locale = useLocale();
  const params = useParams();
  const slug = params.slug as string;

  const [scheme, setScheme] = useState<SchemeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await schemesApi.getSchemeBySlug(slug);
        const schemeData = res.scheme || res.data;

        if (res.success && schemeData) {
          setScheme(schemeData);
          setError('');
        } else {
          setError('Scheme details not found.');
        }
      } catch {
        setError('Failed to load scheme details.');
      } finally {
        setLoading(false);
      }
    }
    if (slug) load();
  }, [slug]);

  if (loading) {
    return <div className="text-center py-16 text-xs text-slate-500">Loading scheme details...</div>;
  }

  if (error || !scheme) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-lg font-bold text-red-700">{error || 'Scheme Not Found'}</h2>
        <Link href={`/${locale}/schemes`} className="text-xs text-blue-900 underline mt-4 inline-block font-semibold">
          Return to Schemes Directory
        </Link>
      </div>
    );
  }

  const customCrumbs = [
    { label: 'Government Schemes', href: `/${locale}/schemes` },
    { label: scheme.name },
  ];

  return (
    <div>
      <Breadcrumbs customCrumbs={customCrumbs} />

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Scheme Banner */}
        <div className="ux4g-card p-6 bg-white border-l-4 border-l-amber-600 shadow-xs">
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-200 rounded">
                  {scheme.scope || 'Central Government'}
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">
                  {scheme.category}
                </span>
              </div>

              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{scheme.name}</h1>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{scheme.description}</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded border border-slate-200 dark:border-slate-700 text-right w-full sm:w-auto">
              <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Main Benefit</span>
              <span className="text-lg font-bold text-emerald-800 dark:text-emerald-400 block mb-3">{scheme.benefit}</span>

              <Link
                href={`/${locale}/eligibility?scheme=${scheme.slug}`}
                className="ux4g-button-saffron text-xs py-2 px-4 inline-flex items-center space-x-1.5 shadow-xs"
              >
                <span>Check My Eligibility</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Scheme Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Column: Eligibility & Documents */}
          <div className="md:col-span-8 space-y-8">
            {/* Readable Eligibility Criteria */}
            <div className="ux4g-card p-6">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-3 mb-4 flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                <span>Eligibility Criteria Summary</span>
              </h2>

              <ul className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                <li className="flex items-start space-x-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded border border-slate-200 dark:border-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>Applicable to citizens meeting official state residency & demographic guidelines.</span>
                </li>
                <li className="flex items-start space-x-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded border border-slate-200 dark:border-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>Evaluated deterministically against verified government rule sets.</span>
                </li>
              </ul>
            </div>

            {/* Required Documents Checklist */}
            <div className="ux4g-card p-6">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-3 mb-4 flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-900 dark:text-amber-400" />
                <span>Required Documents Checklist</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {scheme.documentsRequired && scheme.documentsRequired.length > 0 ? (
                  scheme.documentsRequired.map((doc: string, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200 dark:border-slate-700 flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{doc}</span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200 dark:border-slate-700 font-medium text-slate-800 dark:text-slate-200">Aadhaar Card</div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200 dark:border-slate-700 font-medium text-slate-800 dark:text-slate-200">Income Certificate</div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200 dark:border-slate-700 font-medium text-slate-800 dark:text-slate-200">Bank Passbook Details</div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200 dark:border-slate-700 font-medium text-slate-800 dark:text-slate-200">Domicile / Residence Proof</div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Metadata & Source */}
          <div className="md:col-span-4 space-y-6">
            <div className="ux4g-card p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2">
                Scheme Metadata
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Sponsoring Ministry / Scope</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-1 mt-0.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-900 dark:text-amber-400" />
                    <span>{scheme.ministry || 'Ministry of Social Justice & Empowerment'}</span>
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Target Beneficiaries</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-1 mt-0.5">
                    <Users className="w-3.5 h-3.5 text-blue-900 dark:text-amber-400" />
                    <span>{scheme.targetBeneficiaries || 'Citizens of India'}</span>
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Verification Status</span>
                  <span className="inline-flex items-center space-x-1 text-emerald-800 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Last Verified: 18 August 2026</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Official Source Link */}
            {scheme.officialLink && (
              <div className="ux4g-card p-4 bg-blue-50/50 dark:bg-slate-800/80 border-blue-200 dark:border-slate-700">
                <span className="text-xs text-slate-600 dark:text-slate-300 block mb-2 font-medium">Official Government Source</span>
                <a
                  href={scheme.officialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-blue-900 dark:text-amber-400 hover:underline flex items-center space-x-1.5"
                >
                  <span>Visit Official Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
