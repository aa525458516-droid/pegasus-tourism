import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { getCompanySettings, getWhatsAppLink } from '../services/settingsService';
import { HAS_REAL_IMAGES } from '../config/images';
import { 
  Phone, 
  MessageCircle, 
  Globe, 
  Menu, 
  X, 
  ShieldCheck, 
  Compass, 
  Search,
  Car,
  ChevronDown,
  UserCheck
} from 'lucide-react';
import { Language } from '../types';
import { InstagramIcon, TikTokIcon, useSocialMediaLinks } from './SocialLinks';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenBooking: (serviceType?: string, preselectedTourId?: string) => void;
  onOpenTrackBooking: () => void;
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  onOpenBooking,
  onOpenTrackBooking,
  onOpenAdmin,
}) => {
  const { language, setLanguage, t, direction } = useLanguage();
  const { isAdmin } = useAuth();
  const companySettings = getCompanySettings();

  const social = useSocialMediaLinks();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const navItems = [
    { id: 'home', label: t('nav.home') },
    { id: 'transfers', label: t('nav.transfers') },
    { id: 'tours', label: t('nav.tours') },
    { id: 'customTrip', label: t('nav.buildTrip') },
    { id: 'about', label: t('nav.about') },
    ...(HAS_REAL_IMAGES.gallery ? [{ id: 'gallery', label: t('nav.gallery') }] : []),
    { id: 'contact', label: t('nav.contact') },
  ];

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'ar', label: 'العربية', flag: '🇪🇬' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  ];

  const currentLangObj = languages.find(l => l.code === language) || languages[0];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const whatsappUrl = getWhatsAppLink(
    companySettings.whatsapp,
    'Hello PEGASUS Hurghada, I would like to inquire about a private transfer'
  );

  return (
    <header className="sticky top-0 z-40 bg-[#FBF9F5]/95 backdrop-blur-md border-b border-[#EAE4D9]/80 shadow-xs transition-all">
      {/* Top micro bar for VIP dispatch contact */}
      <div className="bg-[#0D1B2A] text-[#E0E1DD] text-xs py-1.5 px-4 sm:px-8 border-b border-[#D4AF37]/30">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-[#D4AF37] font-medium tracking-wide">
              <Compass className="w-3.5 h-3.5" />
              <span>{t('hero.badge')}</span>
            </span>
            <span className="hidden md:inline text-slate-500">•</span>
            <span className="hidden md:inline text-slate-300">
              {language === 'ru'
                ? 'Частный трансфер из аэропорта Хургады (HRG)'
                : language === 'ar'
                ? 'خدمة التوصيل الخاص من مطار الغردقة الدولي (HRG)'
                : language === 'de'
                ? 'Privater Chauffeur ab Flughafen Hurghada (HRG)'
                : "Hurghada Int'l Airport (HRG) Private Chauffeur"}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={onOpenTrackBooking}
              className="inline-flex items-center gap-1.5 text-slate-300 hover:text-[#D4AF37] transition cursor-pointer"
            >
              <Search className="w-3 h-3 text-[#D4AF37]" />
              <span>{t('nav.trackBooking')}</span>
            </button>

            <span className="text-slate-600">|</span>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#25D366] hover:text-[#2fe673] font-medium transition"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>

            {isAdmin && (
              <span className="bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1">
                <UserCheck className="w-3 h-3" /> Admin
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2 text-left rtl:text-right group cursor-pointer focus:outline-hidden shrink-0"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden bg-[#0D1B2A] border border-[#D4AF37]/60 shadow-md group-hover:border-[#D4AF37] transition shrink-0 flex items-center justify-center p-0.5">
            <img src="/logo.png" alt="PEGASUS Tourism" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="text-lg sm:text-xl font-bold tracking-widest text-[#0D1B2A] font-heading flex items-center gap-1.5 whitespace-nowrap">
              PEGASUS
              <span className="text-[#D4AF37] text-[10px] font-semibold tracking-normal font-sans border border-[#D4AF37]/40 px-1.5 py-0.5 rounded-sm bg-[#D4AF37]/10">
                TOURISM
              </span>
            </span>
            <span className="hidden 2xl:block text-[10px] uppercase tracking-wider text-slate-500 font-medium truncate max-w-[180px]">
              {t('nav.tagline')}
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden min-[1400px]:flex items-center justify-center gap-0.5 flex-1 min-w-0">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-2 2xl:px-2.5 py-1.5 rounded-md text-xs 2xl:text-[13px] font-medium whitespace-nowrap transition cursor-pointer shrink-0 ${
                  isActive
                    ? 'text-[#0D1B2A] bg-[#EAE4D9]/60 font-semibold border-b-2 border-[#D4AF37]'
                    : 'text-[#4A5568] hover:text-[#0D1B2A] hover:bg-[#F3EFEA]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Actions & Language Switcher */}
        <div className="hidden sm:flex items-center gap-1.5 2xl:gap-2 shrink-0">
          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-md border border-[#EAE4D9] bg-white text-xs font-medium text-[#1A2332] hover:border-[#D4AF37] transition shadow-2xs cursor-pointer"
              title="Select Language"
            >
              <Globe className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{currentLangObj.flag}</span>
              <span className="font-semibold">{currentLangObj.code.toUpperCase()}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {langDropdownOpen && (
              <div
                className={`absolute ${direction === 'rtl' ? 'left-0' : 'right-0'} mt-1.5 w-36 bg-white rounded-lg shadow-xl border border-[#EAE4D9] py-1.5 z-50`}
                onMouseLeave={() => setLangDropdownOpen(false)}
              >
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.code);
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left rtl:text-right hover:bg-[#F8F5EE] transition ${
                      language === l.code ? 'font-bold text-[#0D1B2A] bg-[#F4EFE6]' : 'text-slate-700'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{l.flag}</span>
                      <span>{l.label}</span>
                    </span>
                    {language === l.code && <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Track Booking prominent CTA button */}
          <button
            onClick={onOpenTrackBooking}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#F8F5EE] text-[#0D1B2A] border border-[#D4AF37] text-xs font-bold whitespace-nowrap shadow-2xs hover:shadow-xs transition cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{t('nav.trackBooking')}</span>
          </button>

          {/* Book Transfer CTA */}
          <button
            onClick={() => onOpenBooking('airport_pickup')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg gold-animated-gradient text-[#0D1B2A] text-xs font-black whitespace-nowrap shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Car className="w-4 h-4 text-[#0D1B2A]" />
            <span>{t('nav.bookNow')}</span>
          </button>

          {/* Admin link */}
          <button
            onClick={onOpenAdmin}
            className={`p-2 rounded-lg border transition cursor-pointer ${
              currentTab === 'admin'
                ? 'bg-[#0D1B2A] text-[#D4AF37] border-[#D4AF37]'
                : 'border-[#EAE4D9] text-slate-600 hover:text-[#0D1B2A] hover:bg-white'
            }`}
            title={t('nav.admin')}
          >
            <ShieldCheck className="w-4 h-4" />
          </button>

          {/* Tablet / Medium screen drawer trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="min-[1400px]:hidden p-2 rounded-lg border border-[#EAE4D9] bg-white text-slate-700 focus:outline-hidden cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex sm:hidden items-center gap-2 shrink-0">
          <button
            onClick={() => {
              const next: Record<Language, Language> = { en: 'de', de: 'ar', ar: 'ru', ru: 'en' };
              setLanguage(next[language as Language] || 'en');
            }}
            className="px-2 py-1 rounded border border-[#EAE4D9] bg-white text-xs font-semibold"
          >
            {currentLangObj.flag} {language.toUpperCase()}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg border border-[#EAE4D9] bg-white text-slate-700 focus:outline-hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile & Tablet drawer */}
      {mobileMenuOpen && (
        <div className="min-[1400px]:hidden bg-[#FBF9F5] border-b border-[#EAE4D9] px-5 py-4 shadow-xl animate-in slide-in-from-top duration-200">
          <div className="flex flex-col gap-2 mb-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left rtl:text-right py-2.5 px-3 rounded-lg text-sm font-medium transition ${
                  currentTab === item.id
                    ? 'bg-[#0D1B2A] text-[#D4AF37] font-semibold'
                    : 'text-slate-800 hover:bg-[#EAE4D9]/50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-[#EAE4D9] flex flex-col gap-2.5">
            <button
              onClick={() => {
                onOpenBooking('airport_pickup');
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 px-4 rounded-lg bg-[#0D1B2A] text-[#FBF9F5] font-semibold text-sm flex items-center justify-center gap-2 border border-[#D4AF37]"
            >
              <Car className="w-4 h-4 text-[#D4AF37]" />
              <span>{t('nav.bookNow')}</span>
            </button>

            <button
              onClick={() => {
                onOpenTrackBooking();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2 px-4 rounded-lg border border-[#EAE4D9] bg-white text-slate-800 text-sm font-medium flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4 text-[#D4AF37]" />
              <span>{t('nav.trackBooking')}</span>
            </button>

            <button
              onClick={() => {
                onOpenAdmin();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2 px-4 rounded-lg border border-[#EAE4D9] bg-white text-slate-700 text-sm font-medium flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-slate-500" />
              <span>{t('nav.admin')}</span>
            </button>

            <div className="pt-2 border-t border-[#EAE4D9] flex items-center justify-center gap-3">
              <a
                href={social.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram @pegasus_eg2"
                className="flex-1 py-2 px-3 rounded-lg border border-[#EAE4D9] bg-white text-slate-700 hover:border-[#D4AF37] hover:text-[#0D1B2A] text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <InstagramIcon className="w-4 h-4 text-[#E1306C]" />
                <span>@{social.instagramHandle}</span>
              </a>
              <a
                href={social.tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok @pegasus_eg2"
                className="flex-1 py-2 px-3 rounded-lg border border-[#EAE4D9] bg-white text-slate-700 hover:border-[#D4AF37] hover:text-[#0D1B2A] text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <TikTokIcon className="w-4 h-4 text-[#0D1B2A]" />
                <span>@{social.tiktokHandle}</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
