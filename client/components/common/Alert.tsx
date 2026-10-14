'use client';

import { ReactNode } from 'react';
import { Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface AlertProps {
  type?: 'info' | 'warning' | 'success' | 'error';
  title?: string;
  children: ReactNode;
}

export default function Alert({ type = 'info', title, children }: AlertProps) {
  const config = {
    info: {
      bg: 'bg-blue-50 border-blue-600 text-blue-900',
      icon: Info,
      iconColor: 'text-blue-700',
    },
    warning: {
      bg: 'bg-amber-50 border-amber-600 text-amber-900',
      icon: AlertTriangle,
      iconColor: 'text-amber-700',
    },
    success: {
      bg: 'bg-emerald-50 border-emerald-600 text-emerald-900',
      icon: CheckCircle,
      iconColor: 'text-emerald-700',
    },
    error: {
      bg: 'bg-red-50 border-red-600 text-red-900',
      icon: XCircle,
      iconColor: 'text-red-700',
    },
  }[type];

  const Icon = config.icon;

  return (
    <div className={`p-4 border-l-4 rounded-r shadow-xs ${config.bg}`}>
      <div className="flex items-start space-x-3">
        <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${config.iconColor}`} />
        <div className="text-xs sm:text-sm leading-relaxed">
          {title && <h4 className="font-bold mb-1">{title}</h4>}
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}
