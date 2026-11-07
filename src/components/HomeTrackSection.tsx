import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Search, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

interface HomeTrackSectionProps {
  onTrack: (reference: string, emailOrPhone?: string) => void;
}

export const HomeTrackSection: React.FC<HomeTrackSectionProps> = ({ onTrack }) => {
  const { t, direction } = useLanguage();
  const [reference, setReference] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reference.trim()) return;
    onTrack(reference.trim().toUpperCase(), emailOrPhone.trim());
  };

  return (
    <section className="py-12 bg-gradient-to-b from-[#FBF9F5] to-[#F3EFEA] border-t border-b border-[#EAE4D9]/80" dir={direction}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-[#0D1B2A] rounded-3xl p-6 sm:p-10 text-white shadow-xl border border-[#D4AF37]/40 relative overflow-hidden">
          {/* Subtle gold ambient glow */}
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#D4AF37]/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-[#D4AF37]/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 uppercase tracking-widest mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Real-Time Reservation Status</span>
            </span>

            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-white mb-2">
              {t('home.trackTitle')}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto mb-6">
              {t('home.trackSubtitle')}
            </p>

            {/* Quick Track Input Bar */}
            <form
              onSubmit={handleSubmit}
              className="bg-white/10 backdrop-blur-md p-2 sm:p-3 rounded-2xl border border-white/20 shadow-lg flex flex-col sm:flex-row gap-2.5"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  required
                  value={reference}
                  onChange={(e) => setReference(e.target.value.toUpperCase())}
                  placeholder={t('home.trackRefPlaceholder')}
                  className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-3 rounded-xl bg-white text-slate-900 text-xs sm:text-sm font-mono placeholder:font-sans placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#D4AF37]"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-3.5" />
              </div>

              <div className="relative flex-1">
                <input
                  type="text"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder={t('home.trackContactPlaceholder')}
                  className="w-full px-3.5 py-3 rounded-xl bg-white text-slate-900 text-xs sm:text-sm placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#D4AF37]"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38926] text-[#0D1B2A] font-bold text-xs sm:text-sm hover:brightness-110 shadow-md transition cursor-pointer shrink-0"
              >
                <span>{t('home.trackBtn')}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </form>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                Live Driver Assignment
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                Flight Monitoring
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                {t('home.trackSecurityNote')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
