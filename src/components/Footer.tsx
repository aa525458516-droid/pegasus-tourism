import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  ShieldCheck, 
  Phone, 
  Mail, 
  MessageCircle, 
  MapPin, 
  Globe, 
  Lock,
  ArrowUp,
  Car
} from 'lucide-react';
import { Language } from '../types';

interface FooterProps {
  onNavigate: (tab: string) => void;
  onOpenBooking: () => void;
  onOpenAdmin: () => void;
  onOpenTrackBooking: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenBooking,
  onOpenAdmin,
  onOpenTrackBooking,
}) => {
  const { t, language, setLanguage, direction } = useLanguage();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0D1B2A] text-slate-300 pt-16 pb-8 border-t border-[#D4AF37]/30" dir={direction}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Col 1: Brand & Ministry of Tourism */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1B263B] to-[#0D1B2A] border border-[#D4AF37] flex items-center justify-center text-[#D4AF37]">
                <svg
                  className="w-6 h-6 text-[#D4AF37]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 12c4-2 8-5 13-10-1 4-1 9 5 12-4 1-7 2-10 6-1-3-2-6-8-8z" />
                  <path d="M7 16c2 1 4 3 6 4" />
                  <path d="M12 9c2-1 4-1 6 0" />
                </svg>
              </div>
              <div>
                <span className="text-2xl font-bold font-heading text-white tracking-widest">
                  PEGASUS
                </span>
                <span className="block text-[10px] uppercase tracking-wider text-[#D4AF37]">
                  Hurghada VIP Chauffeur & Excursions
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              {t('footer.about')}
            </p>

            <div className="flex items-center gap-2 pt-2 text-xs text-[#D4AF37]">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>License: [Insert Ministry of Tourism License No. - Editable]</span>
            </div>

            <div className="pt-2 flex flex-wrap gap-2">
              <button
                onClick={onOpenBooking}
                className="px-4 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#ECC974] text-[#0D1B2A] font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <Car className="w-3.5 h-3.5" />
                <span>{t('nav.bookNow')}</span>
              </button>

              <button
                onClick={onOpenTrackBooking}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium text-xs border border-white/20 transition cursor-pointer"
              >
                {t('nav.trackBooking')}
              </button>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold font-heading text-white uppercase tracking-wider text-[#D4AF37]">
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-[#D4AF37] transition cursor-pointer"
                >
                  {t('nav.home')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('transfers')}
                  className="hover:text-[#D4AF37] transition cursor-pointer"
                >
                  {t('nav.transfers')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('tours')}
                  className="hover:text-[#D4AF37] transition cursor-pointer"
                >
                  {t('nav.tours')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-[#D4AF37] transition cursor-pointer"
                >
                  {t('nav.about')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('gallery')}
                  className="hover:text-[#D4AF37] transition cursor-pointer"
                >
                  {t('nav.gallery')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-[#D4AF37] transition cursor-pointer"
                >
                  {t('nav.contact')}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Popular Destinations */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold font-heading text-white uppercase tracking-wider text-[#D4AF37]">
              {t('footer.destinations')}
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Hurghada Airport (HRG)</li>
              <li>El Gouna Marina & Resorts</li>
              <li>Makadi Bay & Sahl Hasheesh</li>
              <li>Soma Bay & Safaga Port</li>
              <li>Marsa Alam & Port Ghalib</li>
              <li>Luxor Valley of the Kings</li>
              <li>Cairo & Giza Pyramids</li>
            </ul>
          </div>

          {/* Col 4: Dispatch Contacts */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold font-heading text-white uppercase tracking-wider text-[#D4AF37]">
              24/7 Operations
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                <span>[Insert Hurghada Office Address - Editable]</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
                <span className="text-slate-300 font-mono text-[11px]">
                  +20 [Insert WhatsApp Hotline - Editable]
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                <span className="text-slate-300">
                  info@[company-domain.com - Editable]
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onOpenAdmin}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-[#D4AF37] transition cursor-pointer"
              >
                <Lock className="w-3 h-3 text-[#D4AF37]" />
                <span>{t('nav.admin')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} PEGASUS Hurghada Luxury Tourism. {t('footer.rights')}</p>

          <div className="flex items-center gap-4">
            {/* Language switch shortcuts */}
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <button
                onClick={() => setLanguage('en')}
                className={`transition ${language === 'en' ? 'text-[#D4AF37] font-bold' : 'hover:text-white'}`}
              >
                EN
              </button>
              <span>|</span>
              <button
                onClick={() => setLanguage('de')}
                className={`transition ${language === 'de' ? 'text-[#D4AF37] font-bold' : 'hover:text-white'}`}
              >
                DE
              </button>
              <span>|</span>
              <button
                onClick={() => setLanguage('ar')}
                className={`transition ${language === 'ar' ? 'text-[#D4AF37] font-bold' : 'hover:text-white'}`}
              >
                العربية
              </button>
            </div>

            <button
              onClick={scrollToTop}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
              title="Back to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
