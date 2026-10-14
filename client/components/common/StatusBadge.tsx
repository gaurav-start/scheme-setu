'use client';

import { CheckCircle2, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';

interface StatusBadgeProps {
  degree: 'fully_eligible' | 'partially_eligible' | 'ineligible' | 'needs_more_info' | string;
  size?: 'sm' | 'md' | 'lg';
}

export default function StatusBadge({ degree, size = 'md' }: StatusBadgeProps) {
  let label = degree;
  let bgClass = 'bg-slate-100 text-slate-800 border-slate-300';
  let Icon = HelpCircle;

  switch (degree) {
    case 'fully_eligible':
    case 'passed':
      label = 'You May Be Eligible';
      bgClass = 'bg-emerald-50 text-emerald-800 border-emerald-300';
      Icon = CheckCircle2;
      break;
    case 'partially_eligible':
      label = 'Partially Eligible';
      bgClass = 'bg-amber-50 text-amber-800 border-amber-300';
      Icon = AlertTriangle;
      break;
    case 'ineligible':
    case 'failed':
      label = 'You May Not Be Eligible';
      bgClass = 'bg-red-50 text-red-800 border-red-300';
      Icon = XCircle;
      break;
    case 'needs_more_info':
    case 'unknown':
      label = 'More Information Required';
      bgClass = 'bg-blue-50 text-blue-800 border-blue-300';
      Icon = HelpCircle;
      break;
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3 py-1.5 text-sm font-bold',
  }[size];

  return (
    <span className={`inline-flex items-center space-x-1.5 border rounded ${bgClass} ${sizeClasses}`}>
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{label}</span>
    </span>
  );
}
