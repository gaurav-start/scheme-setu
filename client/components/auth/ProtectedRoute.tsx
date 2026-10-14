'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useAuthStore } from '@/lib/store/useAuthStore';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: Array<'citizen' | 'csc_operator' | 'ngo_worker' | 'admin'>;
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const locale = useLocale();
  const { user, isAuthenticated, isLoading, fetchUser } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        router.replace(`/${locale}/login`);
      } else if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        router.replace(`/${locale}/dashboard`);
      }
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, router, locale]);

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-[65vh] flex flex-col items-center justify-center space-y-4 p-8">
        <LoadingSpinner size="lg" />
        <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest animate-pulse">
          Authenticating Citizen SSO Credentials...
        </p>
      </div>
    );
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
