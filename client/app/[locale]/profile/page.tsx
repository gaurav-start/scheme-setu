'use client';

import { toast } from 'sonner';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { profileApi } from '@/lib/api/profile';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import Modal from '@/components/common/Modal';
import Alert from '@/components/common/Alert';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Sparkles, Save, User, DollarSign, MapPin, CheckCircle2, Camera, Trash2, AlertTriangle } from 'lucide-react';

interface AiExtractionResult {
  extracted: Record<string, unknown>;
  missingFields: string[];
  conflicts: Array<{ field: string; values: unknown[] }>;
}

export default function ProfilePage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const { user, setUser, logout } = useAuthStore();

  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');

  // AI Fill Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiText, setAiText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiResult, setAiResult] = useState<AiExtractionResult | null>(null);

  // Selected values for conflicts
  const [selectedResolutions, setSelectedResolutions] = useState<Record<string, unknown>>({});
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    try {
      setUploadingAvatar(true);
      toast.loading('Uploading profile picture to Cloudinary...', { id: 'avatar-upload' });
      const res = await profileApi.uploadAvatar(file);
      if (res.success && res.user) {
        setUser(res.user);
        toast.success('Profile picture updated & stored on Cloudinary!', { id: 'avatar-upload' });
      } else {
        toast.error(res.message || 'Failed to upload avatar.', { id: 'avatar-upload' });
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      const msg = errorObj.response?.data?.message || 'Avatar upload failed. Please try again.';
      toast.error(msg, { id: 'avatar-upload' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Delete Account State & Handler
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleDeleteAccount = async () => {
    if (confirmEmail.trim().toLowerCase() !== (user?.email || '').trim().toLowerCase()) {
      setDeleteError('Email confirmation does not match your account email.');
      return;
    }

    try {
      setDeleteLoading(true);
      setDeleteError('');
      toast.loading('Deleting account...', { id: 'delete-account' });
      const res = await profileApi.deleteAccount(confirmEmail.trim());
      if (res.success) {
        toast.success('Your account has been permanently deleted.', { id: 'delete-account' });
        await logout();
        router.replace(`/${locale}/login`);
      } else {
        setDeleteError(res.message || 'Account deletion failed.');
        toast.error(res.message || 'Account deletion failed.', { id: 'delete-account' });
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      const msg = errorObj.response?.data?.message || 'Account deletion failed. Please try again.';
      setDeleteError(msg);
      toast.error(msg, { id: 'delete-account' });
    } finally {
      setDeleteLoading(false);
    }
  };

  const getFieldValue = (field: string) => {
    const val = formData[field] ?? user?.[field];
    return val !== undefined && val !== null ? val : '';
  };

  const handleInputChange = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async (dataToSave?: Record<string, unknown>) => {
    const payload = dataToSave || formData;
    try {
      setSaveLoading(true);
      setSaveError('');
      setSaveSuccess('');
      toast.loading('Saving profile changes...', { id: 'save-profile' });

      // Clean empty string or numeric fields
      const cleaned: Record<string, unknown> = {};
      Object.keys(payload).forEach((k) => {
        if (payload[k] !== '' && payload[k] !== null && payload[k] !== undefined) {
          if (['age', 'annualIncome'].includes(k)) {
            cleaned[k] = Number(payload[k]);
          } else {
            cleaned[k] = payload[k];
          }
        }
      });

      const res = await profileApi.updateProfile(cleaned);
      if (res.success && res.user) {
        setUser(res.user);
        const msg = t('profile.savedSuccess');
        setSaveSuccess(msg);
        toast.success(msg, { id: 'save-profile' });
      } else {
        const msg = res.message || 'Failed to update profile.';
        setSaveError(msg);
        toast.error(msg, { id: 'save-profile' });
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      const msg = errorObj.response?.data?.message || 'Server error updating profile.';
      setSaveError(msg);
      toast.error(msg, { id: 'save-profile' });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleAiExtract = async () => {
    if (!aiText.trim()) return;
    try {
      setAiLoading(true);
      setAiError('');
      setAiResult(null);
      toast.loading('Extracting facts using AI...', { id: 'ai-fill' });

      const res = await profileApi.aiFill(aiText);
      const extracted = res.data?.extracted || res.extracted;
      const missingFields = res.data?.missingFields || res.missingFields || [];
      const conflicts = res.data?.conflicts || res.conflicts || [];

      if (res.success && extracted) {
        const resultData: AiExtractionResult = {
          extracted,
          missingFields,
          conflicts,
        };
        setAiResult(resultData);

        const initialResolutions: Record<string, unknown> = { ...extracted };
        if (resultData.conflicts) {
          resultData.conflicts.forEach((c) => {
            initialResolutions[c.field] = c.values[c.values.length - 1];
          });
        }
        setSelectedResolutions(initialResolutions);
        toast.success('AI extraction complete! Review facts below.', { id: 'ai-fill' });
      } else {
        const msg = res.message || 'Could not extract facts from text.';
        setAiError(msg);
        toast.error(msg, { id: 'ai-fill' });
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      const msg = errorObj.response?.data?.message || 'AI extraction failed.';
      setAiError(msg);
      toast.error(msg, { id: 'ai-fill' });
    } finally {
      setAiLoading(false);
    }
  };

  const handleConfirmAiExtraction = async () => {
    if (!aiResult) return;
    const merged = { ...formData, ...aiResult.extracted, ...selectedResolutions };
    setFormData(merged);
    await handleSaveProfile(merged);
    setIsAiModalOpen(false);
    setAiResult(null);
    setAiText('');
  };

  return (
    <ProtectedRoute>
      <div>
        <Breadcrumbs />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 lg:py-14 space-y-8">
        {/* Header & AI Banner */}
        <div className="ux4g-card p-6 lg:p-8 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-l-4 border-l-amber-500 shadow-md">
          <div className="flex items-center space-x-4">
            <div className="relative group shrink-0">
              {user?.avatar ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={user.avatar}
                  alt={user.name || 'User Avatar'}
                  className="w-16 h-16 rounded-full object-cover border-2 border-amber-500 shadow shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-900 to-slate-800 text-amber-400 font-black text-xl flex items-center justify-center border-2 border-amber-500 shadow shrink-0">
                  {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                </div>
              )}

              <label
                htmlFor="profile-avatar-upload"
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center cursor-pointer shadow-md border-2 border-white transition-transform group-hover:scale-105"
                title="Upload custom avatar image to Cloudinary"
              >
                {uploadingAvatar ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Camera className="w-3.5 h-3.5 text-slate-950" />
                )}
                <input
                  id="profile-avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  disabled={uploadingAvatar}
                />
              </label>
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {user?.name || t('profile.title')}
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300">
                  {user?.role || 'Citizen'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-normal">
                {user?.email ? `${user.email} • ${t('profile.subtitle')}` : t('profile.subtitle')}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAiModalOpen(true)}
            className="ux4g-button-saffron text-xs sm:text-sm py-3 px-5 flex items-center space-x-2.5 shadow-lg shrink-0 font-bold"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>{t('common.fillUsingAI')}</span>
          </button>
        </div>

        {saveSuccess && <Alert type="success">{saveSuccess}</Alert>}
        {saveError && <Alert type="error">{saveError}</Alert>}

        {/* Form Sections */}
        <div className="space-y-8">
          {/* Personal Details */}
          <div className="ux4g-card p-6 lg:p-8 space-y-6">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center space-x-2.5">
              <User className="w-5 h-5 text-blue-900" />
              <span>{t('profile.personalCategory')}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs sm:text-sm">
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">Full Name</label>
                <input
                  type="text"
                  value={String(getFieldValue('name'))}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">Age (Years)</label>
                <input
                  type="number"
                  value={String(getFieldValue('age'))}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">Gender</label>
                <select
                  value={String(getFieldValue('gender'))}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">Social Category</label>
                <select
                  value={String(getFieldValue('category'))}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="">Select Category</option>
                  <option value="General">General</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">Marital Status</label>
                <select
                  value={String(getFieldValue('maritalStatus'))}
                  onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="">Select Status</option>
                  <option value="unmarried">Unmarried / Single</option>
                  <option value="married">Married</option>
                  <option value="widowed">Widowed</option>
                  <option value="divorced">Divorced</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">Disability Status</label>
                <select
                  value={String(getFieldValue('disabilityStatus'))}
                  onChange={(e) => handleInputChange('disabilityStatus', e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="none">No Disability</option>
                  <option value="locomotor">Locomotor</option>
                  <option value="visual">Visual Impairment</option>
                  <option value="hearing">Hearing Impairment</option>
                  <option value="other">Other Disability</option>
                </select>
              </div>
            </div>
          </div>

          {/* Economic Details */}
          <div className="ux4g-card p-6 lg:p-8 space-y-6">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center space-x-2.5">
              <DollarSign className="w-5 h-5 text-emerald-700" />
              <span>{t('profile.economicCategory')}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs sm:text-sm">
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">Annual Family Income (₹)</label>
                <input
                  type="number"
                  placeholder="250000"
                  value={String(getFieldValue('annualIncome'))}
                  onChange={(e) => handleInputChange('annualIncome', e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">Occupation</label>
                <input
                  type="text"
                  placeholder="Farmer, Student, Worker..."
                  value={String(getFieldValue('occupation'))}
                  onChange={(e) => handleInputChange('occupation', e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">Employment Status</label>
                <select
                  value={String(getFieldValue('employmentStatus'))}
                  onChange={(e) => handleInputChange('employmentStatus', e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="">Select Status</option>
                  <option value="employed">Employed</option>
                  <option value="self_employed">Self Employed</option>
                  <option value="unemployed">Unemployed</option>
                  <option value="retired">Retired</option>
                </select>
              </div>
            </div>
          </div>

          {/* Location & Residence */}
          <div className="ux4g-card p-6 lg:p-8 space-y-6">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center space-x-2.5">
              <MapPin className="w-5 h-5 text-amber-600" />
              <span>{t('profile.locationCategory')}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 text-xs sm:text-sm">
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">State</label>
                <input
                  type="text"
                  placeholder="Uttar Pradesh..."
                  value={String(getFieldValue('state'))}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">District</label>
                <input
                  type="text"
                  placeholder="Lucknow..."
                  value={String(getFieldValue('district'))}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">Block / Tehsil</label>
                <input
                  type="text"
                  value={String(getFieldValue('block'))}
                  onChange={(e) => handleInputChange('block', e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">Area Type</label>
                <select
                  value={String(getFieldValue('ruralUrban'))}
                  onChange={(e) => handleInputChange('ruralUrban', e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="">Select Area</option>
                  <option value="rural">Rural</option>
                  <option value="urban">Urban</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => handleSaveProfile()}
              disabled={saveLoading}
              className="ux4g-button-primary text-xs sm:text-sm py-3 px-8 flex items-center space-x-2.5 shadow-lg font-bold"
            >
              <Save className="w-4 h-4" />
              <span>{saveLoading ? 'Saving Profile...' : 'Save Profile Changes'}</span>
            </button>
          </div>

          {/* Danger Zone: Permanent Account Deletion */}
          <div className="ux4g-card p-6 lg:p-8 bg-red-50/50 border border-red-200 rounded-xl space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-red-900 flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span>Danger Zone</span>
                </h3>
                <p className="text-xs sm:text-sm text-red-700">
                  Permanently erase your account, verified facts, and citizen eligibility records from SchemeSetu.
                </p>
              </div>

              <button
                onClick={() => {
                  setConfirmEmail('');
                  setDeleteError('');
                  setIsDeleteModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow flex items-center space-x-2 shrink-0 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Account</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Extraction Modal */}
      <Modal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        title={t('aiFill.modalTitle')}
      >
        <div className="space-y-5 p-2">
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {t('aiFill.modalDescription')}
          </p>

          <Alert type="info" title="AI Extraction Boundary">
            {t('aiFill.disclaimer')}
          </Alert>

          {aiError && <Alert type="error">{aiError}</Alert>}

          <div className="space-y-2">
            <label className="block font-bold text-xs sm:text-sm text-slate-800">
              {t('aiFill.inputLabel')}
            </label>
            <textarea
              rows={4}
              placeholder={t('aiFill.inputPlaceholder')}
              value={aiText}
              onChange={(e) => setAiText(e.target.value)}
              className="w-full p-3.5 border border-slate-300 rounded-lg text-xs sm:text-sm leading-relaxed focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleAiExtract}
              disabled={aiLoading || !aiText.trim()}
              className="ux4g-button-saffron text-xs sm:text-sm py-2.5 px-5 flex items-center space-x-2 font-bold shadow"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>{aiLoading ? t('aiFill.extractingStatus') : t('aiFill.buttonExtract')}</span>
            </button>
          </div>

          {/* AI Result Preview Table */}
          {aiResult && (
            <div className="mt-6 border-t border-slate-200 pt-5 space-y-4">
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{t('aiFill.previewTitle')}</span>
              </h4>

              {/* Conflicts Banner */}
              {aiResult.conflicts && aiResult.conflicts.length > 0 && (
                <Alert type="warning" title={t('aiFill.conflictAlertTitle')}>
                  {t('aiFill.conflictAlertDesc')}
                </Alert>
              )}

              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">{t('aiFill.tableField')}</th>
                      <th className="p-3">{t('aiFill.tableCurrent')}</th>
                      <th className="p-3">{t('aiFill.tableDetected')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {Object.keys(aiResult.extracted).map((field) => (
                      <tr key={field} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-800 capitalize">{field}</td>
                        <td className="p-3 text-slate-500">{String(getFieldValue(field) || 'Not set')}</td>
                        <td className="p-3 font-bold text-emerald-700">
                          {String(aiResult.extracted[field])}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  onClick={() => setAiResult(null)}
                  className="ux4g-button-secondary text-xs sm:text-sm py-2.5 px-4"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAiExtraction}
                  className="ux4g-button-primary text-xs sm:text-sm py-2.5 px-5 font-bold flex items-center space-x-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('aiFill.confirmButton')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Delete Account Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Permanent Account Deletion"
      >
        <div className="space-y-5 p-2">
          <div className="flex items-start space-x-3 p-3 bg-red-100/80 border border-red-300 rounded-lg text-red-900">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm font-semibold">
              Warning: This action is permanent and cannot be undone. Your user profile, avatar, and scheme eligibility records will be deleted immediately.
            </p>
          </div>

          {deleteError && <Alert type="error">{deleteError}</Alert>}

          <div className="space-y-2">
            <label className="block font-bold text-xs sm:text-sm text-slate-800">
              To confirm deletion, please type your email address (<span className="text-amber-800 font-extrabold select-all">{user?.email}</span>):
            </label>
            <input
              type="email"
              value={confirmEmail}
              onChange={(e) => {
                setConfirmEmail(e.target.value);
                setDeleteError('');
              }}
              placeholder={user?.email || 'Enter your email'}
              className="w-full p-2.5 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={deleteLoading || confirmEmail.trim().toLowerCase() !== (user?.email || '').trim().toLowerCase()}
              className="px-5 py-2 text-xs sm:text-sm font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow transition-all flex items-center space-x-2 cursor-pointer"
            >
              {deleteLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Confirm Account Deletion</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
    </ProtectedRoute>
  );
}
