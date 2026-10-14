'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Landmark, ShieldCheck, PhoneCall, FileText } from 'lucide-react';

export default function Footer() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t-4 border-amber-600 mt-12 text-xs">
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 border-b border-slate-800">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-white font-black text-base">
            <div className="w-6 h-6 rounded bg-amber-500 flex items-center justify-center text-slate-950 shadow">
              <Landmark className="w-4 h-4" />
            </div>
            <span>{t('common.appName')}</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">
            {t('common.appTagline')}
          </p>
          <p className="text-[11px] text-amber-400 font-bold pt-1">
            {t('common.copyright')}
          </p>
        </div>

        <div>
          <h3 className="text-white font-bold text-xs uppercase tracking-wider mb-2.5 border-b border-slate-800 pb-1">
            {t('nav.schemes')}
          </h3>
          <ul className="space-y-1.5 text-[11px] text-slate-400">
            <li><Link href={`/${locale}/schemes`} className="hover:text-amber-400 transition">Pension & Senior Citizen</Link></li>
            <li><Link href={`/${locale}/schemes`} className="hover:text-amber-400 transition">Agriculture & Farmers</Link></li>
            <li><Link href={`/${locale}/schemes`} className="hover:text-amber-400 transition">Education & Scholarships</Link></li>
            <li><Link href={`/${locale}/schemes`} className="hover:text-amber-400 transition">Healthcare & Medical</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-bold text-xs uppercase tracking-wider mb-2.5 border-b border-slate-800 pb-1">
            Citizen Assistance
          </h3>
          <ul className="space-y-2 text-[11px] text-slate-400">
            <li className="flex items-center space-x-2">
              <PhoneCall className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{t('common.helpline')}</span>
            </li>
            <li className="flex items-center space-x-2">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>CSC Operator Support</span>
            </li>
            <li className="flex items-center space-x-2">
              <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Official Verification Guidelines</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-bold text-xs uppercase tracking-wider mb-2.5 border-b border-slate-800 pb-1">
            Important Notice
          </h3>
          <p className="text-[11px] text-slate-400 leading-normal">
            {t('common.officialDisclaimer')}
          </p>
        </div>
      </div>

      <div className="bg-slate-950 py-2.5 px-4 text-center text-[11px] text-slate-400 flex flex-wrap justify-between items-center max-w-7xl mx-auto gap-2">
        <span>Smart India Hackathon SIH 2026 • Ministry of Social Justice & Empowerment</span>
        <span>Content Managed by Scheme Setu Governance Team</span>
      </div>
    </footer>
  );
}
