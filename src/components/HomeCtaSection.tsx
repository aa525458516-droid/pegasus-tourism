import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Car, Compass, Sliders, Search, ArrowRight, ShieldCheck, Clock } from 'lucide-react';

interface HomeCtaSectionProps {
  onOpenBooking: (serviceType?: string) => void;
  onOpenCustomTrip?: () => void;
  onTrackBooking?: () => void;
}

export const HomeCtaSection: React.FC<HomeCtaSectionProps> = ({
  onOpenBooking,
  onOpenCustomTrip,
  onTrackBooking,
}) => {
  const { t, direction, language } = useLanguage();

  return (
    <section className="py-16 sm:py-20 bg-[#FBF9F5] border-b border-[#EAE4D9]" dir={direction}>
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <div className="relative rounded-3xl bg-gradient-to-br from-[#0D1B2A] via-[#1B263B] to-[#0D1B2A] text-white p-8 sm:p-14 border border-[#D4AF37]/40 shadow-2xl overflow-hidden text-center">
          
          {/* Subtle luxury glow effect */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#1B263B]/60 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto">
            {/* Unboxed kicker */}
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#D4AF37] uppercase mb-4">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
              <span>PEGASUS Hurghada</span>
            </div>

            {/* Main title */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-[#FBF9F5] tracking-tight leading-tight mb-4">
              {t('cta.title')}
            </h2>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto mb-8 font-light leading-relaxed">
              {t('cta.subtitle')}
            </p>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3.5">
              <button
                type="button"
                onClick={() => onOpenBooking('airport_pickup')}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl gold-animated-gradient animate-soft-glow text-[#0D1B2A] font-black text-sm sm:text-base shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <Car className="w-5 h-5 text-[#0D1B2A]" />
                <span>{t('cta.bookTransfer')}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>

              {onOpenCustomTrip && (
                <button
                  type="button"
                  onClick={onOpenCustomTrip}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#FBF9F5] hover:text-[#D4AF37] border border-white/20 hover:border-[#D4AF37]/50 font-semibold text-sm sm:text-base backdrop-blur-xs transition cursor-pointer"
                >
                  <Sliders className="w-4 h-4 text-[#D4AF37]" />
                  <span>{t('cta.buildTrip')}</span>
                </button>
              )}

              {onTrackBooking && (
                <button
                  type="button"
                  onClick={onTrackBooking}
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-transparent hover:bg-white/5 text-slate-300 hover:text-white border border-white/15 text-xs sm:text-sm font-medium transition cursor-pointer"
                >
                  <Search className="w-4 h-4 text-[#D4AF37]" />
                  <span>{t('cta.trackBooking')}</span>
                </button>
              )}
            </div>

            {/* Discreet reassurance footer */}
            <div className="pt-8 mt-8 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                <span>{language === 'ru' ? 'Лицензированные водители' : language === 'ar' ? 'سائقون مرخصون' : language === 'de' ? 'Lizenzierte Fahrer' : 'Licensed Chauffeurs'}</span>
              </div>
              <span className="hidden sm:inline text-slate-600">•</span>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#D4AF37]" />
                <span>{language === 'ru' ? 'Прямая координация в Хургаде' : language === 'ar' ? 'مكتب تنسيق مباشر في الغردقة' : language === 'de' ? 'Direkte Koordination vor Ort' : 'Direct Hurghada Coordination'}</span>
              </div>
              <span className="hidden sm:inline text-slate-600">•</span>
              <span>{language === 'ru' ? 'Предоплата не требуется' : language === 'ar' ? 'لا يشترط دفع مسبق' : language === 'de' ? 'Keine Vorauszahlung erforderlich' : 'No Prepayment Required'}</span>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
