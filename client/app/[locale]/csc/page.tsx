'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { UserCheck, Search, Users, PlusCircle } from 'lucide-react';

export default function CSCOperatorPage() {
  const locale = useLocale();
  const [searchCitizen, setSearchCitizen] = useState('');

  return (
    <ProtectedRoute allowedRoles={['csc_operator', 'admin']}>
      <div>
        <Breadcrumbs />

        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          {/* Header */}
          <div className="ux4g-card p-6 bg-white border-l-4 border-l-blue-800">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                  <UserCheck className="w-6 h-6 text-blue-900" />
                  <span>Common Service Centre (CSC) Operator Portal</span>
                </h1>
                <p className="text-xs text-slate-600 mt-1">
                  Assist local citizens with profile creation, AI natural language extraction, and scheme eligibility verification.
                </p>
              </div>

              <div className="px-3 py-1 bg-blue-100 text-blue-900 rounded font-bold text-xs">
                CSC Center ID: CSC-UP-LKO-042
              </div>
            </div>
          </div>

          {/* Citizen Search & Assistance Actions */}
          <div className="ux4g-card p-6 bg-white space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-900" />
              <span>Search & Assist Citizen</span>
            </h2>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search citizen by email, phone, or name..."
                  value={searchCitizen}
                  onChange={(e) => setSearchCitizen(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded text-xs"
                />
              </div>

              <Link
                href={`/${locale}/profile`}
                className="ux4g-button-primary text-xs py-2 px-4 flex items-center space-x-1 justify-center shrink-0"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create / AI Fill New Profile</span>
              </Link>
            </div>
          </div>

          {/* Assigned Citizen Worklist */}
          <div className="ux4g-card p-6">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-3 mb-4">
              Recent Citizen Cases & Eligibility Checks
            </h2>

            <div className="overflow-x-auto border border-slate-200 rounded">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Citizen Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Location</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">Rishabh Sharma</td>
                    <td className="p-3">OBC</td>
                    <td className="p-3">Lucknow, UP</td>
                    <td className="p-3">
                      <Link href={`/${locale}/eligibility`} className="text-blue-900 font-bold hover:underline">
                        Run Check →
                      </Link>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">Sunita Devi</td>
                    <td className="p-3">SC</td>
                    <td className="p-3">Kanpur, UP</td>
                    <td className="p-3">
                      <Link href={`/${locale}/eligibility`} className="text-blue-900 font-bold hover:underline">
                        Run Check →
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
