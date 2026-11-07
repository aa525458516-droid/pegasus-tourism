import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
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
  Calendar,
  ChevronDown,
  UserCheck
} from 'lucide-react';
import { Language } from '../types';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const navItems = [
    { id: 'home', label: t('nav.home') },
    { id: 'transfers', label: t('nav.transfers') },
    { id: 'tours', label: t('nav.tours') },
    { id: 'customTrip', label: t('nav.buildTrip') },
    { id: 'track', label: t('nav.trackBooking') },
    { id: 'about', label: t('nav.about') },
    { id: 'gallery', label: t('nav.gallery') },
    { id: 'contact', label: t('nav.contact') },
  ];

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'ar', label: 'العربية', flag: '🇪🇬' },
  ];

  const currentLangObj = languages.find(l => l.code === language) || languages[0];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FBF9F5]/95 backdrop-blur-md border-b border-[#EAE4D9]/80 shadow-xs transition-all">
      {/* Top micro bar for VIP dispatch contact & license note */}
      <div className="bg-[#0D1B2A] text-[#E0E1DD] text-xs py-1.5 px-4 sm:px-8 border-b border-[#D4AF37]/30">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-[#D4AF37] font-medium tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t('hero.badge')}</span>
            </span>
            <span className="hidden md:inline text-slate-500">•</span>
            <span className="hidden md:inline text-slate-300">
              Hurghada Int'l Airport (HRG) 24/7 VIP Chauffeur
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
              href="https://wa.me/201000000000?text=Hello%20PEGASUS%20Hurghada%2C%20I%20would%20like%20to%20inquire%20about%20a%20private%20transfer"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#25D366] hover:text-[#2fe673] font-medium transition"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">WhatsApp 24/7</span>
            </a>

            {isAdmin && (
              <span className="bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1">
                <UserCheck className="w-3 h-3" /> Admin Active
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-3 text-left rtl:text-right group cursor-pointer focus:outline-hidden"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0D1B2A] to-[#1B263B] border border-[#D4AF37]/40 flex items-center justify-center shadow-md text-[#D4AF37] group-hover:border-[#D4AF37] transition">
            {/* Elegant stylized Pegasus wing / crest icon */}
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
            <span className="text-2xl font-bold tracking-widest text-[#0D1B2A] font-heading flex items-center gap-1">
              PEGASUS
              <span className="text-[#D4AF37] text-xs font-semibold tracking-normal font-sans border border-[#D4AF37]/40 px-1.5 py-0.2 rounded-sm bg-[#D4AF37]/10">
                VIP
              </span>
            </span>
            <span className="block text-[10px] uppercase tracking-wider text-slate-500 font-medium">
              {t('nav.tagline')}
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition cursor-pointer ${
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
        <div className="hidden sm:flex items-center gap-3">
          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-[#EAE4D9] bg-white text-xs font-medium text-[#1A2332] hover:border-[#D4AF37] transition shadow-2xs cursor-pointer"
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
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-[#F8F5EE] text-[#0D1B2A] border border-[#D4AF37] text-xs font-bold shadow-2xs hover:shadow-xs transition cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{t('nav.trackBooking')}</span>
          </button>

          {/* Book Transfer VIP CTA */}
          <button
            onClick={() => onOpenBooking('airport_pickup')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#0D1B2A] to-[#1B263B] text-[#FBF9F5] hover:text-[#D4AF37] text-xs sm:text-sm font-semibold shadow-md hover:shadow-lg border border-[#D4AF37]/50 hover:border-[#D4AF37] transition cursor-pointer"
          >
            <Car className="w-4 h-4 text-[#D4AF37]" />
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
        </div>

        {/* Mobile menu trigger */}
        <div className="flex sm:hidden items-center gap-2">
          {/* Quick mobile language pill */}
          <button
            onClick={() => {
              const next: Record<Language, Language> = { en: 'de', de: 'ar', ar: 'en' };
              setLanguage(next[language]);
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

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-[#FBF9F5] border-b border-[#EAE4D9] px-5 py-4 shadow-xl animate-in slide-in-from-top duration-200">
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
          </div>
        </div>
      )}
    </header>
  );
};
