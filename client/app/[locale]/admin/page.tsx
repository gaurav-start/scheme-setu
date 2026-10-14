'use client';

import Breadcrumbs from '@/components/layout/Breadcrumbs';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Shield, Plus, FileCode, GitBranch } from 'lucide-react';

export default function AdminPortalPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div>
        <Breadcrumbs />

        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          {/* Header */}
          <div className="ux4g-card p-6 bg-white border-l-4 border-l-red-700">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                  <Shield className="w-6 h-6 text-red-700" />
                  <span>Scheme Setu Admin & Rule Engine Portal</span>
                </h1>
                <p className="text-xs text-slate-600 mt-1">
                  Manage government scheme definitions, publish versioned RuleSets, and audit deterministic tree rules.
                </p>
              </div>

              <span className="px-3 py-1 bg-red-100 text-red-900 rounded font-bold text-xs">
                Role: System Administrator
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="ux4g-card p-5 space-y-2">
              <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                <Plus className="w-4 h-4 text-blue-900" />
                <span>Create New Government Scheme</span>
              </h3>
              <p className="text-xs text-slate-600">Register new scheme metadata, scope, and documents required.</p>
            </div>

            <div className="ux4g-card p-5 space-y-2">
              <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                <GitBranch className="w-4 h-4 text-amber-700" />
                <span>Versioned RuleSet Management</span>
              </h3>
              <p className="text-xs text-slate-600">Draft and activate versioned AND/OR/NOT evaluation trees.</p>
            </div>

            <div className="ux4g-card p-5 space-y-2">
              <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                <FileCode className="w-4 h-4 text-emerald-700" />
                <span>Rule Engine Test Workbench</span>
              </h3>
              <p className="text-xs text-slate-600">Dry-run rule logic against mock citizen facts prior to activation.</p>
            </div>
          </div>

          {/* Visual Rule Builder Preview */}
          <div className="ux4g-card p-6 bg-white space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
              Active Rule Tree Visualizer (IGNOAPS v1.0.0)
            </h2>

            <div className="bg-slate-900 text-slate-100 p-4 rounded text-xs font-mono space-y-2 border border-slate-700">
              <div className="text-amber-400 font-bold">LOGICAL_AND:</div>
              <div className="pl-4 text-emerald-400">├── Condition 1: age ≥ 60 (Operator: gte)</div>
              <div className="pl-4 text-emerald-400">├── Condition 2: annualIncome ≤ 300000 (Operator: lte)</div>
              <div className="pl-4 text-amber-400 font-bold">└── LOGICAL_OR:</div>
              <div className="pl-8 text-emerald-400">├── Clause A: category = SC</div>
              <div className="pl-8 text-emerald-400">└── Clause B: category = ST</div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
