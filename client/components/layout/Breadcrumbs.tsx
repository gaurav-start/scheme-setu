'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbsProps {
  customCrumbs?: Array<{ label: string; href?: string }>;
}

export default function Breadcrumbs({ customCrumbs }: BreadcrumbsProps) {
  const pathname = usePathname();
  const locale = useLocale();

  if (customCrumbs) {
    return (
      <nav aria-label="Breadcrumb" className="bg-slate-200/80 dark:bg-slate-900/90 border-b border-slate-300 dark:border-slate-800 py-1.5 px-4 text-xs font-semibold">
        <div className="max-w-7xl mx-auto flex items-center space-x-2 text-slate-700 dark:text-slate-300">
          <Link href={`/${locale}`} className="hover:text-blue-900 dark:hover:text-amber-400 flex items-center space-x-1">
            <Home className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            <span>Home</span>
          </Link>
          {customCrumbs.map((crumb, idx) => (
            <div key={idx} className="flex items-center space-x-2">
              <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-500" />
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-blue-900 dark:hover:text-amber-400">
                  {crumb.label}
                </Link>
              ) : (
                <span className="font-bold text-slate-900 dark:text-slate-100">{crumb.label}</span>
              )}
            </div>
          ))}
        </div>
      </nav>
    );
  }

  const segments = pathname
    .split('/')
    .filter((s) => s && s !== 'en' && s !== 'hi');

  return (
    <nav aria-label="Breadcrumb" className="bg-slate-200/80 dark:bg-slate-900/90 border-b border-slate-300 dark:border-slate-800 py-1.5 px-4 text-xs font-semibold">
      <div className="max-w-7xl mx-auto flex items-center space-x-2 text-slate-700 dark:text-slate-300">
        <Link href={`/${locale}`} className="hover:text-blue-900 dark:hover:text-amber-400 flex items-center space-x-1">
          <Home className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
          <span>Home</span>
        </Link>

        {segments.map((segment, idx) => {
          const href = `/${locale}/${segments.slice(0, idx + 1).join('/')}`;
          const isLast = idx === segments.length - 1;
          const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');

          return (
            <div key={href} className="flex items-center space-x-2">
              <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-500" />
              {isLast ? (
                <span className="font-bold text-slate-900 dark:text-slate-100">{label}</span>
              ) : (
                <Link href={href} className="hover:text-blue-900 dark:hover:text-amber-400">
                  {label}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
