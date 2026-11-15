import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getCompanySettings, getWhatsAppLink, subscribeToCompanySettings, COMPANY_SOCIAL_LINKS } from '../services/settingsService';
import { HAS_REAL_IMAGES } from '../config/images';
import { 
  ShieldCheck, 
  Phone, 
  Mail, 
  MessageCircle, 
  MapPin, 
  Globe, 
  Lock,
  ArrowUp,
  Car,
  Code2
} from 'lucide-react';
import { InstagramIcon, TikTokIcon } from './SocialLinks';

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
  const [companySettings, setCompanySettings] = useState(getCompanySettings());

  useEffect(() => {
    const unsub = subscribeToCompanySettings(setCompanySettings);
    return () => unsub();
  }, []);

  const instagramUrl = companySettings.socialMedia?.instagramUrl || COMPANY_SOCIAL_LINKS.instagramUrl;
  const instagramHandle = companySettings.socialMedia?.instagramHandle || COMPANY_SOCIAL_LINKS.instagramHandle;
  const tiktokUrl = companySettings.socialMedia?.tiktokUrl || COMPANY_SOCIAL_LINKS.tiktokUrl;
  const tiktokHandle = companySettings.socialMedia?.tiktokHandle || COMPANY_SOCIAL_LINKS.tiktokHandle;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const whatsappUrl = getWhatsAppLink(
    companySettings.whatsapp,
    'Hello PEGASUS Hurghada, inquiry from website footer'
  );

  return (
    <footer className="bg-[#0D1B2A] text-slate-300 pt-16 pb-8 border-t border-[#D4AF37]/30" dir={direction}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Col 1: Brand & About */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#1B263B] border border-[#D4AF37] flex items-center justify-center p-0.5 shadow-md shrink-0">
                <img src="/logo.png" alt="PEGASUS Tourism" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="text-2xl font-bold font-heading text-white tracking-widest flex items-center gap-2">
                  PEGASUS
                  <span className="text-[#D4AF37] text-[10px] font-sans border border-[#D4AF37]/50 px-1.5 py-0.5 rounded-sm">
                    EGYPT
                  </span>
                </span>
                <span className="block text-[10px] uppercase tracking-wider text-[#D4AF37]">
                  {t('nav.tagline')}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              {t('footer.about')}
            </p>

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

              <a
                href="/logo.png"
                download="pegasus-luxury-logo.png"
                className="px-3 py-2 rounded-lg bg-[#1B263B] hover:bg-[#253652] text-[#D4AF37] font-semibold text-xs border border-[#D4AF37]/50 transition flex items-center gap-1.5"
                title="Download official logo PNG"
              >
                <img src="/logo.png" alt="" className="w-3.5 h-3.5 object-contain" />
                <span>
                  {language === 'ru'
                    ? 'Скачать логотип (PNG)'
                    : language === 'ar'
                    ? 'تحميل اللوجو (PNG)'
                    : language === 'de'
                    ? 'Logo herunterladen (PNG)'
                    : 'Download Logo (PNG)'}
                </span>
              </a>
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
                  onClick={() => onNavigate('customTrip')}
                  className="hover:text-[#D4AF37] transition cursor-pointer"
                >
                  {t('nav.buildTrip')}
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
              {HAS_REAL_IMAGES.gallery && (
                <li>
                  <button
                    onClick={() => onNavigate('gallery')}
                    className="hover:text-[#D4AF37] transition cursor-pointer"
                  >
                    {t('nav.gallery')}
                  </button>
                </li>
              )}
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
              <li>{language === 'ru' ? 'Аэропорт Хургады (HRG)' : language === 'ar' ? 'مطار الغردقة (HRG)' : language === 'de' ? 'Flughafen Hurghada (HRG)' : 'Hurghada Airport (HRG)'}</li>
              <li>{language === 'ru' ? 'Эль-Гуна Марина и курорты' : language === 'ar' ? 'الجونة ومنتجعاتها' : language === 'de' ? 'El Gouna Marina & Resorts' : 'El Gouna Marina & Resorts'}</li>
              <li>{language === 'ru' ? 'Макади-Бэй и Сахль-Хашиш' : language === 'ar' ? 'مكادي باي وسهل حشيش' : language === 'de' ? 'Makadi Bay & Sahl Hasheesh' : 'Makadi Bay & Sahl Hasheesh'}</li>
              <li>{language === 'ru' ? 'Сома-Бэй и порт Сафага' : language === 'ar' ? 'سوما باي وميناء سفاجا' : language === 'de' ? 'Soma Bay & Safaga Hafen' : 'Soma Bay & Safaga Port'}</li>
              <li>{language === 'ru' ? 'Марса-Алам и Порт-Галиб' : language === 'ar' ? 'مرسى علم وبورت غالب' : language === 'de' ? 'Marsa Alam & Port Ghalib' : 'Marsa Alam & Port Ghalib'}</li>
              <li>{language === 'ru' ? 'Луксор — Долина Царей' : language === 'ar' ? 'الأقصر ووادي الملوك' : language === 'de' ? 'Luxor & Tal der Könige' : 'Luxor Valley of the Kings'}</li>
              <li>{language === 'ru' ? 'Каир и пирамиды Гизы' : language === 'ar' ? 'القاهرة وأهرامات الجيزة' : language === 'de' ? 'Kairo & Pyramiden von Gizeh' : 'Cairo & Giza Pyramids'}</li>
            </ul>
          </div>

          {/* Col 4: Direct Contacts from Settings */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold font-heading text-white uppercase tracking-wider text-[#D4AF37]">
              {language === 'ru'
                ? 'Контакты и бронь'
                : language === 'ar'
                ? 'التواصل والحجز'
                : language === 'de'
                ? 'Kontakt & Buchung'
                : 'Contact & Booking'}
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                <a href={`tel:${companySettings.phone}`} className="text-slate-300 font-mono text-[11px] hover:text-[#D4AF37] transition" dir="ltr">
                  {companySettings.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
                <a 
                  href={whatsappUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-slate-300 font-mono text-[11px] hover:text-[#25D366] transition"
                  dir="ltr"
                >
                  {companySettings.whatsapp} (WhatsApp)
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                <a href={`mailto:${companySettings.email}`} className="text-slate-300 hover:text-[#D4AF37] transition" dir="ltr">
                  {companySettings.email}
                </a>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block mb-2">
                {t('social.followUs')}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Instagram @${instagramHandle}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-200 hover:text-[#D4AF37] border border-white/10 transition text-[11px] font-medium"
                >
                  <InstagramIcon className="w-3.5 h-3.5 text-[#E1306C]" />
                  <span>@{instagramHandle}</span>
                </a>
                <a
                  href={tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`TikTok @${tiktokHandle}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-200 hover:text-[#D4AF37] border border-white/10 transition text-[11px] font-medium"
                >
                  <TikTokIcon className="w-3.5 h-3.5 text-white" />
                  <span>@{tiktokHandle}</span>
                </a>
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
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-start">
            <p>© {new Date().getFullYear()} PEGASUS Hurghada. {t('footer.rights')}</p>
            <span className="hidden sm:inline text-slate-700">•</span>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400">
              <Code2 className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="text-[11px] font-medium tracking-wide">
                {t('footer.developer')}
              </span>
            </div>
          </div>

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
              <span>|</span>
              <button
                onClick={() => setLanguage('ru')}
                className={`transition ${language === 'ru' ? 'text-[#D4AF37] font-bold' : 'hover:text-white'}`}
              >
                RU
              </button>
            </div>

            <button
              onClick={scrollToTop}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
              title="Back to top"
              aria-label="Back to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
