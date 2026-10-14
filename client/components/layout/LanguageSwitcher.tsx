'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { Globe, Search, Check, X, Languages } from 'lucide-react';
import { locales } from '@/i18n/routing';

export interface LanguageItem {
  code: string;
  name: string;
  nativeName: string;
  region?: string;
}

export const LANGUAGES: LanguageItem[] = [
  { code: 'en', name: 'English', nativeName: 'English', region: 'India / Global' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', region: 'North & Central India' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', region: 'Assam' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', region: 'West Bengal & Tripura' },
  { code: 'brx', name: 'Bodo', nativeName: 'बड़ो', region: 'Assam (Bodoland)' },
  { code: 'doi', name: 'Dogri', nativeName: 'डोगरी', region: 'Jammu & Kashmir' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', region: 'Gujarat' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', region: 'Karnataka' },
  { code: 'ks', name: 'Kashmiri', nativeName: 'کٲشُر / कश्मीरी', region: 'Jammu & Kashmir' },
  { code: 'kok', name: 'Konkani', nativeName: 'कोंकणी', region: 'Goa & West Coast' },
  { code: 'mai', name: 'Maithili', nativeName: 'मैथिली', region: 'Bihar' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', region: 'Kerala & Lakshadweep' },
  { code: 'mni', name: 'Manipuri', nativeName: 'ꯃꯩꯇꯩꯂꯣꯟ', region: 'Manipur' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', region: 'Maharashtra' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', region: 'Sikkim & West Bengal' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', region: 'Odisha' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', region: 'Punjab' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', region: 'Classical Language' },
  { code: 'sat', name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ', region: 'Jharkhand & Odisha' },
  { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي / सिन्धी', region: 'Sindhi Diaspora' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', region: 'Tamil Nadu & Puducherry' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', region: 'Andhra Pradesh & Telangana' },
  { code: 'ur', name: 'Urdu', nativeName: 'اُردُو', region: 'Pan-India' },
];

export default function LanguageSwitcher() {
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeLang = LANGUAGES.find((l) => l.code === currentLocale) || LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const switchLocale = (newLocale: string) => {
    if (newLocale === currentLocale) {
      setIsOpen(false);
      return;
    }

    const segments = pathname.split('/');
    // Check if segment 1 is any of the known supported locales
    if ((locales as readonly string[]).includes(segments[1])) {
      segments[1] = newLocale;
    } else {
      segments.unshift(newLocale);
    }
    const newPath = segments.join('/') || `/${newLocale}`;
    setIsOpen(false);
    router.push(newPath);
  };

  const filteredLanguages = LANGUAGES.filter(
    (lang) =>
      lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lang.region && lang.region.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 text-[11px] font-bold transition-all shadow-xs group"
        aria-label="Select Portal Language"
        aria-expanded={isOpen}
      >
        <Globe className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
        <span className="max-w-[90px] truncate">{activeLang.nativeName}</span>
        <span className="text-[9px] uppercase tracking-wider px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/30">
          {activeLang.code}
        </span>
      </button>

      {/* Modal / Dropdown Dialog */}
      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-[320px] sm:w-[380px] bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-50 overflow-hidden backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
                <Languages className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-100"> Select Portal Language</h3>
                <p className="text-[10px] text-slate-400">22 Official Scheduled Languages + English</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search Box */}
          <div className="p-2.5 bg-slate-900 border-b border-slate-800">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search language (e.g. தமிழ், हिन्दी, Bengali)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full bg-slate-950 border border-slate-700 rounded pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
              />
            </div>
          </div>

          {/* Languages List */}
          <div className="max-h-[300px] overflow-y-auto p-1.5 space-y-1 divide-y divide-slate-800/40">
            {filteredLanguages.length > 0 ? (
              filteredLanguages.map((lang) => {
                const isActive = lang.code === currentLocale;
                return (
                  <button
                    key={lang.code}
                    onClick={() => switchLocale(lang.code)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md flex items-center justify-between transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/40 text-amber-300 font-bold'
                        : 'text-slate-200 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <span className="w-6 text-center text-[10px] uppercase font-black px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                        {lang.code}
                      </span>
                      <div className="truncate">
                        <div className="text-xs font-semibold flex items-center space-x-1.5">
                          <span className="text-slate-100">{lang.nativeName}</span>
                          <span className="text-[10.5px] text-slate-400 font-normal">({lang.name})</span>
                        </div>
                        {lang.region && (
                          <div className="text-[9.5px] text-slate-500 truncate">{lang.region}</div>
                        )}
                      </div>
                    </div>
                    {isActive && <Check className="w-4 h-4 text-amber-400 shrink-0 ml-2" />}
                  </button>
                );
              })
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                No matching language found.
              </div>
            )}
          </div>

          {/* Footer Note */}
          <div className="px-3 py-1.5 bg-slate-950 border-t border-slate-800 text-[9.5px] text-slate-400 text-center font-medium">
            Smart India Hackathon (SIH 2026) Multilingual Initiative
          </div>
        </div>
      )}
    </div>
  );
}
